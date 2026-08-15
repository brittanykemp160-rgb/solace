// Website links. Sign-in and payments happen on the Solace website, not in the app.
//
// PLACEHOLDER: the website isn't built yet, so links point at a local dev server
// (http://localhost:3000, the usual port for a website project). Once the site has
// a real domain, change DEFAULT_SITE_URL to it, e.g. 'https://yourdomain.com'.
// The terminal app can also be pointed elsewhere with SOLACE_SITE_URL=<url>.

const DEFAULT_SITE_URL = 'https://solace.dev';

const envSiteUrl = typeof process !== 'undefined' ? process.env?.SOLACE_SITE_URL : undefined;

export const SITE_URL = (envSiteUrl || DEFAULT_SITE_URL).replace(/\/+$/, '');

export const links = {
  signIn: (from: 'desktop' | 'cli' = 'desktop') => `${SITE_URL}/login?from=${from}`,
  checkout: (planId: string, from: 'desktop' | 'cli' = 'desktop') =>
    `${SITE_URL}/checkout?plan=${encodeURIComponent(planId)}&from=${from}`,
  account: () => `${SITE_URL}/account`,
};

export const siteConnected = () => SITE_URL.length > 0;
