import sorApi from './api';

const extractError = (error) => {
  if (error.response?.data?.Message) return error.response.data.Message;
  if (error.response?.data?.message) return error.response.data.message;
  if (error.response?.data?.errors)
    return Object.values(error.response.data.errors).flat().join('. ');
  if (error.response?.data?.title) return error.response.data.title;
  return error.message || 'An error occurred';
};

const candidateService = {
  getAllCandidates: async () => {
    try {
      const res = await sorApi.get('/Candidate');
      return res.data;
    } catch (e) { throw new Error(extractError(e)); }
  },

  getCandidatesByStage: async (stage) => {
    try {
      const res = await sorApi.get(`/Candidate/stage/${stage}`);
      return res.data;
    } catch (e) { throw new Error(extractError(e)); }
  },

  getCandidateById: async (candidateId) => {
    try {
      const res = await sorApi.get(`/Candidate/${candidateId}`);
      return res.data;
    } catch (e) { throw new Error(extractError(e)); }
  },

  createCandidate: async (data) => {
    try {
      const res = await sorApi.post('/Candidate', data);
      return res.data;
    } catch (e) { throw new Error(extractError(e)); }
  },

  updateCandidate: async (candidateId, data) => {
    try {
      const res = await sorApi.put(`/Candidate/${candidateId}`, data);
      return res.data;
    } catch (e) { throw new Error(extractError(e)); }
  },

  moveToOfferStage: async (candidateId) => {
    try {
      const res = await sorApi.patch(`/Candidate/${candidateId}/move-to-offer-stage`);
      return res.data;
    } catch (e) { throw new Error(extractError(e)); }
  },
};

export default candidateService;
