const fs = require('node:fs');
const path = require('node:path');
const { PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD } = require('next/constants');

/**
 * A lock naming the dev server that owns `.next`.
 *
 * `next build` and `next dev` write to the same directory. Running a build
 * while the dev server is live tears it: the build clears the dev artifacts,
 * and the dev server afterwards only recompiles routes as they are requested.
 * Everything that was not requested resolves to not-found — the app answers 404
 * for pages that compile perfectly well, which reads as a code defect and is
 * not one. That cost a full debugging pass to find, so it is now refused.
 *
 * The check lives here rather than in a `prebuild` script because `npx next
 * build` bypasses npm scripts entirely, and that is the way in that caused it.
 * This file is loaded by both phases however they are invoked.
 */
const DIST_DIR = process.env.NEXT_DIST_DIR || '.next';

/* The lock sits inside the build directory it describes, so a build aimed at a
   different one looks for a lock there, finds none, and is correctly let past.
   That is what makes the escape hatch in the message below actually work. */
const LOCK = path.join(__dirname, DIST_DIR, 'dev-server.lock');

/** True when the process that wrote the lock is still running. */
function holderAlive(pid) {
  try {
    // Signal 0 checks for the process without touching it.
    process.kill(pid, 0);
    return true;
  } catch (error) {
    // EPERM means it exists but belongs to another user, which still counts.
    return error.code === 'EPERM';
  }
}

function claimLock() {
  try {
    const existing = Number.parseInt(fs.readFileSync(LOCK, 'utf8'), 10);
    // Keep the first live claim: the dev server loads this file in more than
    // one process, and the first is the one worth naming.
    if (Number.isInteger(existing) && holderAlive(existing)) return;
  } catch {
    // No lock yet, or an unreadable one. Either way this process claims it.
  }

  try {
    fs.mkdirSync(path.dirname(LOCK), { recursive: true });
    fs.writeFileSync(LOCK, String(process.pid));
  } catch {
    // A dev server that cannot write the lock should still start; the guard
    // degrades to off rather than blocking work.
    return;
  }

  const release = () => {
    try {
      if (fs.readFileSync(LOCK, 'utf8') === String(process.pid)) fs.unlinkSync(LOCK);
    } catch {
      // Already gone, or `.next` was removed underneath us.
    }
  };

  process.once('exit', release);
  for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP']) {
    process.once(signal, () => { release(); process.exit(0); });
  }
}

/**
 * Whether this process is actually going to build.
 *
 * `next lint` loads the config under the production-build phase as well, and it
 * writes nothing to the build directory — so the phase on its own is not enough
 * to tell a build from a command that merely reads the config. The first
 * positional argument is.
 */
function isBuildCommand() {
  const args = process.argv.slice(2).filter(arg => !arg.startsWith('-'));
  return args[0] === 'build';
}

function refuseIfDevServerIsRunning() {
  if (!isBuildCommand()) return;

  let pid;
  try {
    pid = Number.parseInt(fs.readFileSync(LOCK, 'utf8'), 10);
  } catch {
    return;
  }
  // A lock left behind by a killed dev server names a pid that is gone, so a
  // crash cannot block every later build.
  if (!Number.isInteger(pid) || !holderAlive(pid)) return;

  throw new Error(
    `\n\n  next build refused: a dev server (pid ${pid}) is using .next.\n\n`
    + '  Building now would tear that directory and the running app would start\n'
    + '  answering 404 for routes it has not recompiled.\n\n'
    + '  Stop the dev server first, or build into a directory of its own:\n'
    + '      NEXT_DIST_DIR=.next-build npx next build\n\n'
    + `  If no dev server is actually running, delete ${path.relative(__dirname, LOCK)}.\n`,
  );
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: DIST_DIR,
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'assets.topfour.app',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',

        // If not set, it defaults to the staging API
        destination: `${process.env.API_TARGET_URL || 'https://api.topfour.app/v1'}/:path*`,
      },
    ];
  },
};

module.exports = (phase) => {
  if (phase === PHASE_DEVELOPMENT_SERVER) claimLock();
  if (phase === PHASE_PRODUCTION_BUILD) refuseIfDevServerIsRunning();
  return nextConfig;
};
