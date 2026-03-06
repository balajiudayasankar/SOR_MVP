import sorApi from './api';

const extractError = (e) =>
  e.response?.data?.Message || e.response?.data?.message || e.message || 'Error occurred';

const auditService = {
  getAuditLogs: async (pageNumber = 1, pageSize = 10) => {
    try { return (await sorApi.get(`/Audit?pageNumber=${pageNumber}&pageSize=${pageSize}`)).data; }
    catch (e) { throw new Error(extractError(e)); }
  },
  getAuditByOffer: async (offerId) => {
    try { return (await sorApi.get(`/Audit/offer/${offerId}`)).data; }
    catch (e) { throw new Error(extractError(e)); }
  },
  getAuditByUser: async (userId) => {
    try { return (await sorApi.get(`/Audit/user/${userId}`)).data; }
    catch (e) { throw new Error(extractError(e)); }
  },
  getAuditByDateRange: async (startDate, endDate) => {
    try { return (await sorApi.get(`/Audit/date-range?startDate=${startDate}&endDate=${endDate}`)).data; }
    catch (e) { throw new Error(extractError(e)); }
  },
};

export default auditService;
