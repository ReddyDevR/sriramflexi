// Central API base URL. Configure VITE_API_URL in the frontend hosting environment.
// Local development falls back to the local backend; production never silently targets localhost.
const configuredApiUrl = import.meta.env.VITE_API_URL;

if (import.meta.env.PROD && !configuredApiUrl) {
  console.error('Missing VITE_API_URL. Set it in the frontend Render Static Site Environment settings.');
}

export const API_BASE_URL = (configuredApiUrl || (import.meta.env.DEV ? 'http://localhost:5000' : '')).replace(/\/+$/, '');
