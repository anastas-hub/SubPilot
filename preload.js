const { contextBridge } = require("electron");
const fs = require("fs");
const path = require("path");

function getAppVersion() {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, "package.json"), "utf8"));
    return pkg.version || "";
  } catch (e) {
    return "";
  }
}

contextBridge.exposeInMainWorld("subpilot", {
  version: getAppVersion(),
});
