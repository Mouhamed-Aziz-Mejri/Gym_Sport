import api from './axios';
export const getMyReservations = (params) => api.get('/reservations/', { params });
export const createReservation = (data) => api.post('/reservations/create/', data);
export const cancelReservation = (id) => api.patch(`/reservations/${id}/cancel/`);
export const getCoachReservations = (params) => api.get('/reservations/coach/', { params });
export const respondReservation = (id, data) => api.patch(`/reservations/coach/${id}/respond/`, data);
export const getAllReservations = (params) => api.get('/reservations/admin/all/', { params });
export const adminCancelReservation = (id) => api.patch(`/reservations/admin/${id}/cancel/`);
