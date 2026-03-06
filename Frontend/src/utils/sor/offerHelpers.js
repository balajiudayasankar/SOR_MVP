import { EDITABLE_STATUSES, DOWNLOADABLE_STATUSES, OFFER_STATUS_BADGE_CONFIG } from '../../constants/sor/offerStatuses';
import { OFFER_TYPE_BADGE_CONFIG } from '../../constants/sor/offerTypes';

export const canEditOffer = (status) => EDITABLE_STATUSES.includes(status);


export const canDownloadOffer = (status, userRole) => {
  if (!DOWNLOADABLE_STATUSES.includes(status)) return false;
  const role = (userRole ?? '').replace(/\s+/g, '').toLowerCase();
  return role === 'hr';
};

export const getStatusConfig = (status) =>
  OFFER_STATUS_BADGE_CONFIG[status] || { bg: 'secondary', label: status || '—' };

export const getTypeConfig = (offerType) =>
  OFFER_TYPE_BADGE_CONFIG[offerType] || { bg: 'secondary', label: offerType || '—' };

export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'short', day: '2-digit',
  });
};

export const buildDetailsPayload = (offerType, commonDetails, typeDetails) => {
  const isInternship = offerType === 'Internship' || offerType === 1;
  return {
    commonDetails,
    internshipDetails: isInternship ? typeDetails : null,
    fullTimeDetails:   !isInternship ? typeDetails : null,
  };
};
