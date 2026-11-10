# GhOstOP Studio v0.1

First release of the GhOstOP LAB desktop file organizer. Internal application version: 0.1.0.

## Download and run

Download **GhOstOP Studio Setup 0.1.0.exe** and run the Windows x64 installer. Create a demo folder to try the app before choosing your own files.

## Included

- Top-level folder scanning and file-type sorting.
- Preview destinations, change categories, and exclude individual files.
- Collision-safe file organization and persistent undo for the latest sort.
- Disposable demo files for testing and screen recording.
- Optional local Ollama classification, with labeled file-type fallback.

## Known limitations

- Local AI requires Ollama and a separately installed model. No model is bundled.
- AI reads filenames and up to 6 KB of TXT, MD, CSV or JSON content. PDFs and images use filenames only.
- No background folder watching or recursive sorting.
- Undo retains the latest sort only. Files changed after sorting are left untouched during undo.
- File moves require a filesystem supporting hard links, such as NTFS.
- The installer is unsigned. Windows may display an unknown-publisher warning.

## Validation

Four automated tests pass, covering file collisions, changed files, destination validation, undo conflicts, and mocked AI response/fallback behavior. The desktop demo organized and restored all eight sample files. Live Ollama inference has not been verified.

SHA256SUMS.txt contains checksums for the installer and source archive.
