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

const MEMO = new Map<string, string>();
const STORAGE_PREFIX = 'tf.crest.';

function read(url: string): string | null {
  const live = MEMO.get(url);
  if (live) return live;
  try {
    const stored = localStorage.getItem(STORAGE_PREFIX + url);
    if (stored) { MEMO.set(url, stored); return stored; }
  } catch {
    // Blocked site data: derive it each session instead of remembering it.
  }
  return null;
}

function write(url: string, colour: string): void {
  MEMO.set(url, colour);
  try { localStorage.setItem(STORAGE_PREFIX + url, colour); } catch { /* as above */ }
}

/**
 * The most present strongly-coloured hue in the image.
 *
 * Near-white, near-black and unsaturated pixels are skipped — a badge is mostly
 * outline and background, and averaging those returns mud. Remaining pixels are
 * bucketed by hue and weighted by how colourful they are, so a small vivid
 * crest beats a large pale wash.
 */
function dominantColour(image: HTMLImageElement): string | null {
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

  const buckets = new Map<number, { weight: number; r: number; g: number; b: number }>();

  for (let i = 0; i < pixels.length; i += 4) {
    if (pixels[i + 3] < 200) continue;
    const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2];
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const saturation = max === 0 ? 0 : (max - min) / max;
    const value = max / 255;
    if (saturation < 0.35 || value < 0.18 || value > 0.96) continue;

    let hue = 0;
    if (max !== min) {
      if (max === r) hue = ((g - b) / (max - min)) % 6;
      else if (max === g) hue = (b - r) / (max - min) + 2;
      else hue = (r - g) / (max - min) + 4;
      hue = (hue * 60 + 360) % 360;
    }

    const key = Math.round(hue / 18);
    const bucket = buckets.get(key) ?? { weight: 0, r: 0, g: 0, b: 0 };
    const weight = saturation * value;
    bucket.weight += weight;
    bucket.r += r * weight;
    bucket.g += g * weight;
    bucket.b += b * weight;
    buckets.set(key, bucket);
  }

  let best: { weight: number; r: number; g: number; b: number } | null = null;
  for (const bucket of buckets.values()) if (!best || bucket.weight > best.weight) best = bucket;
  if (!best || best.weight === 0) return null;

  const channel = (total: number) => Math.round(total / best!.weight).toString(16).padStart(2, '0');
  return `#${channel(best.r)}${channel(best.g)}${channel(best.b)}`;
}

/** Resolves a badge's colour, from cache when possible. */
export async function teamColour(logoUrl: string | null, code: string): Promise<string> {
  if (!logoUrl) return tintFor(code);
  const cached = read(logoUrl);
  if (cached) return cached;

  const image = new Image();
  image.crossOrigin = 'anonymous';
  // The optimiser serves the badge same-origin, which keeps the canvas clean.
  image.src = `/_next/image?url=${encodeURIComponent(logoUrl)}&w=64&q=75`;

  try {
    await image.decode();
  } catch {
    return tintFor(code);
  }

  const colour = dominantColour(image) ?? tintFor(code);
  write(logoUrl, colour);
  return colour;
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
 */
export function heroGradient(homeColour: string, awayColour: string): string {
  return [
    `linear-gradient(103deg, color-mix(in srgb, ${homeColour} 24%, transparent) 0%, transparent 62%)`,
    `linear-gradient(257deg, color-mix(in srgb, ${awayColour} 24%, transparent) 0%, transparent 62%)`,
    'var(--nav-surface)',
  ].join(', ');
}
