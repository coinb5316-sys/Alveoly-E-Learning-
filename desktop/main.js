// desktop/main.js
const { app, BrowserWindow, shell, Menu } = require("electron");
const path = require("path");

const APP_URL = "https://alveolye-learning.academy";
const APP_NAME = "Alveoly E Learning";

// A modern Chrome UA so Google's OAuth popup doesn't detect Electron
// and block the flow with "disallowed_useragent" / stuck on /gsi/transform.
const CHROME_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: APP_NAME,
    backgroundColor: "#0b0b14",
    autoHideMenuBar: true,
    icon: path.join(__dirname, "build", "icon.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      // Allow popup windows (Google OAuth needs this)
      nativeWindowOpen: true,
      // Spoof a real browser so Google lets the popup complete
      userAgent: CHROME_UA,
    },
    show: false,
  });

  // Show window only when content is ready (avoids white flash)
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  // Load the live site
  mainWindow.loadURL(APP_URL);

  // ---- Handle window.open / target="_blank" ----
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    // 1. Google OAuth popups — must open INSIDE the app so the popup
    //    can post the token back to the main window.
    if (
      url.startsWith("https://accounts.google.com") ||
      url.startsWith("https://content.googleapis.com") ||
      url.startsWith("https://oauth2.googleapis.com") ||
      url.startsWith("https://apis.google.com")
    ) {
      return {
        action: "allow",
        overrideBrowserWindowOptions: {
          width: 520,
          height: 640,
          autoHideMenuBar: true,
          backgroundColor: "#ffffff",
          parent: mainWindow,
          modal: false,
          webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: true,
            userAgent: CHROME_UA,
          },
        },
      };
    }

    // 2. Same-domain popups stay in the app
    if (
      url.startsWith(APP_URL) ||
      url.startsWith("https://alveolye-learning.academy") ||
      url.startsWith("https://www.alveolye-learning.academy")
    ) {
      return { action: "allow" };
    }

    // 3. Everything else (payment gateways, mailto:, etc.) goes to system browser
    shell.openExternal(url);
    return { action: "deny" };
  });

  // ---- Handle top-level navigation to external domains ----
  mainWindow.webContents.on("will-navigate", (event, url) => {
    const isInternal =
      url.startsWith(APP_URL) ||
      url.startsWith("https://alveolye-learning.academy") ||
      url.startsWith("https://www.alveolye-learning.academy") ||
      url.startsWith("https://alveoly-platform-sunu.onrender.com") ||
      url.startsWith("https://alveoly-e-learning-o2qq.onrender.com") ||
      url.startsWith("https://alveoly-e-learning-755w.onrender.com") ||
      // Allow Google domains (some OAuth steps do top-level navigation)
      url.startsWith("https://accounts.google.com") ||
      url.startsWith("https://content.googleapis.com");

    if (!isInternal) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  // ---- Handle load failures gracefully ----
  mainWindow.webContents.on(
    "did-fail-load",
    (event, errorCode, errorDescription) => {
      if (errorCode === -3) return; // -3 = user aborted, ignore
      mainWindow.loadURL(
        `data:text/html;charset=utf-8,${encodeURIComponent(`
        <!doctype html>
        <html>
          <head>
            <meta charset="utf-8" />
            <title>${APP_NAME}</title>
            <style>
              body {
                margin: 0;
                height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                background: #0b0b14;
                color: #e5e7eb;
              }
              .box { text-align: center; max-width: 420px; padding: 32px; }
              h1 { font-size: 18px; margin: 0 0 12px; font-weight: 600; }
              p { font-size: 14px; color: #9ca3af; margin: 0 0 20px; }
              button {
                padding: 10px 20px;
                font-size: 14px;
                border-radius: 8px;
                border: 0;
                background: #7c3aed;
                color: white;
                cursor: pointer;
              }
              button:hover { background: #6d28d9; }
            </style>
          </head>
          <body>
            <div class="box">
              <h1>Unable to connect</h1>
              <p>Please check your internet connection and try again.</p>
              <button onclick="location.reload()">Retry</button>
            </div>
          </body>
        </html>
      `)}`
      );
    }
  );

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// Single-instance lock — prevent multiple copies
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    // Remove the default application menu on Windows/Linux
    if (process.platform !== "darwin") {
      Menu.setApplicationMenu(null);
    }
    createWindow();
  });

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
}