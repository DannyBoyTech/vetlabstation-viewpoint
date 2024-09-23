"use strict";

module.exports = {
  packagerConfig: {
    prune: false,
    ignore: ["node_modules"],
    extraResource: ["../ui/dist"],
    name: "viewpoint-app-win7",
    executableName: "viewpoint",
    icon: "icons/viewpoint",
  },
  makers: [
    {
      name: "@electron-forge/maker-zip",
      platforms: ["darwin", "win32"],
    },
  ],
};
