'use client';

import { tintFor } from './crest';

/**
 * A team's colour, taken from its own badge.
 *
 * The API carries no team colour, so the app shipped a hand-written table of
 * eight clubs and a grey fallback — which meant nearly every fixture drew the
 * same grey on both sides, and the two mirrored hero gradients met in a
 * visible seam instead of blending two teams.
 *
 * Reading it off the badge is a stopgap: the right home for an accent colour is
 * beside `logoUrl` in the API, and it is on the backend ask. Until then the
 * badge is the only source of truth we have.
 *
 * Badge URLs are content-hashed, so a colour is cached against the URL forever;
 * only the first sighting of a team pays for the decode.
 */

/**
 * What a badge yields: one colour, and a second one when the club really has
 * two. Crystal Palace is the case that forced this — a red-and-blue badge whose
 * single dominant hue came back red, so the hero told a blue club it was red.
 * Picking one of two colours is a coin toss; keeping both is the club.
 */
export interface TeamPalette {
  primary: string;
  /** Null when the badge has one colour, or when the runner-up was noise. */
  secondary: string | null;
}

const MEMO = new Map<string, string>();
/**
 * Bumped when the extraction changes.
 *
 * The key is the badge URL, which is content-hashed and so never changes — a
 * team already in a reader's cache would otherwise keep the colour the old
 * single-hue pass gave it and never see this one.
 */
const STORAGE_PREFIX = 'tf.crest3.';

/** Stored as one field so an older single-colour entry still reads. */
function parse(stored: string): TeamPalette {
  const [primary, secondary] = stored.split('|');
  return { primary, secondary: secondary || null };
}

function read(url: string): TeamPalette | null {
  const live = MEMO.get(url);
  if (live) return parse(live);
  try {
    const stored = localStorage.getItem(STORAGE_PREFIX + url);
    if (stored) { MEMO.set(url, stored); return parse(stored); }
  } catch {
    // Blocked site data: derive it each session instead of remembering it.
  }
  return null;
}

function write(url: string, palette: TeamPalette): void {
  const stored = palette.secondary ? `${palette.primary}|${palette.secondary}` : palette.primary;
  MEMO.set(url, stored);
  try { localStorage.setItem(STORAGE_PREFIX + url, stored); } catch { /* as above */ }
}

/**
 * How much of the winner's weight a runner-up needs to count as a real colour.
 *
 * Below this it is trim — the gold on a crest, the white of a stripe's edge
 * catching a neighbouring hue — and promoting it would put a colour in the hero
 * the club does not wear.
 */
const SECOND_COLOUR_SHARE = 0.35;

/**
 * And how far from the winner it has to sit, in degrees of hue.
 *
 * Two adjacent buckets are usually one colour split by shading. A club's second
 * colour is a different colour, not a darker version of the first.
 */
const SECOND_COLOUR_DISTANCE = 45;

/**
 * The strongly-coloured hues in the image, most present first.
 *
 * Near-white, near-black and unsaturated pixels are skipped — a badge is mostly
 * outline and background, and averaging those returns mud. Remaining pixels are
 * bucketed by hue and weighted by how colourful they are, so a small vivid
 * crest beats a large pale wash.
 */
