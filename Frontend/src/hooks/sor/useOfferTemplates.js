import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import offerTemplateService from '../../services/sor/offerTemplateService';

const useOfferTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading]     = useState(false);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const res = await offerTemplateService.getAllTemplates();
      setTemplates(res.data || []);
    } catch (e) { toast.error(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

  const createTemplate = async (data) => {
    try {
      await offerTemplateService.createTemplate(data);
      toast.success('Template created!');
      fetchTemplates();
      return true;
    } catch (e) { toast.error(e.message); return false; }
  };

  const updateTemplate = async (id, data) => {
    try {
      await offerTemplateService.updateTemplate(id, data);
      toast.success('Template updated!');
      fetchTemplates();
      return true;
    } catch (e) { toast.error(e.message); return false; }
  };

  const deleteTemplate = async (id) => {
    try {
      await offerTemplateService.deleteTemplate(id);
      toast.success('Template deleted!');
      fetchTemplates();
      return true;
    } catch (e) { toast.error(e.message); return false; }
  };

  return { templates, loading, fetchTemplates, createTemplate, updateTemplate, deleteTemplate };
};

export default useOfferTemplates;
