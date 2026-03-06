import React, { useState } from "react";
import "../../../../styles/sor/modals/offers/DeleteOfferModal.css";

const DeleteOfferModal = ({ show, onClose, offer, onDelete }) => {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    const ok = await onDelete(offer.offerId);
    setLoading(false);
    if (ok) onClose();
  };

  if (!show || !offer) return null;

  return (
    <>
      <div className="dom-backdrop" onClick={onClose} />
      <div className="dom-modal-container">
        <div className="dom-modal-dialog">
          <div className="dom-modal-header dom-danger-header">
            <div className="dom-header-title">
              <i className="bi bi-trash3"></i>
              Delete Offer
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="dom-close-button"
              aria-label="Close"
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>

          <div className="dom-modal-body">
            <div className="dom-warning-icon">
              <i className="bi bi-exclamation-triangle"></i>
            </div>

            <p className="dom-confirm-text">
              Are you sure you want to delete
            </p>

            <p className="dom-offer-number">
              {offer.offerNumber}?
            </p>

            <p className="dom-danger-text">
              This action cannot be undone.
            </p>
          </div>

          <div className="dom-modal-footer">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="dom-btn-cancel"
            >
              <i className="bi bi-x-circle"></i>
              Cancel
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading}
              className="dom-btn-delete"
            >
              {loading ? (
                <>
                  <span className="dom-spinner" />
                  Deleting...
                </>
              ) : (
                <>
                  <i className="bi bi-trash"></i>
                  Delete
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default DeleteOfferModal;