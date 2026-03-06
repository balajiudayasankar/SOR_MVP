import React, { useState } from 'react';
import '../../../../styles/sor/modals/approval_chains/DeleteChainModal.css';

const DeleteChainModal = ({ show, onClose, chain, onDelete }) => {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    const ok = await onDelete(chain.approvalChainId);
    setLoading(false);
    if (ok) onClose();
  };

  if (!show || !chain) return null;

  return (
    <>
      <div className="dcm-backdrop" onClick={!loading ? onClose : undefined} />

      <div className="dcm-modal-container">
        <div className="dcm-modal-dialog">

          {}
          <div className="dcm-modal-header">
            <div className="dcm-header-title">
              <i className="bi bi-trash3-fill"></i>
              Delete Approval Chain
            </div>
            <button
              type="button"
              className="dcm-close-btn"
              onClick={onClose}
              disabled={loading}
              aria-label="Close"
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>

          {}
          <div className="dcm-modal-body">

            {}
            <div className="dcm-warning-icon">
              <i className="bi bi-exclamation-triangle-fill"></i>
            </div>

            <h5 className="dcm-confirm-title">Are you sure?</h5>
            <p className="dcm-confirm-subtitle">
              You are about to permanently delete the following approval chain:
            </p>

            {}
            <div className="dcm-chain-card">
              <div className="dcm-chain-card__icon">
                <i className="bi bi-link-45deg"></i>
              </div>
              <div className="dcm-chain-card__info">
                <span className="dcm-chain-card__name">{chain.chainName}</span>
                {chain.departmentName && (
                  <span className="dcm-chain-card__dept">
                    <i className="bi bi-building"></i>
                    {chain.departmentName}
                  </span>
                )}
                {chain.steps?.length > 0 && (
                  <span className="dcm-chain-card__steps">
                    <i className="bi bi-diagram-3"></i>
                    {chain.steps.length} step{chain.steps.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              {chain.isDefault && (
                <span className="dcm-chain-card__default-badge">
                  <i className="bi bi-star-fill"></i>
                  Default
                </span>
              )}
            </div>

            {}
            <div className="dcm-danger-alert">
              <i className="bi bi-exclamation-circle-fill"></i>
              <small>
                This action is permanent and cannot be undone. All steps associated with this chain will also be removed.
              </small>
            </div>

          </div>

          {}
          <div className="dcm-modal-footer">
            <button
              type="button"
              className="dcm-btn-cancel"
              onClick={onClose}
              disabled={loading}
            >
              <i className="bi bi-x-circle"></i>
              Cancel
            </button>
            <button
              type="button"
              className="dcm-btn-delete"
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="dcm-spinner"></span>
                  Deleting...
                </>
              ) : (
                <>
                  <i className="bi bi-trash3"></i>
                  Delete Chain
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </>
  );
};

export default DeleteChainModal;
