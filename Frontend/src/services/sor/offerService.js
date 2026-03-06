import sorApi from './api';


const extractError = (error) => {
  const data = error.response?.data;

  if (!data) return error.message || 'An error occurred';

  
  if (data.Message) return data.Message;
  if (data.message) return data.message;

  
  if (data.errors) {
    const messages = Object.entries(data.errors)
      .map(([field, msgs]) => {
        const cleanField = field.replace('$.', '').replace(/([A-Z])/g, ' $1').trim();
        return `${cleanField}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`;
      });
    return messages.join(' | ');
  }

  
  if (data.title) return data.title;

  
  if (typeof data === 'string') return data;

  return error.message || 'An error occurred';
};


const logPayload = (method, url, payload) => {
  if (import.meta.env.DEV) {
    console.group(`[SOR API] ${method} ${url}`);
    console.log('Payload:', JSON.stringify(payload, null, 2));
    console.groupEnd();
  }
};

const offerService = {

  getAllOffers: async () => {
    try {
      const res = await sorApi.get('/Offer');
      return res.data;
    } catch (e) { throw new Error(extractError(e)); }
  },

  getOfferById: async (offerId) => {
    try {
      const res = await sorApi.get(`/Offer/${offerId}`);
      return res.data;
    } catch (e) { throw new Error(extractError(e)); }
  },

  createOffer: async (data) => {
    try {
      logPayload('POST', '/Offer', data);
      const res = await sorApi.post('/Offer', data);
      return res.data;
    } catch (e) { throw new Error(extractError(e)); }
  },

  updateOfferDetails: async (offerId, data) => {
    try {
      
      logPayload('PUT', `/Offer/${offerId}/details`, data);
      const res = await sorApi.put(`/Offer/${offerId}/details`, data);
      return res.data;
    } catch (e) {
      
      if (import.meta.env.DEV) {
        console.error('[SOR] updateOfferDetails error:', e.response?.data);
      }
      throw new Error(extractError(e));
    }
  },

  
  saveAsDraft: async (offerId) => {
    try {
      const res = await sorApi.patch(`/Offer/${offerId}/draft`, {});
      return res.data;
    } catch (e) { throw new Error(extractError(e)); }
  },

  submitForApproval: async (data) => {
    try {
      logPayload('POST', '/Offer/submit-for-approval', data);
      const res = await sorApi.post('/Offer/submit-for-approval', data);
      return res.data;
    } catch (e) { throw new Error(extractError(e)); }
  },

  getOfferPreview: async (offerId) => {
    try {
      const res = await sorApi.get(`/Offer/${offerId}/preview`);
      return res.data;
    } catch (e) { throw new Error(extractError(e)); }
  },

  getOfferVersions: async (offerId) => {
    try {
      const res = await sorApi.get(`/Offer/${offerId}/versions`);
      return res.data;
    } catch (e) { throw new Error(extractError(e)); }
  },

  regenerateOffer: async (data) => {
    try {
      logPayload('POST', '/Offer/regenerate', data);
      const res = await sorApi.post('/Offer/regenerate', data);
      return res.data;
    } catch (e) { throw new Error(extractError(e)); }
  },

  downloadOffer: async (offerId) => {
    try {
      const res = await sorApi.get(`/Offer/${offerId}/download`, {
        responseType: 'blob',
      });
      return res;
    } catch (e) { throw new Error(extractError(e)); }
  },
};

export default offerService;
