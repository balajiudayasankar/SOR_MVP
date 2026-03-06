import sorApi from './api';

const extractError = (e) =>
  e.response?.data?.Message ||
  e.response?.data?.message ||
  e.response?.data?.title   ||
  e.message ||
  'Error occurred';

const offerApprovalService = {

  getMyPendingApprovals: async () => {
    try {
      const res = await sorApi.get('/OfferApproval/my-pending');
      const raw = res.data?.data ?? res.data;

      
      
      if (!raw)               return [];
      if (Array.isArray(raw)) return raw;
      
      if (typeof raw === 'object') return [raw];
      return [];
    } catch (e) { throw new Error(extractError(e)); }
  },

  getAllWorkflowStatuses: async (params = {}) => {
    try {
      const qs = new URLSearchParams(params).toString();
      return (await sorApi.get(`/OfferApproval/workflow/status${qs ? `?${qs}` : ''}`)).data;
    } catch (e) { throw new Error(extractError(e)); }
  },

  getWorkflowByOffer: async (offerId) => {
    try { return (await sorApi.get(`/OfferApproval/workflow/${offerId}`)).data; }
    catch (e) { throw new Error(extractError(e)); }
  },

  getWorkflowStatusSummary: async (offerId) => {
    try { return (await sorApi.get(`/OfferApproval/workflow/${offerId}/status`)).data; }
    catch (e) { throw new Error(extractError(e)); }
  },

  approveOffer: async (data) => {
    try { return (await sorApi.post('/OfferApproval/approve', data)).data; }
    catch (e) { throw new Error(extractError(e)); }
  },

  rejectOffer: async (data) => {
    try { return (await sorApi.post('/OfferApproval/reject', data)).data; }
    catch (e) { throw new Error(extractError(e)); }
  },

  requestRevision: async (data) => {
    try { return (await sorApi.post('/OfferApproval/request-revision', data)).data; }
    catch (e) { throw new Error(extractError(e)); }
  },

  expediteOffer: async (data) => {
    try { return (await sorApi.post('/OfferApproval/expedite', data)).data; }
    catch (e) { throw new Error(extractError(e)); }
  },

  getFinanceSummary: async (offerId) => {
    try { return (await sorApi.get(`/OfferApproval/finance/summary/${offerId}`)).data; }
    catch (e) { throw new Error(extractError(e)); }
  },

  validateFinance: async (data) => {
    try { return (await sorApi.post('/OfferApproval/finance/validate', data)).data; }
    catch (e) { throw new Error(extractError(e)); }
  },
};

export default offerApprovalService;
