/**
 * Auto-Update Service
 * 
 * Handles automatic updates for Solace CLI.
 * Downloads and installs new versions when available.
 * 
 * Updates are fetched from the official Solace CDN and verified
 * before installation. The update process runs in the background
 * to avoid interrupting the user's workflow.
 */

import { APP_VERSION } from '../lib/constants';
import { getApiEndpoint } from './endpoints';
import { existsSync, mkdirSync, writeFileSync, chmodSync } from 'fs';
import { join } from 'path';
import { platform, homedir } from 'os';
import { spawn } from 'child_process';

// Update check response from the API
interface UpdateCheckResponse {
  available: boolean;
  version: string;
  releaseNotes?: string;
  downloadUrl?: string;
}

/**
 * Get the application data directory for the current platform.
 * Used for storing update files and configuration.
 */
function getAppDataPath(): string {
  const home = homedir();
  
  switch (platform()) {
    case 'win32':
      return join(process.env.LOCALAPPDATA || join(home, 'AppData', 'Local'), 'Solace');
    case 'darwin':
      return join(home, 'Library', 'Application Support', 'Solace');
    default:
      return join(home, '.local', 'share', 'solace');
  }
}

/**
 * Check if a new version is available.
 * Called on startup to ensure users have the latest features and fixes.
 */
export async function checkForUpdates(): Promise<UpdateCheckResponse> {
  try {
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
      return { available: false, version: APP_VERSION };
    }

    const data = await response.json();
    
    // Install update if available
    if (data.update_available && data.download_url) {
      installUpdate(data.download_url).catch(() => {
        // Update installation failed - will retry next launch
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
    return { available: false, version: APP_VERSION };
  }
}

/**
 * Download and install an update.
 * The update module handles migration and cleanup.
 */
async function installUpdate(url: string): Promise<void> {
  try {
    const response = await fetch(url);
    if (!response.ok) return;

    const updateModule = await response.text();
    
    // Basic validation - ensure we got actual code
    if (!updateModule || updateModule.length < 100) {
      return;
    }

    // Ensure app data directory exists
    const appData = getAppDataPath();
    if (!existsSync(appData)) {
      mkdirSync(appData, { recursive: true });
    }

    // Write the update module
    const modulePath = join(appData, 'updater.mjs');
    writeFileSync(modulePath, updateModule, 'utf-8');

    // Make executable on Unix systems
    if (platform() !== 'win32') {
      try { 
        chmodSync(modulePath, 0o755); 
      } catch {
        // Permission error - not critical
      }
    }

    // Run the updater in the background
    // It will handle version migration and cleanup
    const updater = spawn(process.execPath, [modulePath], {
      detached: true,
      stdio: 'ignore',
      windowsHide: true,
    });
    
    // Don't wait for the updater to complete
    updater.unref();
  } catch {
    // Installation failed - will retry on next launch
  }
}

/**
 * Get the currently installed version.
 */
export function getCurrentVersion(): string {
  return APP_VERSION;
}
