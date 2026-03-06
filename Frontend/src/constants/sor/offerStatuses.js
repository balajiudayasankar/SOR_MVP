export const OFFER_STATUSES = {
  DRAFT:              'Draft',
  PENDING_APPROVAL:   'PendingApproval',
  IN_REVIEW:          'InReview',
  APPROVED:           'Approved',
  REJECTED:           'Rejected',
  REVISION_REQUESTED: 'RevisionRequested',
  ISSUED:             'Issued',
  ACCEPTED:           'Accepted',
  DECLINED:           'Declined',
};

export const OFFER_STATUS_BADGE_CONFIG = {
  Draft:             { bg: 'secondary', label: 'Draft' },
  PendingApproval:   { bg: 'warning',   label: 'Pending Approval' },
  InReview:          { bg: 'info',      label: 'In Review' },
  Approved:          { bg: 'success',   label: 'Approved' },
  Rejected:          { bg: 'danger',    label: 'Rejected' },
  RevisionRequested: { bg: 'orange',    label: 'Revision Requested' },
  Issued:            { bg: 'primary',   label: 'Issued' },
  Accepted:          { bg: 'success',   label: 'Accepted' },
  Declined:          { bg: 'danger',    label: 'Declined' },
};

export const EDITABLE_STATUSES   = ['Draft', 'RevisionRequested'];
export const DOWNLOADABLE_STATUSES = ['InternallyApproved'];
