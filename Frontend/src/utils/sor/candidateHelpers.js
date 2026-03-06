import { CANDIDATE_STAGES, STAGE_BADGE_CONFIG } from '../../constants/sor/candidateStages';

export const getStageConfig = (stage) => {
  return STAGE_BADGE_CONFIG[stage] || { bg: 'secondary', label: stage || 'Unknown' };
};

export const canMoveToOfferStage = (stage) => {
  const numericStage = typeof stage === 'string'
    ? { Applied: 1, Screening: 2, Interview: 3, OfferStage: 4, OfferIssued: 5, Joined: 6 }[stage]
    : Number(stage);
  return [1, 2, 3].includes(numericStage);
};

export const canCreateOffer = (stage) => {
  return stage === CANDIDATE_STAGES.OFFER_STAGE || stage === 'OfferStage';
};

export const formatPhone = (phone) => phone || '—';