function dominantColours(image: HTMLImageElement): TeamPalette | null {
  const size = 48;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return null;

  context.drawImage(image, 0, 0, size, size);

  let pixels: Uint8ClampedArray;
  try {
    pixels = context.getImageData(0, 0, size, size).data;
  } catch {
    // A cross-origin badge taints the canvas. Ours are same-origin through the
    // image optimiser, but a direct URL would land here.
    return null;
  }

  const BUCKET_DEGREES = 18;
  const BUCKET_COUNT = 360 / BUCKET_DEGREES;
  const buckets = new Map<number, { weight: number; r: number; g: number; b: number }>();

  for (let i = 0; i < pixels.length; i += 4) {
    if (pixels[i + 3] < 200) continue;
    const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2];
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const saturation = max === 0 ? 0 : (max - min) / max;
    const value = max / 255;
    /* No upper bound on value. `value` here is max channel, not lightness, so a
       pure vivid colour reads 1.0 — the old `> 0.96` clause was meant to drop
       near-white and instead dropped the brightest pixel of every badge, which
       is why a red club came back a muddy brown. White cannot reach this line
       anyway: it has no saturation. */
    if (saturation < 0.35 || value < 0.18) continue;

    let hue = 0;
    if (max !== min) {
      if (max === r) hue = ((g - b) / (max - min)) % 6;
      else if (max === g) hue = (b - r) / (max - min) + 2;
      else hue = (r - g) / (max - min) + 4;
      hue = (hue * 60 + 360) % 360;
    }

    /* Floor, not round, and wrapped. Rounding produced one bucket more than the
       circle has: hue 355 landed in key 20 and hue 5 in key 0, so red — the one
       hue that straddles zero — was split in two and lost to any club whose
       colour sat in the middle of a bucket. */
    const key = Math.floor(hue / BUCKET_DEGREES) % BUCKET_COUNT;
    const bucket = buckets.get(key) ?? { weight: 0, r: 0, g: 0, b: 0 };
    const weight = saturation * value;
    bucket.weight += weight;
    bucket.r += r * weight;
    bucket.g += g * weight;
    bucket.b += b * weight;
    buckets.set(key, bucket);
  }

  const ranked = [...buckets.entries()]
    .map(([key, bucket]) => ({ key, ...bucket }))
    .sort((a, b) => b.weight - a.weight);

  const best = ranked[0];
  if (!best || best.weight === 0) return null;

  const hex = (bucket: { weight: number; r: number; g: number; b: number }) => {
    const channel = (total: number) => Math.round(total / bucket.weight).toString(16).padStart(2, '0');
    return `#${channel(bucket.r)}${channel(bucket.g)}${channel(bucket.b)}`;
  };

  // Hue is a circle, so the distance between two buckets is the shorter way round.
  const apart = (a: number, b: number) => {
    const steps = Math.abs(a - b);
    return Math.min(steps, BUCKET_COUNT - steps) * BUCKET_DEGREES;
  };

  const second = ranked.slice(1).find(bucket =>
    bucket.weight >= best.weight * SECOND_COLOUR_SHARE
    && apart(bucket.key, best.key) >= SECOND_COLOUR_DISTANCE);

  return { primary: hex(best), secondary: second ? hex(second) : null };
}

/** Resolves a badge's palette, from cache when possible. */
export async function teamPalette(logoUrl: string | null, code: string): Promise<TeamPalette> {
  const fallback = (): TeamPalette => ({ primary: tintFor(code), secondary: null });
  if (!logoUrl) return fallback();
  const cached = read(logoUrl);
  if (cached) return cached;

  const image = new Image();
  image.crossOrigin = 'anonymous';
  // The optimiser serves the badge same-origin, which keeps the canvas clean.
  image.src = `/_next/image?url=${encodeURIComponent(logoUrl)}&w=64&q=75`;

  try {
    await image.decode();
  } catch {
    return fallback();
  }

  const palette = dominantColours(image) ?? fallback();
  write(logoUrl, palette);
  return palette;
}

/**
 * The two-team hero wash.
 *
 * Two things are being balanced. The stops run past halfway so the sides
 * overlap rather than butt — at 52% they met edge to edge, and with both teams
 * falling back to the same grey that meeting read as a drawn rule across the
 * middle of the fixture. And the wash is kept weak because the badges now sit
 * on it without a plate behind them: at 40% a blue club disappeared into its
 * own colour.
 *
 * A two-colour club gets both, its second colour handed the middle of its own
 * half. It is never blended with the first — mixing Palace's red and blue gives
 * a purple neither half of the club wears.
 */
function side(palette: TeamPalette, angle: number): string {
  const wash = (colour: string, strength: number) =>
    `color-mix(in srgb, ${colour} ${strength}%, transparent)`;

  return palette.secondary
    ? `linear-gradient(${angle}deg, ${wash(palette.primary, 24)} 0%, ${wash(palette.secondary, 19)} 30%, transparent 62%)`
    : `linear-gradient(${angle}deg, ${wash(palette.primary, 24)} 0%, transparent 62%)`;
}

export function heroGradient(home: TeamPalette, away: TeamPalette): string {
  return [side(home, 103), side(away, 257), 'var(--nav-surface)'].join(', ');
}
