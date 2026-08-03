// Marketing palette (public site, pre-auth screens) — monochrome, with red
// reserved as the one non-monochrome color for error/incorrect states.
export const INK = "#0A0A0A"; // near-black — gradient start, primary surfaces
export const CHARCOAL = "#262626"; // dark gray — gradient end, secondary blobs
export const CHALK = "#FFFFFF"; // white — primary accent, "correct" signal
export const SMOKE = "#9CA3AF"; // mid gray — secondary accent, labels

// Dashboard "stadium" palette (scoped via the `.dark` theme — see globals.css)
export const PITCH_DARK = "#0A0A0A";
export const STADIUM_CHARCOAL = "#1A1A1A";
export const MATCHDAY_CHALK = CHALK; // same hex as CHALK, kept as its own name for stadium-theme call sites

// Gamified Pitch Accents — Electric Green Pitch Glow
export const PITCH_GREEN = "#00FF66"; // vibrant electric pitch green
export const PITCH_GREEN_MUTED = "#10B981"; // emerald pitch green
export const PITCH_GREEN_GLOW = "rgba(0, 255, 102, 0.25)"; // glowing background effect

export const ERROR_RED = "#F5372A"; // incorrect predictions / destructive states only

