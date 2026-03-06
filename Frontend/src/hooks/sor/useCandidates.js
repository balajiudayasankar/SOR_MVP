import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import candidateService from '../../services/sor/candidateService';

const useCandidates = (initialStage = '') => {
  const [candidates, setCandidates]   = useState([]);
  const [loading, setLoading]         = useState(false);
  const [selectedStage, setSelectedStage] = useState(initialStage);

  const fetchCandidates = useCallback(async () => {
    setLoading(true);
    try {
      const res = selectedStage
        ? await candidateService.getCandidatesByStage(selectedStage)
        : await candidateService.getAllCandidates();
      setCandidates(res.data || []);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [selectedStage]);

  useEffect(() => { fetchCandidates(); }, [fetchCandidates]);

  const createCandidate = async (data) => {
    try {
      await candidateService.createCandidate(data);
      toast.success('Candidate created successfully!');
      fetchCandidates();
      return true;
    } catch (e) { toast.error(e.message); return false; }
  };

  const updateCandidate = async (id, data) => {
    try {
      await candidateService.updateCandidate(id, data);
      toast.success('Candidate updated!');
      fetchCandidates();
      return true;
    } catch (e) { toast.error(e.message); return false; }
  };

  const moveToOfferStage = async (id) => {
    try {
      await candidateService.moveToOfferStage(id);
      toast.success('Candidate moved to Offer Stage!');
      fetchCandidates();
      return true;
    } catch (e) { toast.error(e.message); return false; }
  };

  return {
    candidates, loading, selectedStage, setSelectedStage,
    fetchCandidates, createCandidate, updateCandidate, moveToOfferStage,
  };
};

export default useCandidates;
