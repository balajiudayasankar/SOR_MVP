import React, { useState, useEffect } from "react";
import departmentService from "../../../../services/auth/departmentService";
import approvalChainService from "../../../../services/sor/approvalChainService";
import "../../../../styles/sor/modals/offers/RegenerateOfferModal.css";

const RegenerateOfferModal = ({ show, onClose, offer, onRegenerate }) => {
  const [reason, setReason] = useState("");
  const [departments, setDepartments] = useState([]);
  const [chains, setChains] = useState([]);
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedChain, setSelectedChain] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show) {
      departmentService
        .getActiveDepartments()
        .then((res) => setDepartments(res.data || []))
        .catch(() => {});
    }
  }, [show]);

  useEffect(() => {
    if (!selectedDept) {
      setChains([]);
      return;
    }

    approvalChainService
      .getChainsByDepartment(selectedDept)
      .then((res) => setChains(res.data || []))
      .catch(() => setChains([]));
  }, [selectedDept]);

  const handleClose = () => {
    setReason("");
    setSelectedDept("");
    setSelectedChain("");
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const ok = await onRegenerate({
      offerId: offer.offerId,
      regenerateReason: reason,
      approvalChainId: Number(selectedChain),
    });

    setLoading(false);

    if (ok) {
      setReason("");
      onClose();
    }
  };

  if (!show || !offer) return null;

  return (
    <>
      <div
        className="rom-backdrop"
        onClick={!loading ? handleClose : undefined}
      />

      <div className="rom-modal-container">
        <div className="rom-modal-dialog">

          {}
          <div className="rom-modal-header">
            <div className="rom-header-title">
              <i className="bi bi-arrow-repeat"></i>
              Regenerate Offer
            </div>
            <button
              type="button"
              className="rom-close-btn"
              onClick={handleClose}
              disabled={loading}
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="rom-form">
            <div className="rom-modal-body">

              {}
              <div className="rom-form-group">
                <label className="rom-form-label">
                  Reason for Regeneration <span className="rom-required">*</span>
                </label>
                <textarea
                  className="rom-textarea"
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  disabled={loading}
                  placeholder="e.g. Revised CTC as per manager feedback"
                />
              </div>

              {}
              <div className="rom-form-group">
                <label className="rom-form-label">
                  Department
                </label>
                <select
                  className="rom-form-select"
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  disabled={loading}
                >
                  <option value="">— Select Department —</option>
                  {departments.map((d) => (
                    <option key={d.departmentId} value={d.departmentId}>
                      {d.departmentName}
                    </option>
                  ))}
                </select>
              </div>

              {}
              <div className="rom-form-group">
                <label className="rom-form-label">
                  Approval Chain <span className="rom-required">*</span>
                </label>
                <select
                  className="rom-form-select"
                  value={selectedChain}
                  onChange={(e) => setSelectedChain(e.target.value)}
                  required
                  disabled={!selectedDept || loading}
                >
                  <option value="">— Select Chain —</option>
                  {chains.map((c) => (
                    <option key={c.approvalChainId} value={c.approvalChainId}>
                      {c.chainName}
                    </option>
                  ))}
                </select>
              </div>

              {}
              <div className="rom-confirm-alert">
                <i className="bi bi-info-circle-fill"></i>
                <small>
                  This will generate a revised offer and restart the approval workflow
                  with the selected chain.
                </small>
              </div>

            </div>

            {}
            <div className="rom-modal-footer">
              <button
                type="button"
                className="rom-btn-cancel"
                onClick={handleClose}
                disabled={loading}
              >
                <i className="bi bi-x-circle"></i>
                Cancel
              </button>

              <button
                type="submit"
                className="rom-btn-submit"
                disabled={loading || !reason.trim() || !selectedChain}
              >
                {loading ? (
                  <>
                    <span className="rom-spinner"></span>
                    Regenerating...
                  </>
                ) : (
                  <>
                    <i className="bi bi-arrow-repeat"></i>
                    Regenerate
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

export default RegenerateOfferModal;