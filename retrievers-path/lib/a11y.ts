// Accessibility preferences, saved in this browser and applied to <html>:
//   .dark               dark colors
//   data-contrast="high" high-contrast colors
//   data-font="dys"      Atkinson Hyperlegible everywhere
export type A11yPrefs = { dark: boolean; contrast: boolean; dys: boolean };

export const A11Y_KEY = "rp-a11y";

export function applyPrefs(p: A11yPrefs) {
  const html = document.documentElement;
  html.classList.toggle("dark", p.dark);
  if (p.contrast) html.setAttribute("data-contrast", "high"); else html.removeAttribute("data-contrast");
  if (p.dys) html.setAttribute("data-font", "dys"); else html.removeAttribute("data-font");
}

export function currentPrefs(): A11yPrefs {
  const html = document.documentElement;
  return {
    dark: html.classList.contains("dark"),
    contrast: html.getAttribute("data-contrast") === "high",
    dys: html.getAttribute("data-font") === "dys",
  };
}

export function savePrefs(p: A11yPrefs) {
  try { localStorage.setItem(A11Y_KEY, JSON.stringify(p)); } catch { /* storage blocked: still works for this visit */ }
}

// Runs in <head> before the page paints, so saved settings never flash the wrong theme.
// With nothing saved yet, dark mode follows the computer's system setting.
export const A11Y_INIT_SCRIPT = `(function(){try{
var p=JSON.parse(localStorage.getItem("${A11Y_KEY}")||"null")||{};
var h=document.documentElement;
var dark=typeof p.dark==="boolean"?p.dark:window.matchMedia("(prefers-color-scheme: dark)").matches;
if(dark)h.classList.add("dark");
if(p.contrast)h.setAttribute("data-contrast","high");
if(p.dys)h.setAttribute("data-font","dys");
}catch(e){}})();`;
