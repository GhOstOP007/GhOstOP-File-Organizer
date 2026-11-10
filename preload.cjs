const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld(
  "studio",
  Object.fromEntries(
    ["choose", "demo", "scan", "apply", "undo", "open"].map((name) => [
      name,
      (arg) => ipcRenderer.invoke(name, arg),
    ]),
  ),
);
