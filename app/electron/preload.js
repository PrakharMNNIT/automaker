const { contextBridge, ipcRenderer } = require("electron");

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electronAPI", {
  // IPC test
  ping: () => ipcRenderer.invoke("ping"),

  // Dialog APIs
  openDirectory: () => ipcRenderer.invoke("dialog:openDirectory"),
  openFile: (options) => ipcRenderer.invoke("dialog:openFile", options),

  // File system APIs
  readFile: (filePath) => ipcRenderer.invoke("fs:readFile", filePath),
  writeFile: (filePath, content) =>
    ipcRenderer.invoke("fs:writeFile", filePath, content),
  mkdir: (dirPath) => ipcRenderer.invoke("fs:mkdir", dirPath),
  readdir: (dirPath) => ipcRenderer.invoke("fs:readdir", dirPath),
  exists: (filePath) => ipcRenderer.invoke("fs:exists", filePath),
  stat: (filePath) => ipcRenderer.invoke("fs:stat", filePath),

  // App APIs
  getPath: (name) => ipcRenderer.invoke("app:getPath", name),
});

// Also expose a flag to detect if we're in Electron
contextBridge.exposeInMainWorld("isElectron", true);
