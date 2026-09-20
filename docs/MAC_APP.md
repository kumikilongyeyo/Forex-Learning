# Forex Lab PH — macOS desktop build

## User install

1. Open the latest GitHub Release.
2. Download `Forex-Lab-PH-<version>-universal.pkg`.
3. Double-click the package and install to Applications.
4. Open **Forex Lab PH**.
5. In Practice, click **Install Starter Data**. No Node.js or Terminal is required.

The app is currently an unsigned direct-distribution build. If macOS blocks first launch, Control-click the app in Applications, choose **Open**, then confirm once.

## Updating

Install the newer `.pkg` over the existing app. The package uses `overwriteAction: upgrade`, so the installed app bundle is atomically replaced and obsolete paths from the old bundle are removed.

Persistent user state is intentionally outside the app bundle:

- lesson/drill/session progress: Electron browser storage under Application Support
- historical datasets: `~/Library/Application Support/Forex Lab PH/market-data/`

On version changes the app also clears Electron version caches (`Code Cache`, `GPUCache`, HTTP cache) while preserving progress and market data.

The installer does **not** delete arbitrary files in `~/Downloads`; deleting user downloads automatically would be unsafe.

## Signing note

The current build uses ad-hoc app signing and an unsigned PKG. Fully silent in-app auto-update on macOS requires a Developer ID signed app; electron-updater explicitly requires macOS code signing. Until signing credentials are added, **Check for Updates** opens the trusted GitHub Releases page and the newer PKG performs the clean replacement.
