import { contextBridge, ipcRenderer } from "electron";

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("main", {
  send: (channel: string, data: unknown) => {
    // whitelist channels
    const validChannels = ["kb-input", "beep", "shutdown"];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  getAppVersion: () => getArg("--VP_APP_VERSION"),
  getNoI18n: () => getArg("--VP_NO_I18N") === "true",
  getEnv: () => getArg("--VP_ENV"),
  getHeapEnvId: () => getArg("--VP_HEAP_ENV_ID"),
});

function getArg(argName: string) {
  for (const arg of process.argv) {
    const parts = arg.split("=");
    if (parts[0].toLowerCase() === argName.toLowerCase()) {
      return parts[1];
    }
  }
}
