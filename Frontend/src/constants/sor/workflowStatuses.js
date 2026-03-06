export const WORKFLOW_STEP_STATUSES = {
  PENDING:  'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  ON_HOLD:  'OnHold',
  SKIPPED:  'Skipped',
};

export const STEP_STATUS_CONFIG = {
  Pending:  { icon: '⏳', color: 'warning',   label: 'Pending' },
  Approved: { icon: '✅', color: 'success',   label: 'Approved' },
  Rejected: { icon: '❌', color: 'danger',    label: 'Rejected' },
  OnHold:   { icon: '⚠️', color: 'warning',   label: 'On Hold' },
  Skipped:  { icon: '⏭️', color: 'secondary', label: 'Skipped' },
};
