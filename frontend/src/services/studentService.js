import apiClient from '../api/client';

// Get all providers with optional filters
export const fetchProviders = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.city) params.append('city', filters.city);
  if (filters.vegOnly) params.append('vegOnly', 'true');

  const response = await apiClient.get(`/student/providers?${params}`);
  return response.data.data || [];
};

// Get provider menu
export const fetchProviderMenu = async (providerId) => {
  const response = await apiClient.get(`/student/provider-menu/${providerId}`);
  return response.data.data;
};

// Apply for trial
export const applyTrial = async (providerId, couponCode = '') => {
  const response = await apiClient.post('/student/trial/apply', {
    providerId,
    couponCode,
  });
  return response.data;
};

// Submit a review
export const submitReview = async (providerId, rating, comment) => {
  const response = await apiClient.post('/student/review', {
    providerId,
    rating,
    comment,
  });
  return response.data;
};

// Create a subscription
export const createSubscription = async (providerId, plan, price) => {
  const response = await apiClient.post('/student/subscribe', {
    providerId,
    plan,
    price,
  });
  return response.data;
};
