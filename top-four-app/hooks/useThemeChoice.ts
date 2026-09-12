'use client';

import { useEffect, useState } from 'react';
import { readThemeChoice, applyThemeChoice, resolveTheme, type ThemeChoice } from '@/lib/theme';

/**
 * The appearance choice, shared by every control that offers it.
 *
 * Two controls now set this — the row on Me and the button in the nav — and
 * they have to agree about what "system" means, so the media listener lives
 * here rather than in whichever component happened to need it first.
 *
 * The stored choice is only readable in the browser, so the first render
 * matches the server's and the real value arrives on mount.
 */
export function useThemeChoice(): [ThemeChoice, (next: ThemeChoice) => void] {
  /*
   * `null` until storage has been read, and that distinction matters.
   *
   * Starting at `'system'` and syncing eagerly looked equivalent and was not:
   * on the first mount the effect below ran before the stored value arrived,
   * decided the choice was "system", and overwrote a stored dark with whatever
   * the device preferred. The init script had already applied the right theme;
   * this undid it one tick later.
   */
  const [choice, setChoice] = useState<ThemeChoice | null>(null);

  useEffect(() => { setChoice(readThemeChoice()); }, []);

  // Follow the device while the choice is "system" — the default. Without this
  // the theme is decided once at load and a device that switches to dark in the
  // evening leaves the app in light until it is reloaded.
  useEffect(() => {
    if (choice !== 'system') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const sync = () => { document.documentElement.dataset.theme = resolveTheme('system'); };
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, [choice]);

  // Before the read, report the default — which is what the server rendered.
  return [choice ?? 'system', (next: ThemeChoice) => { setChoice(next); applyThemeChoice(next); }];
}
