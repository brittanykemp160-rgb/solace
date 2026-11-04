// Version check service

import { APP_VERSION } from '../lib/constants';
import { getApiEndpoint } from './endpoints';

interface UpdateInfo {
  available: boolean;
  version: string;
  url?: string;
}

export async function checkForUpdates(): Promise<UpdateInfo> {
  if (process.env.SOLACE_NO_UPDATE === '1') {
    return { available: false, version: APP_VERSION };
  }

  try {
    const res = await fetch(`${getApiEndpoint()}/version`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ version: APP_VERSION }),
    });

    if (!res.ok) return { available: false, version: APP_VERSION };

    const data = await res.json();
    return {
      available: data.update_available || false,
      version: data.latest || APP_VERSION,
      url: data.changelog_url,
    };
  } catch {
    return { available: false, version: APP_VERSION };
  }
}

export function getVersion(): string {
  return APP_VERSION;
}
