# Forex Lab PH — Windows desktop app

## Install

Download `Forex-Lab-PH-<version>-Windows-x64.exe` from the matching GitHub Release and run it. The installer is an assisted NSIS installer built by electron-builder.

No Node.js, npm, Git, or Terminal is required for normal use.

## Updates

Windows releases keep a stable NSIS installer GUID:

`E8A7C955-2B4F-4A31-9A12-2C53A0F0B0E4`

That GUID must never change after the first Windows release. It identifies Forex Lab PH for upgrade/uninstall operations. Installing a newer version replaces the older installed program files instead of creating a separate app installation.

User learning progress and downloaded market data are stored under Electron's Windows user-data directory, separate from the installed program files. Upgrades intentionally preserve those files.

The app clears version-specific Electron HTTP/code/GPU caches when the app version changes.

## Historical data

Inside the desktop app, Practice can install either:

- Starter data: EUR/USD, GBP/USD, USD/JPY
- Full data: starter pairs plus AUD/USD, USD/CAD, USD/CHF

The app downloads real 2020–2025 M15 bid OHLC from Dukascopy via `dukascopy-node`, then aggregates H1/H4 locally.

## Signing boundary

The first direct Windows build is unsigned. Windows SmartScreen may therefore show a warning such as **Windows protected your PC**. A future Authenticode code-signing certificate can remove that distribution friction without changing the app/data architecture.

## Build

```bash
npm install
npm run check
npm run desktop:build:win
```

GitHub Actions builds the Windows x64 installer on `windows-latest`, uploads the `.exe` and ZIP as workflow artifacts, and on `main` attaches them to the matching versioned GitHub Release.
