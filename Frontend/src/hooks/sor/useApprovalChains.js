import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import approvalChainService from '../../services/sor/approvalChainService';

const useApprovalChains = () => {
  const [chains, setChains]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDeptId, setSelectedDeptId] = useState('');

  const fetchChains = useCallback(async (departmentId) => {
    if (!departmentId) return;
    setLoading(true);
    try {
      const res = await approvalChainService.getChainsByDepartment(departmentId);
      setChains(res.data || []);
    } catch (e) { toast.error(e.message); }
    finally { setLoading(false); }
  }, []);

  const createChain = async (data) => {
    try {
      await approvalChainService.createChain(data);
      toast.success('Approval chain created!');
      if (selectedDeptId) fetchChains(selectedDeptId);
      return true;
    } catch (e) { toast.error(e.message); return false; }
  };

  const updateChain = async (chainId, data) => {
    try {
      await approvalChainService.updateChain(chainId, data);
      toast.success('Approval chain updated!');
      if (selectedDeptId) fetchChains(selectedDeptId);
      return true;
    } catch (e) { toast.error(e.message); return false; }
  };

  const deleteChain = async (chainId) => {
    try {
      await approvalChainService.deleteChain(chainId);
      toast.success('Approval chain deleted!');
      if (selectedDeptId) fetchChains(selectedDeptId);
      return true;
    } catch (e) { toast.error(e.message); return false; }
  };

  const testChain = async (chainId) => {
    try {
      const res = await approvalChainService.testChain(chainId);
      toast.success('Chain test passed!');
      return res;
    } catch (e) { toast.error(e.message); return null; }
  };

  const setAsDefault = async (chainId, departmentId) => {
    try {
      await approvalChainService.setAsDefault(chainId, departmentId);
      toast.success('Default chain updated!');
      if (selectedDeptId) fetchChains(selectedDeptId);
      return true;
    } catch (e) { toast.error(e.message); return false; }
  };

  return {
    chains, loading, selectedDeptId, setSelectedDeptId,
    fetchChains, createChain, updateChain, deleteChain, testChain, setAsDefault,
  };
};

export default useApprovalChains;
