import sorApi from './api';

const extractError = (e) =>
  e.response?.data?.Message || e.response?.data?.message || e.message || 'Error occurred';

const dashboardService = {
  getHRDashboard: async () => {
    try { return (await sorApi.get('/Dashboard/hr')).data; }
    catch (e) { throw new Error(extractError(e)); }
  },
  getManagerDashboard: async () => {
    try { return (await sorApi.get('/Dashboard/manager')).data; }
    catch (e) { throw new Error(extractError(e)); }
  },
};

export default dashboardService;
