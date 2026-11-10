# GhOstOP Studio

A Windows desktop file organizer for the first GhOstOP LAB video.

[Download v0.1 for Windows](https://github.com/GhOstOP007/GhOstOP-File-Organizer/releases/tag/v0.1)

This repository contains the general file organizer. The separate GhOstOP-Studio repository contains the earlier travel-photo organizer.

## Run

Use Node.js 22.12 or later. From this directory:

```powershell
npm install
npm start
```

Click **Create demo folder**, **Analyze folder**, review destinations, and **Organize files**. Use **Open in Explorer** to show the result, and **Undo last sort** to restore files. Demo files live in the app's user-data directory and are real disposable samples.

## Local AI

Install Ollama separately and pull a model (for example `ollama pull llama3.2:3b`). Select Local AI and enter the installed model name. The app calls only `127.0.0.1:11434`. Names and up to 6 KB of TXT/MD/CSV/JSON text are sent to that local service. Images and PDFs are classified by name, not their contents. Errors fall back to extension rules and are labeled in the preview. Models are not bundled in the installer.

## Behavior and limits

- Scans only regular files at the selected folder's top level. Skips dotfiles, subfolders and symbolic links.
- Preview can exclude files or change their categories. Nothing moves until Organize is clicked.
- Duplicate destination names receive numeric suffixes. Existing files are never overwritten.
- Uses same-volume hard links followed by unlink; unsupported filesystems report an error and leave the source in place.
- Undo history persists across restart for the latest organization operation only. Starting another sort replaces that history. Changed files or occupied original paths are left for manual review.
- This version runs on demand; it does not watch folders in the background. File-system operations are not a multi-file transaction. Avoid editing the chosen folder during sorting.
- Installer is unsigned. SmartScreen may flag downloaded builds.

## Development

`npm test` tests real file operations in disposable temporary folders. `npm run dist` produces a Windows NSIS installer in `dist/`.

Implementation references: [Electron security](https://www.electronjs.org/docs/latest/tutorial/security/) and [Ollama structured outputs](https://ollama.com/blog/structured-outputs).
