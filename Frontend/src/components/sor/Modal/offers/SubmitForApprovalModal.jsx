import React, { useState, useEffect } from "react";
import departmentService from "../../../../services/auth/departmentService";
import approvalChainService from "../../../../services/sor/approvalChainService";
import "../../../../styles/sor/modals/offers/SubmitForApprovalModal.css";

const SubmitForApprovalModal = ({ show, onClose, offer, onSubmit }) => {
  const [departments, setDepartments] = useState([]);
  const [chains, setChains] = useState([]);
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedChain, setSelectedChain] = useState("");
  const [loading, setLoading] = useState(false);
  const [chainsLoading, setChainsLoading] = useState(false);

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
      setSelectedChain("");
      return;
    }

    setChainsLoading(true);

    approvalChainService
      .getChainsByDepartment(selectedDept)
      .then((res) => {
        setChains(res.data || []);
        setSelectedChain("");
      })
      .catch(() => setChains([]))
      .finally(() => setChainsLoading(false));
  }, [selectedDept]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedChain) return;

    setLoading(true);
    const ok = await onSubmit({
      offerId: offer.offerId,
      approvalChainId: Number(selectedChain),
    });
    setLoading(false);

    if (ok) onClose();
  };

  if (!show || !offer) return null;

  const selectedChainData = chains.find(
    (c) => c.approvalChainId === Number(selectedChain)
  );

  return (
    <>
      <div className="sfam-backdrop" onClick={onClose} />
      <div className="sfam-modal-container">
        <div className="sfam-modal-dialog">
          <div className="sfam-modal-header">
            <div className="sfam-header-title">
              <i className="bi bi-send-check"></i>
              Submit for Approval
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="sfam-close-button"
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="sfam-form">
            <div className="sfam-modal-body">
              <div className="sfam-offer-card">
                <div className="sfam-offer-number">
                  {offer.offerNumber}
                </div>
                <div className="sfam-offer-candidate">
                  {offer.candidateName}
                </div>
              </div>

              <div className="sfam-form-group">
                <label className="sfam-form-label">
                  Department <span className="sfam-required">*</span>
                </label>
                <select
                  className="sfam-form-select"
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  required
                >
                  <option value="">— Select Department —</option>
                  {departments.map((d) => (
                    <option key={d.departmentId} value={d.departmentId}>
                      {d.departmentName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sfam-form-group">
                <label className="sfam-form-label">
                  Approval Chain <span className="sfam-required">*</span>
                </label>
                <select
                  className="sfam-form-select"
                  value={selectedChain}
                  onChange={(e) => setSelectedChain(e.target.value)}
                  required
                  disabled={chainsLoading || !selectedDept}
                >
                  <option value="">
                    {chainsLoading
                      ? "Loading chains..."
                      : !selectedDept
                      ? "— Select department first —"
                      : "— Select Chain —"}
                  </option>
                  {chains.map((c) => (
                    <option key={c.approvalChainId} value={c.approvalChainId}>
                      {c.chainName} {c.isDefault ? "★ Default" : ""}
                    </option>
                  ))}
                </select>

                {selectedDept &&
                  !chainsLoading &&
                  chains.length === 0 && (
                    <div className="sfam-error-text">
                      No approval chains found for this department.
                    </div>
                  )}
              </div>

              {selectedChainData && (
                <div className="sfam-chain-preview">
                  <div className="sfam-chain-title">
                    Chain Steps
                  </div>
                  <div className="sfam-chain-steps">
                    {selectedChainData?.steps
                      ?.map((s) => s.role)
                      .join(" → ")}
                  </div>
                </div>
              )}
            </div>

            <div className="sfam-modal-footer">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="sfam-btn-cancel"
              >
                <i className="bi bi-x-circle"></i>
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading || !selectedChain}
                className="sfam-btn-submit"
              >
                {loading ? (
                  <>
                    <span className="sfam-spinner" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle"></i>
                    Submit for Approval
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

export default SubmitForApprovalModal;