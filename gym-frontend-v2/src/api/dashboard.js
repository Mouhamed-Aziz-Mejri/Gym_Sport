import api from './axios';
export const getAdminDashboard = () => api.get('/dashboard/admin/');
export const getCoachDashboard = () => api.get('/dashboard/coach/');
