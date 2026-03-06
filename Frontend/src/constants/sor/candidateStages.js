export const CANDIDATE_STAGES = {
  APPLIED: 1,
  SCREENING: 2,
  INTERVIEW: 3,
  OFFER_STAGE: 4,
  OFFER_ISSUED: 5,
  JOINED: 6,
};

export const CANDIDATE_STAGE_LABELS = {
  1: 'Applied',
  2: 'Screening',
  3: 'Interview',
  4: 'OfferStage',
  5: 'OfferIssued',
  6: 'Joined',
};

export const CANDIDATE_STAGE_OPTIONS = [
  { value: '', label: 'All Stages' },
  { value: 1, label: 'Applied' },
  { value: 2, label: 'Screening' },
  { value: 3, label: 'Interview' },
  { value: 4, label: 'Offer Stage' },
  { value: 5, label: 'Offer Issued' },
  { value: 6, label: 'Joined' },
];

export const STAGE_BADGE_CONFIG = {
  Applied:     { bg: 'secondary', label: 'Applied' },
  Screening:   { bg: 'primary',   label: 'Screening' },
  Interview:   { bg: 'warning',   label: 'Interview' },
  OfferStage:  { bg: 'purple',    label: 'Offer Stage' },
  OfferIssued: { bg: 'success',   label: 'Offer Issued' },
  Joined:      { bg: 'teal',      label: 'Joined' },
};
