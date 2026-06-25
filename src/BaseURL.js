// Backend base URL comes from the VITE_API_URL env var (set in .env locally, or in
// the hosting provider's env settings). In local dev, if it's unset, requests fall
// back to the relative "/api" path which the Vite dev proxy forwards to the backend
// (see vite.config.js). No backend URL is hardcoded here so it stays out of the public repo.
export const API_BASE_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';