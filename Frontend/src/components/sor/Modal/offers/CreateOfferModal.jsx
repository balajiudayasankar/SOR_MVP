import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { OFFER_TYPE_OPTIONS } from "../../../../constants/sor/offerTypes";
import "../../../../styles/sor/modals/offers/CreateOfferModal.css";


const OFFER_TYPE_META = {
  1: {
    icon:    "bi-person-workspace",
    color:   "#003366",
    bg:      "#f0f4ff",
    border:  "#c8d8f5",
    title:   "Full-Time Employment",
    bullets: [
      "Permanent employment with full salary structure (CTC, Basic, HRA)",
      "Includes statutory benefits: PF, Gratuity, Insurance",
      "Notice period, probation, and confirmation terms apply",
    ],
  },
  2: {
    icon:    "bi-mortarboard-fill",
    color:   "#1a6b3c",
    bg:      "#eafff3",
    border:  "#b7ebc8",
    title:   "Internship Engagement",
    bullets: [
      "Fixed-term engagement with monthly stipend",
      "Includes training details, service agreement, and certificate terms",
      "Option to convert to full-time after internship",
    ],
  },
};

const CreateOfferModal = ({ show, onClose, candidate, onCreateOffer }) => {
  
  const [offerType, setOfferType] = useState(
    () => Number(OFFER_TYPE_OPTIONS[0]?.value ?? 1)
  );
  const [loading, setLoading] = useState(false);

  const meta = OFFER_TYPE_META[offerType] ?? OFFER_TYPE_META[1];

  
  const handleEscape = useCallback(
    (e) => { if (e.key === "Escape" && !loading) onClose(); },
    [loading, onClose]
  );

  useEffect(() => {
    if (!show) return;
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [show, handleEscape]);

  
  useEffect(() => {
    if (show) {
      setOfferType(Number(OFFER_TYPE_OPTIONS[0]?.value ?? 1));
      setLoading(false);
    }
  }, [show]);

  
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await onCreateOffer({
        candidateId: candidate.candidateId,
        offerType: offerType, 
      });
      if (result) {
        toast.success("Offer draft created successfully!", { toastId: "offer-created" });
        onClose();
      } else {
        toast.error("Failed to create offer. Please try again.", { toastId: "offer-failed" });
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "An unexpected error occurred. Please try again.",
        { toastId: "offer-error" }
      );
    } finally {
      
      setLoading(false);
    }
  };

  if (!show || !candidate) return null;

  return (
    <>
      {}
      <div
        className="com-backdrop"
        onClick={loading ? undefined : onClose}
        style={{ cursor: loading ? "not-allowed" : "pointer" }}
      />

      {}
      <div
        className="com-modal-container"
        role="dialog"
        aria-modal="true"
        aria-labelledby="com-modal-title"
      >
        <div className="com-modal-dialog">

          {}
          <div className="com-modal-header">
            <div className="com-header-title" id="com-modal-title">
              <i className="bi bi-file-earmark-text me-2" />
              Create Offer Letter
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="com-close-button"
              aria-label="Close modal"
            >
              <i className="bi bi-x-lg" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="com-form">
            <div className="com-modal-body">

              {}
              <div className="com-candidate-card">
                <div className="com-candidate-avatar">
                  {candidate.candidateName?.charAt(0)?.toUpperCase() ?? "?"}
                </div>
                <div className="com-candidate-info">
                  <div className="com-candidate-name">
                    {candidate.candidateName}
                  </div>
                  <div className="com-candidate-email">
                    <i className="bi bi-envelope me-1" />
                    {candidate.email}
                  </div>
                </div>
              </div>

              {}
              <div className="com-form-group">
                <label className="com-form-label" htmlFor="com-offer-type">
                  Offer Type <span className="com-required">*</span>
                </label>
                {}
                <select
                  id="com-offer-type"
                  className="com-form-select"
                  value={offerType}
                  onChange={(e) => setOfferType(Number(e.target.value))}
                  required
                  disabled={loading}
                >
                  {OFFER_TYPE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              {}
              <div
                className="com-type-context-card"
                style={{
                  background: meta.bg,
                  borderColor: meta.border,
                }}
              >
                <div
                  className="com-type-context-header"
                  style={{ color: meta.color }}
                >
                  <i className={`bi ${meta.icon} me-2`} />
                  {meta.title}
                </div>
                <ul className="com-type-context-list">
                  {meta.bullets.map((b, idx) => (
                    <li key={idx} style={{ color: meta.color }}>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>

              {}
              <div className="com-info-alert">
                <i className="bi bi-info-circle me-2" />
                <small>
                  You will fill in the full offer details on the next page.
                  This creates a <strong>Draft</strong> offer.
                </small>
              </div>

            </div>

            {}
            <div className="com-modal-footer">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="com-btn-cancel"
              >
                <i className="bi bi-x-circle me-1" />
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="com-btn-submit"
              >
                {loading ? (
                  <>
                    <span className="com-spinner" />
                    Creating...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle me-1" />
                    Create Draft Offer
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

export default CreateOfferModal;
