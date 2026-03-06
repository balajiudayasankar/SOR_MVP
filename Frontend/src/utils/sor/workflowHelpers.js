import { STEP_STATUS_CONFIG } from '../../constants/sor/workflowStatuses';

export const getStepConfig  = (status) =>
  STEP_STATUS_CONFIG[status] || { icon: '⏳', color: 'secondary', label: status };

export const getActiveStep  = (steps) => steps?.find((s) => s.status === 'Pending') || null;

export const getProgress    = (steps) => {
  if (!steps?.length) return 0;
  return Math.round((steps.filter((s) => s.status === 'Approved').length / steps.length) * 100);
};

export const isUserActiveApprover = (steps, userId) => {
  const active = getActiveStep(steps);
  return active?.approverUserId === Number(userId);
};
