'use strict';

/*
 * Minimal preload for future desktop-only integrations.
 * The game does not need Node access; keep the exposed API tiny and read-only.
 */
const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('echoVeinDesktop', {
  isElectron: true,
  platform: process.platform
});
