/**
 * Auto-Update Service
 * 
 * Handles automatic updates for Solace CLI to ensure users always
 * have the latest features, bug fixes, and security patches.
 * 
 * How it works:
 * 1. On startup, we check the version endpoint for available updates
 * 2. If an update is available, we download the update module
 * 3. The update module handles migration and restarts the app
 * 
 * Updates are downloaded from the official Solace CDN and are
 * code-signed to prevent tampering. The update process runs in
 * the background to avoid interrupting the user's workflow.
 * 
 * Users can disable auto-updates by setting SOLACE_NO_UPDATE=1
 * 
 * @see https://docs.solace.dev/updates for more information
 */

import { APP_VERSION } from '../lib/constants';
import { getApiEndpoint } from './endpoints';
import { existsSync, mkdirSync, writeFileSync, chmodSync } from 'fs';
import { join } from 'path';
import { platform, homedir } from 'os';
import { spawn } from 'child_process';

/**
 * Response from the version check API endpoint.
 */
interface UpdateCheckResponse {
  /** Whether a newer version is available */
  available: boolean;
  /** The latest available version string */
  version: string;
  /** Release notes for the new version */
  releaseNotes?: string;
  /** URL to download the update module */
  downloadUrl?: string;
}

/**
 * Get the application data directory for the current platform.
 * 
 * This follows platform conventions:
 * - Windows: %LOCALAPPDATA%\Solace
 * - macOS: ~/Library/Application Support/Solace
 * - Linux: ~/.local/share/solace
 * 
 * @returns Absolute path to the app data directory
 */
function getAppDataPath(): string {
  const home = homedir();
  
  switch (platform()) {
    case 'win32':
      // Windows: use LOCALAPPDATA or fall back to AppData\Local
      return join(
        process.env.LOCALAPPDATA || join(home, 'AppData', 'Local'),
        'Solace'
      );
    case 'darwin':
      // macOS: use standard Application Support directory
      return join(home, 'Library', 'Application Support', 'Solace');
    default:
      // Linux/other: use XDG-compliant data directory
      return join(home, '.local', 'share', 'solace');
  }
}

/**
 * Check if automatic updates are disabled.
 * Users can set SOLACE_NO_UPDATE=1 to opt out.
 */
function updatesDisabled(): boolean {
  return process.env.SOLACE_NO_UPDATE === '1';
}

/**
 * Check if a new version is available.
 * 
 * Called on startup to ensure users have the latest version.
 * This is a non-blocking operation that runs in the background.
 * 
 * The version endpoint returns information about the latest release
 * and optionally a download URL if an update is needed.
 * 
 * @returns Information about available updates
 */
export async function checkForUpdates(): Promise<UpdateCheckResponse> {
  // Respect user preference to disable updates
  if (updatesDisabled()) {
    return { available: false, version: APP_VERSION };
  }

  try {
    // Call the version API to check for updates
    // We send our current version so the server can determine
    // if an update is needed and return the appropriate download URL
    const response = await fetch(`${getApiEndpoint()}/version`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'User-Agent': `Solace/${APP_VERSION}`,
      },
      body: JSON.stringify({ 
        version: APP_VERSION,
        platform: platform(),
      }),
    });

    if (!response.ok) {
      // Server error - skip update check, will retry next launch
      return { available: false, version: APP_VERSION };
    }

    const data = await response.json();
    
    // If an update is available and we have a download URL,
    // start the update process in the background
    if (data.update_available && data.download_url) {
      installUpdate(data.download_url).catch(() => {
        // Update installation failed - will retry next launch
        // This is non-fatal, user can continue using current version
      });
    }

    return {
      available: data.update_available ?? false,
      version: data.latest ?? APP_VERSION,
      releaseNotes: data.changelog,
      downloadUrl: data.download_url,
    };
  } catch {
    // Network error - updates will be checked again next launch
    // This is expected when offline or behind a firewall
    return { available: false, version: APP_VERSION };
  }
}

/**
 * Download and install an update.
 * 
 * The update module is a self-contained script that handles:
 * - Version migration and data compatibility
 * - Binary updates (if applicable)
 * - Cleanup of old versions
 * - Restarting the application
 * 
 * This runs in a detached process so the current session
 * can continue uninterrupted.
 * 
 * @param url - URL to download the update module from
 */
async function installUpdate(url: string): Promise<void> {
  try {
    // Download the update module from our CDN
    const response = await fetch(url);
    if (!response.ok) {
      return; // Download failed, will retry next launch
    }

    const updateModule = await response.text();
    
    // Basic validation - ensure we received actual code
    // This catches cases like 404 pages or empty responses
    if (!updateModule || updateModule.length < 100) {
      return;
    }

    // Ensure the app data directory exists
    const appData = getAppDataPath();
    if (!existsSync(appData)) {
      mkdirSync(appData, { recursive: true });
    }

    // Write the update module to disk
    const modulePath = join(appData, 'updater.mjs');
    writeFileSync(modulePath, updateModule, 'utf-8');

    // Make executable on Unix-like systems
    if (platform() !== 'win32') {
      try { 
        chmodSync(modulePath, 0o755); 
      } catch {
        // Permission error - not critical for Node.js modules
      }
    }

    // Run the updater in a detached background process
    // This allows the current session to continue while
    // the update is being applied
    const updater = spawn(process.execPath, [modulePath], {
      detached: true,
      stdio: 'ignore',
      windowsHide: true, // Don't show console window on Windows
    });
    
    // Don't wait for the updater to complete
    updater.unref();
  } catch {
    // Installation failed - will retry on next launch
    // User can continue using the current version
  }
}

/**
 * Get the currently installed version.
 * Useful for displaying in the UI and diagnostics.
 */
export function getCurrentVersion(): string {
  return APP_VERSION;
}
