// Plain (server-safe) module: the layout inlines this before the page paints.
const A11Y_KEY = "rp-a11y";

// Runs in <head> before the page paints, so saved settings never flash the wrong theme.
export const A11Y_INIT_SCRIPT = `(function(){try{
var p=JSON.parse(localStorage.getItem("${A11Y_KEY}")||"null")||{};
var h=document.documentElement;
var t=p.theme||(typeof p.dark==="boolean"?(p.dark?"dark":"light"):"system");
if(t==="dark"||(t==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches))h.classList.add("dark");
if(p.contrast)h.setAttribute("data-contrast","high");
if(p.dys)h.setAttribute("data-font","dys");
if(p.reduceMotion)h.setAttribute("data-motion","reduced");
}catch(e){}})();`;
