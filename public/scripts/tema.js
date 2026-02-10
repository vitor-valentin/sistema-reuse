const root = document.documentElement;
const key = "theme";

function applyTheme(theme) {
  if (theme === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
}

let saved = localStorage.getItem(key);

if (!saved) {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  saved = prefersDark ? "dark" : "light";
  localStorage.setItem(key, saved);
}

applyTheme(saved);

function bindThemeControls() {
  const claro = document.getElementById("tema-claro");
  const escuro = document.getElementById("tema-escuro");

  if (!claro || !escuro) return;

  if (saved === "dark") escuro.checked = true;
  else claro.checked = true;

  claro.addEventListener("change", () => {
    if (claro.checked) {
      saved = "light";
      localStorage.setItem(key, saved);
      applyTheme(saved);
    }
  });

  escuro.addEventListener("change", () => {
    if (escuro.checked) {
      saved = "dark";
      localStorage.setItem(key, saved);
      applyTheme(saved);
    }
  });
}

document.addEventListener("DOMContentLoaded", bindThemeControls);
