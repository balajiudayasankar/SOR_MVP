import React, { useState } from "react";
import "../../../../styles/sor/modals/approvals/RequestRevisionModal.css";

const RequestRevisionModal = ({ show, onClose, step, onRequestRevision }) => {
  const [revisionReason, setRevisionReason] = useState("");
  const [highlightedFields, setHighlightedFields] = useState("");
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setRevisionReason("");
    setHighlightedFields("");
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const ok = await onRequestRevision(
      step.offerWorkflowStepId,
      revisionReason,
      highlightedFields
    );

    setLoading(false);

    if (ok) {
      setRevisionReason("");
      setHighlightedFields("");
      onClose();
    }
  };

  if (!show || !step) return null;

  return (
    <>
      <div className="rrm-backdrop" onClick={!loading ? handleClose : undefined} />

      <div className="rrm-modal-container">
        <div className="rrm-modal-dialog">

          {}
          <div className="rrm-modal-header">
            <div className="rrm-header-title">
              <i className="bi bi-arrow-repeat"></i>
              Request Revision
            </div>
            <button
              type="button"
              className="rrm-close-btn"
              onClick={handleClose}
              disabled={loading}
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="rrm-form">
            <div className="rrm-modal-body">

              {}
              <div className="rrm-step-card">
                <div className="rrm-step-label">
                  Requesting revision for
                </div>
                <div className="rrm-step-value">
                  Step {step.stepOrder}: {step.role}
                </div>
              </div>

              {}
              <div className="rrm-form-group">
                <label className="rrm-form-label">
                  Revision Reason <span className="rrm-required">*</span>
                </label>
                <textarea
                  className="rrm-textarea"
                  rows={3}
                  value={revisionReason}
                  onChange={(e) => setRevisionReason(e.target.value)}
                  required
                  disabled={loading}
                  placeholder="Describe what needs to be revised..."
                />
              </div>

              {}
              <div className="rrm-form-group">
                <label className="rrm-form-label">
                  Highlighted Fields
                </label>
                <input
                  className="rrm-input"
                  value={highlightedFields}
                  onChange={(e) => setHighlightedFields(e.target.value)}
                  disabled={loading}
                  placeholder="e.g. joiningBonus, annualCtc"
                />
                <small className="rrm-form-hint">
                  Comma-separated field names that require changes
                </small>
              </div>

              {}
              <div className="rrm-confirm-alert">
                <i className="bi bi-info-circle-fill"></i>
                <small>
                  This action will notify the previous stage to update
                  the specified details before proceeding further.
                </small>
              </div>

            </div>

            {}
            <div className="rrm-modal-footer">
              <button
                type="button"
                className="rrm-btn-cancel"
                onClick={handleClose}
                disabled={loading}
              >
                <i className="bi bi-x-circle"></i>
                Cancel
              </button>

              <button
                type="submit"
                className="rrm-btn-submit"
                disabled={loading || !revisionReason.trim()}
              >
                {loading ? (
                  <>
                    <span className="rrm-spinner"></span>
                    Sending...
                  </>
                ) : (
                  <>
                    <i className="bi bi-send-check"></i>
                    Send Revision Request
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

export default RequestRevisionModal;