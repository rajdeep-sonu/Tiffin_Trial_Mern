/**
 * API Configuration
 * Dynamically determines API base URL from environment variables
 * Supports dynamic backend ports (5000, 5001, 5002, etc.)
 */

export const API_BASE_URL = 
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const API_CONFIG = {
  baseURL: API_BASE_URL,
  withCredentials: true,
};

console.log(`✅ API Base URL configured: ${API_BASE_URL}`);
