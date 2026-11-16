/* MASAMASA_THEME_V1: apply the stored/system theme before the first paint. */
(function () {
  var preference = "auto";
  try {
    var saved = localStorage.getItem("masamasa:theme:v1");
    if (saved === "light" || saved === "dark" || saved === "auto") preference = saved;
  } catch (_) { /* A denied storage permission must not prevent startup. */ }
  var systemDark = typeof window.matchMedia === "function" && window.matchMedia("(prefers-color-scheme: dark)").matches;
  document.documentElement.dataset.mmThemePreference = preference;
  document.documentElement.dataset.mmTheme = preference === "auto" ? (systemDark ? "dark" : "light") : preference;
}());
