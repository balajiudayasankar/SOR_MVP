import React, { useState } from "react";
import "../../../../styles/sor/modals/approvals/ExpediteModal.css";

const ExpediteModal = ({ show, onClose, offer, onExpedite }) => {
  const [justification, setJustification] = useState("");
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setJustification("");
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const ok = await onExpedite(offer.offerId, justification);

    setLoading(false);

    if (ok) {
      setJustification("");
      onClose();
    }
  };

  if (!show || !offer) return null;

  return (
    <>
      <div
        className="exm-backdrop"
        onClick={!loading ? handleClose : undefined}
      />

      <div className="exm-modal-container">
        <div className="exm-modal-dialog">

          {}
          <div className="exm-modal-header">
            <div className="exm-header-title">
              <i className="bi bi-lightning-charge-fill"></i>
              Expedite Offer
            </div>
            <button
              type="button"
              className="exm-close-btn"
              onClick={handleClose}
              disabled={loading}
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="exm-form">
            <div className="exm-modal-body">

              {}
              <div className="exm-info-card">
                <i className="bi bi-arrow-up-circle"></i>
                <div>
                  Escalating <strong>{offer.offerNumber}</strong> for faster processing.
                </div>
              </div>

              {}
              <div className="exm-form-group">
                <label className="exm-form-label">
                  Justification <span className="exm-required">*</span>
                </label>
                <textarea
                  className="exm-textarea"
                  rows={3}
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  required
                  disabled={loading}
                  placeholder="e.g. Candidate has competing offer deadline..."
                />
              </div>

              {}
              <div className="exm-confirm-alert">
                <i className="bi bi-info-circle-fill"></i>
                <small>
                  This action will prioritize the approval workflow and notify relevant stakeholders.
                </small>
              </div>

            </div>

            {}
            <div className="exm-modal-footer">
              <button
                type="button"
                className="exm-btn-cancel"
                onClick={handleClose}
                disabled={loading}
              >
                <i className="bi bi-x-circle"></i>
                Cancel
              </button>

              <button
                type="submit"
                className="exm-btn-submit"
                disabled={loading || !justification.trim()}
              >
                {loading ? (
                  <>
                    <span className="exm-spinner"></span>
                    Processing...
                  </>
                ) : (
                  <>
                    <i className="bi bi-lightning"></i>
                    Expedite
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

export default ExpediteModal;