import React, { useState } from "react";
import "../../../../styles/sor/modals/candidates/MoveToOfferStageModal.css";

const MoveToOfferStageModal = ({ show, onClose, candidate, onMove }) => {
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    if (!loading) onClose();
  };

  const handleConfirm = async () => {
    setLoading(true);
    const ok = await onMove(candidate.candidateId);
    setLoading(false);
    if (ok) onClose();
  };

  if (!show || !candidate) return null;

  return (
    <>
      <div
        className="mosm-backdrop"
        onClick={!loading ? handleClose : undefined}
      />

      <div className="mosm-modal-container">
        <div className="mosm-modal-dialog">

          {}
          <div className="mosm-modal-header">
            <div className="mosm-header-title">
              <i className="bi bi-arrow-up-right-circle"></i>
              Move to Offer Stage
            </div>
            <button
              type="button"
              className="mosm-close-btn"
              onClick={handleClose}
              disabled={loading}
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>

          {}
          <div className="mosm-modal-body">
            <div className="mosm-confirm-card">
              <div className="mosm-icon">
                <i className="bi bi-person-check-fill"></i>
              </div>

              <div className="mosm-text">
                <p className="mosm-main-text">
                  Move <strong>{candidate.candidateName}</strong> to
                  <span className="mosm-badge"> Offer Stage</span>?
                </p>

                <p className="mosm-sub-text">
                  Once moved, you will be able to generate and manage the offer
                  letter for this candidate.
                </p>
              </div>
            </div>
          </div>

          {}
          <div className="mosm-modal-footer">
            <button
              type="button"
              className="mosm-btn-cancel"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="button"
              className="mosm-btn-submit"
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading && <span className="mosm-spinner"></span>}
              Confirm Move
            </button>
          </div>

        </div>
      </div>
    </>
  );
};

export default MoveToOfferStageModal;