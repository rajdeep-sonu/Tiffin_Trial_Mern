import axios from 'axios';
import { API_CONFIG } from '../config/api';

const apiClient = axios.create(API_CONFIG);

// Request interceptor - for debugging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    
    // For FormData, don't override Content-Type (let axios set multipart/form-data)
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
      console.log('[FormData] Detected - using multipart/form-data');
    }
    
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => {
    console.log(`[API Success] ${response.status}`, response.data);
    return response;
  },
  (error) => {
    console.error('[API Error]', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

export default apiClient;

