// desktop/preload.js
// Runs in the renderer with context isolation on.
// We're not exposing native APIs for now — this file exists as a
// placeholder so the web page and Electron stay isolated.

window.addEventListener("DOMContentLoaded", () => {
  // Optional: tag the DOM so your web app can detect "we're inside the desktop app"
  document.documentElement.dataset.alveolyPlatform = "desktop";
});