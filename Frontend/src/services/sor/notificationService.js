import sorApi from './api';

const extractError = (e) =>
  e.response?.data?.Message || e.response?.data?.message || e.message || 'Error occurred';

const notificationService = {
  getAllNotifications: async () => {
    try { return (await sorApi.get('/Notification')).data; }
    catch (e) { throw new Error(extractError(e)); }
  },
  getUnreadCount: async () => {
    try { return (await sorApi.get('/Notification/unread-count')).data; }
    catch (e) { throw new Error(extractError(e)); }
  },
  markAsRead: async (notificationIds) => {
    try { return (await sorApi.patch('/Notification/mark-read', { notificationIds })).data; }
    catch (e) { throw new Error(extractError(e)); }
  },
};

export default notificationService;
