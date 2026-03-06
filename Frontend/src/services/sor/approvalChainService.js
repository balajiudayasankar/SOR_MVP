import sorApi from './api';

const extractError = (e) =>
  e.response?.data?.Message || e.response?.data?.message || e.message || 'Error occurred';

const approvalChainService = {
  getChainsByDepartment: async (departmentId) => {
    try { return (await sorApi.get(`/ApprovalChain/department/${departmentId}`)).data; }
    catch (e) { throw new Error(extractError(e)); }
  },
  getChainById: async (chainId) => {
    try { return (await sorApi.get(`/ApprovalChain/${chainId}`)).data; }
    catch (e) { throw new Error(extractError(e)); }
  },
  createChain: async (data) => {
    try { return (await sorApi.post('/ApprovalChain', data)).data; }
    catch (e) { throw new Error(extractError(e)); }
  },
  updateChain: async (chainId, data) => {
    try { return (await sorApi.put(`/ApprovalChain/${chainId}`, data)).data; }
    catch (e) { throw new Error(extractError(e)); }
  },
  deleteChain: async (chainId) => {
    try { return (await sorApi.delete(`/ApprovalChain/${chainId}`)).data; }
    catch (e) { throw new Error(extractError(e)); }
  },
  testChain: async (chainId) => {
    try { return (await sorApi.post('/ApprovalChain/test', { approvalChainId: chainId })).data; }
    catch (e) { throw new Error(extractError(e)); }
  },
  setAsDefault: async (chainId, departmentId) => {
    try { return (await sorApi.patch(`/ApprovalChain/${chainId}/set-default/${departmentId}`)).data; }
    catch (e) { throw new Error(extractError(e)); }
  },
};

export default approvalChainService;
