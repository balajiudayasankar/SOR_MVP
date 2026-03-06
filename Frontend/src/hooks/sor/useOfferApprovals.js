import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import offerApprovalService from '../../services/sor/offerApprovalService';

const useOfferApprovals = () => {
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [loading, setLoading]                   = useState(true);
  const [actionLoading, setActionLoading]       = useState(false);

  const fetchPending = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await offerApprovalService.getMyPendingApprovals();

      
      const raw  = res?.data ?? res;
      const list = Array.isArray(raw) ? raw : (raw?.data ?? []);

      setPendingApprovals(Array.isArray(list) ? list : []);
    } catch (e) {
      toast.error(e.message);
      setPendingApprovals([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPending(); }, [fetchPending]);

  const approveOffer = async (data) => {
    setActionLoading(true);
    try {
      const res = await offerApprovalService.approveOffer(data);
      if (res?.success || res?.data?.success) {
        toast.success('Offer approved successfully.');
        await fetchPending();
        return true;
      }
      toast.error(res?.message || 'Approval failed.');
      return false;
    } catch (e) {
      toast.error(e.message);
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const rejectOffer = async (data) => {
    setActionLoading(true);
    try {
      const res = await offerApprovalService.rejectOffer(data);
      if (res?.success || res?.data?.success) {
        toast.success('Offer rejected.');
        await fetchPending();
        return true;
      }
      toast.error(res?.message || 'Rejection failed.');
      return false;
    } catch (e) {
      toast.error(e.message);
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const requestRevision = async (data) => {
    setActionLoading(true);
    try {
      const res = await offerApprovalService.requestRevision(data);
      if (res?.success || res?.data?.success) {
        toast.success('Revision requested.');
        await fetchPending();
        return true;
      }
      toast.error(res?.message || 'Request failed.');
      return false;
    } catch (e) {
      toast.error(e.message);
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  return {
    pendingApprovals,
    loading,
    actionLoading,
    fetchPending,
    approveOffer,
    rejectOffer,
    requestRevision,
  };
};

export default useOfferApprovals;
