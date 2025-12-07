const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require("fs/promises");

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
    titleBarStyle: "hiddenInset",
    backgroundColor: "#0a0a0a",
  });

  // Load Next.js dev server in development or production build
  const isDev = !app.isPackaged;
  if (isDev) {
    mainWindow.loadURL("http://localhost:3000");
    // mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "../.next/server/app/index.html"));
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// IPC Handlers

// Dialog handlers
ipcMain.handle("dialog:openDirectory", async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ["openDirectory", "createDirectory"],
  });
  return result;
});

ipcMain.handle("dialog:openFile", async (_, options = {}) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ["openFile"],
    ...options,
  });
  return result;
});

// File system handlers
ipcMain.handle("fs:readFile", async (_, filePath) => {
  try {
    const content = await fs.readFile(filePath, "utf-8");
    return { success: true, content };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle("fs:writeFile", async (_, filePath, content) => {
  try {
    await fs.writeFile(filePath, content, "utf-8");
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle("fs:mkdir", async (_, dirPath) => {
  try {
    await fs.mkdir(dirPath, { recursive: true });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle("fs:readdir", async (_, dirPath) => {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    const result = entries.map((entry) => ({
      name: entry.name,
      isDirectory: entry.isDirectory(),
      isFile: entry.isFile(),
    }));
    return { success: true, entries: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle("fs:exists", async (_, filePath) => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
});

ipcMain.handle("fs:stat", async (_, filePath) => {
  try {
    const stats = await fs.stat(filePath);
    return {
      success: true,
      stats: {
        isDirectory: stats.isDirectory(),
        isFile: stats.isFile(),
        size: stats.size,
        mtime: stats.mtime,
      },
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// App data path
ipcMain.handle("app:getPath", (_, name) => {
  return app.getPath(name);
});

// IPC ping for testing communication
ipcMain.handle("ping", () => {
  return "pong";
});
