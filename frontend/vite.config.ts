import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

function validateProductionApiUrl(apiBaseUrl: string | undefined): void {
  if (!apiBaseUrl) {
    throw new Error(
      'VITE_API_BASE_URL is required for production builds. ' +
        'Set it in Vercel to your deployed FastAPI backend URL (e.g. https://your-api.onrender.com).',
    );
  }

  const trimmed = apiBaseUrl.trim();

  if (trimmed === '/' || (trimmed.startsWith('/') && !trimmed.startsWith('//'))) {
    throw new Error(
      'VITE_API_BASE_URL must be the full backend URL, not a relative path like "/". ' +
        'Vercel only hosts the React frontend; API requests must go to your FastAPI deployment.',
    );
  }

  if (/^https?:\/\/[^/]*vercel\.app\/?$/i.test(trimmed)) {
    throw new Error(
      'VITE_API_BASE_URL must point to your FastAPI backend, not the Vercel frontend URL. ' +
        'Deploy the backend (Render, Railway, etc.) and use that URL instead.',
    );
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  if (mode === 'production' && env.VERCEL) {
    validateProductionApiUrl(env.VITE_API_BASE_URL);
  }

  return {
    plugins: [react()],
    server: {
      port: 5173,
      host: true,
    },
  };
});
