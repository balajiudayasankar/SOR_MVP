import React, { useState } from "react";
import offerApprovalService from "../../../../services/sor/offerApprovalService";
import { toast } from "sonner";
import "../../../../styles/sor/modals/approvals/FinanceValidateModal.css";

const FinanceValidateModal = ({ show, onClose, step, onValidate }) => {
  const [form, setForm] = useState({
    budgetNotes: "",
    isApproved: true,
    comments: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const value =
      e.target.type === "radio"
        ? e.target.value === "true"
        : e.target.value;

    setForm((prev) => ({
      ...prev,
      [e.target.name]: value,
    }));
  };

  const handleClose = () => {
    setForm({
      budgetNotes: "",
      isApproved: true,
      comments: "",
    });
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await offerApprovalService.validateFinance({
        workflowStepId: step.offerWorkflowStepId,
        budgetNotes: form.budgetNotes,
        isApproved: form.isApproved,
        comments: form.comments,
      });

      toast.success("Finance validation submitted!");
      if (onValidate) onValidate();
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!show || !step) return null;

  return (
    <>
      <div
        className="fvm-backdrop"
        onClick={!loading ? handleClose : undefined}
      />

      <div className="fvm-modal-container">
        <div className="fvm-modal-dialog">

          {}
          <div className="fvm-modal-header">
            <div className="fvm-header-title">
              <i className="bi bi-cash-coin"></i>
              Finance Validation
            </div>
            <button
              type="button"
              className="fvm-close-btn"
              onClick={handleClose}
              disabled={loading}
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="fvm-form">
            <div className="fvm-modal-body">

              {}
              <div className="fvm-form-group">
                <label className="fvm-form-label">Decision</label>

                <div className="fvm-decision-group">
                  <label className={`fvm-decision-option ${form.isApproved ? "active" : ""}`}>
                    <input
                      type="radio"
                      name="isApproved"
                      value="true"
                      checked={form.isApproved === true}
                      onChange={handleChange}
                    />
                    <i className="bi bi-check-circle"></i>
                    Approve
                  </label>

                  <label className={`fvm-decision-option ${!form.isApproved ? "active-reject" : ""}`}>
                    <input
                      type="radio"
                      name="isApproved"
                      value="false"
                      checked={form.isApproved === false}
                      onChange={handleChange}
                    />
                    <i className="bi bi-x-circle"></i>
                    Reject
                  </label>
                </div>
              </div>

              {}
              <div className="fvm-form-group">
                <label className="fvm-form-label">
                  Budget Notes <span className="fvm-required">*</span>
                </label>
                <textarea
                  className="fvm-textarea"
                  name="budgetNotes"
                  rows={3}
                  value={form.budgetNotes}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  placeholder="e.g. CTC within Q1 budget allocation..."
                />
              </div>

              {}
              <div className="fvm-form-group">
                <label className="fvm-form-label">Comments</label>
                <input
                  className="fvm-input"
                  name="comments"
                  value={form.comments}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="Additional comments..."
                />
              </div>

              {}
              <div className="fvm-confirm-alert">
                <i className="bi bi-info-circle-fill"></i>
                <small>
                  This review confirms whether the offer aligns with
                  the allocated financial budget and approval policies.
                </small>
              </div>

            </div>

            {}
            <div className="fvm-modal-footer">
              <button
                type="button"
                className="fvm-btn-cancel"
                onClick={handleClose}
                disabled={loading}
              >
                <i className="bi bi-x-circle"></i>
                Cancel
              </button>

              <button
                type="submit"
                className="fvm-btn-submit"
                disabled={loading || !form.budgetNotes.trim()}
              >
                {loading ? (
                  <>
                    <span className="fvm-spinner"></span>
                    Submitting...
                  </>
                ) : (
                  <>
                    <i className="bi bi-send-check"></i>
                    Submit Finance Review
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

export default FinanceValidateModal;