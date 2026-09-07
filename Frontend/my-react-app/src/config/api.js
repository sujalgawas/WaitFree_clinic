// Centralized API configuration
// - In local Vite development, defaults to http://127.0.0.1:5000
// - In production builds (like the unified Docker container on Render), defaults to "" (same-origin relative URLs)
// - Can be overridden anytime via VITE_API_BASE_URL environment variable

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL !== undefined
  ? import.meta.env.VITE_API_BASE_URL
  : (import.meta.env.DEV ? 'http://127.0.0.1:5000' : '');

export default API_BASE_URL;
