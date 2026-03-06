export const AUDIT_ACTION_CONFIG = {
  CREATE:               { bg: 'success',   label: 'Create' },
  UPDATE:               { bg: 'primary',   label: 'Update' },
  DELETE:               { bg: 'danger',    label: 'Delete' },
  SUBMIT_FOR_APPROVAL:  { bg: 'purple',    label: 'Submit' },
  APPROVE:              { bg: 'success',   label: 'Approve' },
  REJECT:               { bg: 'danger',    label: 'Reject' },
  REQUEST_REVISION:     { bg: 'warning',   label: 'Revision' },
  MOVE_TO_OFFER_STAGE:  { bg: 'teal',      label: 'Move Stage' },
};

export const getAuditConfig = (action) =>
  AUDIT_ACTION_CONFIG[action] || { bg: 'secondary', label: action };

export const formatAuditDateTime = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-IN', {
    year: 'numeric', month: 'short', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
};
