import api from './axios';
export const getCoaches = (params) => api.get('/coaches/', { params });
export const getCoach = (id) => api.get(`/coaches/${id}/`);
export const getMyProfile = () => api.get('/coaches/me/profile/');
export const updateMyProfile = (data) => api.put('/coaches/me/profile/', data);
export const getMyAvailabilities = () => api.get('/coaches/me/availabilities/');
export const addAvailability = (data) => api.post('/coaches/me/availabilities/', data);
export const deleteAvailability = (id) => api.delete(`/coaches/me/availabilities/${id}/`);
export const adminUpdateCoachProfile = (coachId, data) => api.put(`/coaches/${coachId}/profile/`, data);
