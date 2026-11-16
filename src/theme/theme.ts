export type ThemePreference = "auto" | "light" | "dark";
export const themeStorageKey = "masamasa:theme:v1";
const validPreference = (value: string | null): ThemePreference => value === "light" || value === "dark" ? value : "auto";
function readPreference(): ThemePreference {
  try { return validPreference(window.localStorage.getItem(themeStorageKey)); }
  catch { return "auto"; }
}
let preference: ThemePreference = typeof window === "undefined" ? "auto" : readPreference();
const systemTheme = typeof window !== "undefined" && typeof window.matchMedia === "function"
  ? window.matchMedia("(prefers-color-scheme: dark)") : null;
const listeners = new Set<() => void>();

export function resolveTheme(choice: ThemePreference, systemDark: boolean): "light" | "dark" {
  return choice === "auto" ? (systemDark ? "dark" : "light") : choice;
}
function applyTheme() {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.mmThemePreference = preference;
  document.documentElement.dataset.mmTheme = resolveTheme(preference, systemTheme?.matches ?? false);
}
function publish() {
  applyTheme();
  listeners.forEach(listener => listener());
}
export function setThemePreference(choice: ThemePreference) {
  preference = choice;
  try { window.localStorage.setItem(themeStorageKey, choice); }
  catch { /* The selection still works in the current page when storage is blocked. */ }
  publish();
}
export function getThemePreference(): ThemePreference { return preference; }
export function subscribeTheme(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
export function getServerThemePreference(): ThemePreference { return "auto"; }

if (typeof window !== "undefined") {
  applyTheme();
  if (systemTheme?.addEventListener) systemTheme.addEventListener("change", publish);
  else systemTheme?.addListener(publish);
  window.addEventListener("storage", event => {
    if ((event.key === themeStorageKey || event.key === null) && (!event.storageArea || event.storageArea === window.localStorage)) {
      preference = validPreference(event.key === null ? null : event.newValue);
      publish();
    }
  });
  // Refresh the resolved system preference when a PWA resumes from the background.
  window.addEventListener("pageshow", applyTheme);
  window.addEventListener("focus", applyTheme);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) applyTheme(); });
}
