import React, { useState } from "react";
import "../../../../styles/sor/modals/approvals/RejectModal.css";

const RejectModal = ({ show, onClose, step, onReject }) => {
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setComments("");
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const ok = await onReject(
      step.offerWorkflowStepId,
      comments
    );

    setLoading(false);

    if (ok) {
      setComments("");
      onClose();
    }
  };

  if (!show || !step) return null;

  return (
    <>
      <div
        className="rjm-backdrop"
        onClick={!loading ? handleClose : undefined}
      />

      <div className="rjm-modal-container">
        <div className="rjm-modal-dialog">

          {}
          <div className="rjm-modal-header">
            <div className="rjm-header-title">
              <i className="bi bi-x-circle-fill"></i>
              Reject Offer
            </div>
            <button
              type="button"
              className="rjm-close-btn"
              onClick={handleClose}
              disabled={loading}
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="rjm-form">
            <div className="rjm-modal-body">

              {}
              <div className="rjm-step-card">
                <div className="rjm-step-label">
                  Rejecting
                </div>
                <div className="rjm-step-value">
                  Step {step.stepOrder}: {step.role}
                </div>
              </div>

              {}
              <div className="rjm-form-group">
                <label className="rjm-form-label">
                  Rejection Reason <span className="rjm-required">*</span>
                </label>
                <textarea
                  className="rjm-textarea"
                  rows={3}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  required
                  disabled={loading}
                  placeholder="Provide a clear reason for rejection..."
                />
              </div>

              {}
              <div className="rjm-confirm-alert">
                <i className="bi bi-info-circle-fill"></i>
                <small>
                  Rejecting this step will stop the current approval
                  process and notify the previous stage.
                </small>
              </div>

            </div>

            {}
            <div className="rjm-modal-footer">
              <button
                type="button"
                className="rjm-btn-cancel"
                onClick={handleClose}
                disabled={loading}
              >
                <i className="bi bi-x-circle"></i>
                Cancel
              </button>

              <button
                type="submit"
                className="rjm-btn-submit"
                disabled={loading || !comments.trim()}
              >
                {loading ? (
                  <>
                    <span className="rjm-spinner"></span>
                    Rejecting...
                  </>
                ) : (
                  <>
                    <i className="bi bi-x-circle"></i>
                    Reject Offer
                  </>
                )}
              </button>
            </div>
          </form>

        </div>
      </div>
    </>
  );
};

export default RejectModal;