import React, { useState } from 'react';
import { APPROVAL_ROLE_LABELS } from '../../../../constants/sor/approvalRoles';
import '../../../../styles/sor/modals/approval_chains/TestChainModal.css';

const TestChainModal = ({ show, onClose, chain, onTest }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);

  const handleTest = async () => {
    setLoading(true);
    setResult(null);
    const res = await onTest(chain.approvalChainId);
    setLoading(false);
    setResult(res);
  };

  const handleClose = () => {
    setResult(null);
    onClose();
  };

  const getRoleLabel = (role) => {
    if (typeof role === 'number' || !isNaN(Number(role))) {
      return APPROVAL_ROLE_LABELS[Number(role)] || `Role ${role}`;
    }
    return APPROVAL_ROLE_LABELS[role] || role;
  };

  const assignedCount   = chain?.steps?.filter(s => s.assignedUserId).length ?? 0;
  const totalSteps      = chain?.steps?.length ?? 0;
  const allAssigned     = assignedCount === totalSteps && totalSteps > 0;

  if (!show || !chain) return null;

  return (
    <>
      <div className="tcm-backdrop" onClick={!loading ? handleClose : undefined} />

      <div className="tcm-modal-container">
        <div className="tcm-modal-dialog">

          {}
          <div className="tcm-modal-header">
            <div className="tcm-header-title">
              <i className="bi bi-play-circle-fill"></i>
              Test Approval Chain
            </div>
            <button
              type="button"
              className="tcm-close-btn"
              onClick={handleClose}
              disabled={loading}
              aria-label="Close"
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>

          {}
          <div className="tcm-modal-body">

            {}
            <div className="tcm-chain-strip">
              <div className="tcm-chain-strip__icon">
                <i className="bi bi-link-45deg"></i>
              </div>
              <div className="tcm-chain-strip__info">
                <span className="tcm-chain-strip__name">{chain.chainName}</span>
                {chain.departmentName && (
                  <span className="tcm-chain-strip__dept">
                    <i className="bi bi-building"></i>
                    {chain.departmentName}
                  </span>
                )}
              </div>
              <div className="tcm-chain-strip__meta">
                <span className={`tcm-assign-badge ${allAssigned ? 'tcm-assign-badge--ok' : 'tcm-assign-badge--warn'}`}>
                  <i className={`bi ${allAssigned ? 'bi-check-circle-fill' : 'bi-exclamation-circle-fill'}`}></i>
                  {assignedCount}/{totalSteps} assigned
                </span>
              </div>
            </div>

            {}
            {result && (
              <div className={`tcm-result ${result.success ? 'tcm-result--success' : 'tcm-result--fail'}`}>
                <div className="tcm-result__icon">
                  <i className={`bi ${result.success ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}`}></i>
                </div>
                <div className="tcm-result__content">
                  <span className="tcm-result__title">
                    {result.success ? 'Test Passed' : 'Test Failed'}
                  </span>
                  <span className="tcm-result__message">
                    {result.success
                      ? 'All steps are properly configured and approvers are assigned.'
                      : result.message || 'Chain has configuration issues. Please review the steps below.'}
                  </span>
                </div>
              </div>
            )}

            {}
            <div className="tcm-section">
              <div className="tcm-section__title">
                <i className="bi bi-diagram-3-fill"></i>
                Chain Steps
                <span className="tcm-step-pill">{totalSteps} step{totalSteps !== 1 ? 's' : ''}</span>
              </div>

              <div className="tcm-steps-list">
                {(!chain.steps || chain.steps.length === 0) ? (
                  <div className="tcm-no-steps">
                    <i className="bi bi-exclamation-circle"></i>
                    No steps configured for this chain.
                  </div>
                ) : (
                  chain.steps.map((step, idx) => {
                    const isAssigned = !!step.assignedUserId;
                    return (
                      <div key={step.approvalChainStepId || idx} className="tcm-step-row">

                        <div className="tcm-step-order">
                          <div className="tcm-order-badge">{step.stepOrder}</div>
                        </div>

                        <div className="tcm-step-info">
                          <span className="tcm-step-role">{getRoleLabel(step.role)}</span>
                          {step.assignedUserName && (
                            <span className="tcm-step-user">
                              <i className="bi bi-person-fill"></i>
                              {step.assignedUserName}
                            </span>
                          )}
                        </div>

                        <div className="tcm-step-status">
                          {isAssigned ? (
                            <span className="tcm-status-assigned">
                              <i className="bi bi-check-circle-fill"></i>
                              Assigned
                            </span>
                          ) : (
                            <span className="tcm-status-unassigned">
                              <i className="bi bi-x-circle-fill"></i>
                              Not Assigned
                            </span>
                          )}
                        </div>

                        {idx < chain.steps.length - 1 && (
                          <div className="tcm-step-connector">
                            <i className="bi bi-chevron-down"></i>
                          </div>
                        )}

                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {}
            <div className="tcm-info-alert">
              <i className="bi bi-info-circle-fill"></i>
              <small>
                Running a test validates chain integrity — checks that all approvers are assigned and steps are properly configured.
              </small>
            </div>

          </div>

          {}
          <div className="tcm-modal-footer">
            <button
              type="button"
              className="tcm-btn-close"
              onClick={handleClose}
              disabled={loading}
            >
              <i className="bi bi-x-circle"></i>
              Close
            </button>
            <button
              type="button"
              className="tcm-btn-run"
              onClick={handleTest}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="tcm-spinner"></span>
                  Running...
                </>
              ) : (
                <>
                  <i className="bi bi-play-fill"></i>
                  Run Test
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </>
  );
};

export default TestChainModal;
