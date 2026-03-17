import api from './axios';
export const createReview = (data) => api.post('/reviews/create/', data);
export const getCoachReviews = (coachId) => api.get(`/reviews/coach/${coachId}/`);
export const getMyReviews = () => api.get('/reviews/mine/');
export const deleteReview = (id) => api.delete(`/reviews/${id}/delete/`);
export const getAllReviews = () => api.get('/reviews/coach/all/');
