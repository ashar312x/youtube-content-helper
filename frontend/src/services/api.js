import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

export const contentAPI = {
  generate: (channelName, topic) =>
    api.post('/content/generate', { channelName, topic }).then((r) => r.data),
  history: (channelName, limit = 10) =>
    api.get(`/content/history/${encodeURIComponent(channelName)}`, { params: { limit } }).then((r) => r.data),
  delete: (id) => api.delete(`/content/${id}`).then((r) => r.data),
  regenerateTitles: (channelName, topic, contentId) =>
    api.post('/content/regenerate-titles', { channelName, topic, contentId }).then((r) => r.data),
  generateThumbnails: (titles, channelName, contentId) =>
    api.post('/content/generate-thumbnails', { titles, channelName, contentId }).then((r) => r.data),
  generateVoiceover: (channelName, topic, description, contentId) =>
    api.post('/content/generate-voiceover', { channelName, topic, description, contentId }).then((r) => r.data),
  getTrending: (niche) =>
    api.get(`/content/trending/${encodeURIComponent(niche)}`).then((r) => r.data),
  batchGenerate: (channelName, topics) =>
    api.post('/content/batch-generate', { channelName, topics }).then((r) => r.data),
};

export const ideasAPI = {
  generate: (channelName, count = 10) =>
    api.post('/ideas/generate', { channelName, count }).then((r) => r.data),
  list: (channelName, status) =>
    api.get(`/ideas/${encodeURIComponent(channelName)}`, { params: { status } }).then((r) => r.data),
  updateStatus: (id, status) =>
    api.patch(`/ideas/${id}/status`, { status }).then((r) => r.data),
  delete: (id) => api.delete(`/ideas/${id}`).then((r) => r.data),
};

export const emailAPI = {
  subscribe: (email, channelName, frequency, alertType) =>
    api.post('/email/subscribe', { email, channelName, frequency, alertType }).then((r) => r.data),
  sendTest: (email) =>
    api.post('/email/test', { email }).then((r) => r.data),
  sendNow: (channelName, content) =>
    api.post('/email/send-now', { channelName, content }).then((r) => r.data),
  subscriptions: (channelName) =>
    api.get(`/email/subscriptions/${encodeURIComponent(channelName)}`).then((r) => r.data),
  deactivate: (id) => api.patch(`/email/${id}/deactivate`).then((r) => r.data),
  reactivate: (id) => api.patch(`/email/${id}/activate`).then((r) => r.data),
};

export const channelsAPI = {
  list: () => api.get('/channels').then((r) => r.data),
  create: (name, niche, description) =>
    api.post('/channels', { name, niche, description }).then((r) => r.data),
  update: (id, data) => api.put(`/channels/${id}`, data).then((r) => r.data),
  delete: (id) => api.delete(`/channels/${id}`).then((r) => r.data),
};
