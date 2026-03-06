export const OFFER_TYPES = {
  FULL_TIME: 0,
  INTERNSHIP: 1,
  CONTRACT: 2,
};

export const OFFER_TYPE_OPTIONS = [
  { value: 1, label: 'Internship' },
  { value: 2, label: 'Full Time' },
];

export const OFFER_TYPE_BADGE_CONFIG = {
  FullTime:   { bg: 'primary',   label: 'Full Time' },
  Internship: { bg: 'warning',   label: 'Internship' },
  Contract:   { bg: 'secondary', label: 'Contract' },
  0: { bg: 'primary',   label: 'Full Time' },
  1: { bg: 'warning',   label: 'Internship' },
  2: { bg: 'secondary', label: 'Contract' },
};
