export function updateThemeMode(value: "light" | "dark") {
  const doc = document.documentElement;
  doc.classList.add("disable-transitions");
  doc.classList.toggle("dark", value === "dark");
  requestAnimationFrame(() => {
    doc.classList.remove("disable-transitions");
  });
}

export function updateThemePreset(value: string) {
  const doc = document.documentElement;
  doc.classList.add("disable-transitions");
  
  if (value && value !== "default") {
    doc.setAttribute("data-theme-preset", value);
  } else {
    // Remove attribute for default theme
    doc.removeAttribute("data-theme-preset");
  }
  
  requestAnimationFrame(() => {
    doc.classList.remove("disable-transitions");
  });
}
