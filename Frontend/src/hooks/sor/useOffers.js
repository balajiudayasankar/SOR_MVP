import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import offerService from '../../services/sor/offerService';

const useOffers = () => {
  const [offers, setOffers]   = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchOffers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await offerService.getAllOffers();
      setOffers(res.data || []);
    } catch (e) { toast.error(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchOffers(); }, [fetchOffers]);

  const createOffer = async (data) => {
    try {
      const res = await offerService.createOffer(data);
      toast.success('Offer created!');
      return res.data;
    } catch (e) { toast.error(e.message); return null; }
  };

  const updateOfferDetails = async (offerId, data) => {
    try {
      await offerService.updateOfferDetails(offerId, data);
      toast.success('Details saved!');
      return true;
    } catch (e) { toast.error(e.message); return false; }
  };

  const saveAsDraft = async (offerId) => {
    try {
      await offerService.saveAsDraft(offerId);
      toast.success('Saved as draft!');
      return true;
    } catch (e) { toast.error(e.message); return false; }
  };

  const submitForApproval = async (data) => {
    try {
      const res = await offerService.submitForApproval(data);
      toast.success('Offer submitted for approval!');
      fetchOffers();
      return res.data;
    } catch (e) { toast.error(e.message); return null; }
  };

  const regenerateOffer = async (data) => {
    try {
      const res = await offerService.regenerateOffer(data);
      toast.success('Offer regenerated!');
      fetchOffers();
      return res.data;
    } catch (e) { toast.error(e.message); return null; }
  };

  const downloadOffer = async (offerId, offerNumber) => {
    try {
      const res = await offerService.downloadOffer(offerId);
      const url  = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href  = url;
      link.setAttribute('download', `${offerNumber || 'offer'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('PDF downloaded!');
    } catch (e) { toast.error(e.message); }
  };

  return {
    offers, loading, fetchOffers,
    createOffer, updateOfferDetails, saveAsDraft,
    submitForApproval, regenerateOffer, downloadOffer,
  };
};

export default useOffers;
