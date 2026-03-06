import sorApi from './api';

const extractError = (e) =>
  e.response?.data?.Message ||
  e.response?.data?.message ||
  e.response?.data?.errors  ||
  e.message ||
  'Error occurred';

const offerTemplateService = {

  getAllTemplates: async () => {
    try {
      return (await sorApi.get('/OfferTemplate')).data;
    } catch (e) { throw new Error(extractError(e)); }
  },

  
  createTemplate: async (data) => {
    try {
      return (await sorApi.post('/OfferTemplate', data)).data;
    } catch (e) { throw new Error(extractError(e)); }
  },

  
  updateTemplate: async (templateId, data) => {
    try {
      return (await sorApi.put(`/OfferTemplate/${templateId}`, data)).data;
    } catch (e) { throw new Error(extractError(e)); }
  },

  deleteTemplate: async (templateId) => {
    try {
      return (await sorApi.delete(`/OfferTemplate/${templateId}`)).data;
    } catch (e) { throw new Error(extractError(e)); }
  },
};

export default offerTemplateService;
