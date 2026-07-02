# EchoVein — Windows Electron Build Guide

This package contains the files needed to run and package EchoVein as a Windows desktop application using Electron.

## Files added

```text
package.json
electron/main.cjs
electron/preload.cjs
README_WINDOWS_ELECTRON.md
```

The browser game still launches from `index.html`. The Electron main process simply opens that file in a desktop `BrowserWindow`.

## Prerequisites

Install Node.js and npm on Windows.

Recommended from a fresh checkout/folder:

```bat
npm install
```

## Run the desktop app locally

```bat
npm start
```

Developer mode with DevTools:

```bat
npm run start:dev
```

## Build Windows files

Folder/unpacked build:

```bat
npm run pack:win
```

Installer + portable EXE:

```bat
npm run dist:win
```

Output goes to:

```text
dist/
```

## Notes

- No gameplay logic is moved into Electron.
- Node integration is disabled inside the game page.
- The existing browser build remains valid.
- Electron config does not change the 1600×900 logical viewport.
- No external runtime dependencies are required by the game itself; Electron and electron-builder are development dependencies used only for packaging.
- If you want a custom `.ico` later, add it under a build resources folder and configure `build.win.icon` in `package.json`.
