import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import auditService from '../../services/sor/auditService';
import { AUDIT_PAGE_SIZE } from '../../constants/sor/sorConstants';

const useAudit = () => {
  const [auditLogs, setAuditLogs]   = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading]         = useState(false);

  const fetchAuditLogs = useCallback(async (page = 1, pageSize = AUDIT_PAGE_SIZE) => {
    setLoading(true);
    try {
      const res  = await auditService.getAuditLogs(page, pageSize);
      const data = res.data?.data || res.data || [];
      setAuditLogs(Array.isArray(data) ? data : []);
      setTotalCount(res.data?.totalCount || 0);
      setTotalPages(res.data?.totalPages || 1);
      setCurrentPage(page);
    } catch (e) { toast.error(e.message); }
    finally { setLoading(false); }
  }, []);

  const fetchAuditByOffer = useCallback(async (offerId) => {
    setLoading(true);
    try {
      const res = await auditService.getAuditByOffer(offerId);
      setAuditLogs(res.data || []);
    } catch (e) { toast.error(e.message); }
    finally { setLoading(false); }
  }, []);

  return {
    auditLogs, totalCount, totalPages, currentPage, loading,
    fetchAuditLogs, fetchAuditByOffer,
  };
};

export default useAudit;
