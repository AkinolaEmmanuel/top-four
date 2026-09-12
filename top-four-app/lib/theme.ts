export type ThemeChoice = 'system' | 'light' | 'dark';

export const THEME_STORAGE_KEY = 'tf.theme';

/**
 * Theme resolution, done before first paint.
 *
 * The token file already carries the full light palette on `:root` with dark
 * as an override, so nothing here defines colours — it only decides which of
 * the two the document is in. "system" is resolved here rather than in a
 * `prefers-color-scheme` block so the dark values live in exactly one place.
 *
 * Inlined in <head> and run synchronously: a stored dark choice applied after
 * hydration means a white flash on every load.
 *
 * Every fallback path lands on the device's own preference, never on a fixed
 * theme: "system" is the default and blocked site data should not change that.
 */
export const THEME_INIT_SCRIPT = `(function(){try{
var c=localStorage.getItem('${THEME_STORAGE_KEY}')||'system';
var d=c==='dark'||(c==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);
document.documentElement.dataset.theme=d?'dark':'light';
}catch(e){
try{document.documentElement.dataset.theme=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}
catch(e2){document.documentElement.dataset.theme='light';}
}})();`;

export function resolveTheme(choice: ThemeChoice): 'light' | 'dark' {
  if (choice !== 'system') return choice;
  return typeof window !== 'undefined'
    && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function readThemeChoice(): ThemeChoice {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
  } catch {
    // Private mode and blocked site data both throw here; system is the right
    // answer when we cannot remember a choice.
  }
  return 'system';
}

export function applyThemeChoice(choice: ThemeChoice): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, choice);
  } catch {
    // The choice still applies to this page; it just will not be remembered.
  }
  document.documentElement.dataset.theme = resolveTheme(choice);
}
