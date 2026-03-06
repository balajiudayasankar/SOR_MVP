import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { APPROVAL_ROLE_LABELS } from "../../../../constants/sor/approvalRoles";
import "../../../../styles/sor/modals/approvals/ApproveModal.css";

const MAX_COMMENTS = 500;
const MIN_COMMENTS = 5;

const getRoleLabel = (role) => {
  if (!role) return "";
  if (typeof role === "number" || !isNaN(Number(role)))
    return APPROVAL_ROLE_LABELS[Number(role)] || `Role ${role}`;
  return APPROVAL_ROLE_LABELS[role] || role;
};

const ApproveModal = ({ show, onClose, step, onApprove }) => {
  const [comments, setComments] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [errors,   setErrors]   = useState({});

  
  useEffect(() => {
    if (show) {
      setComments("");
      setErrors({});
      setLoading(false);
    }
  }, [show]);

  
  const handleClose = useCallback(() => {
    if (loading) return;
    setComments("");
    setErrors({});
    onClose();
  }, [loading, onClose]);

  
  useEffect(() => {
    if (!show) return;
    const onKey = (e) => { if (e.key === "Escape") handleClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [show, handleClose]);

  const handleCommentsChange = (e) => {
    const val = e.target.value;
    if (val.length > MAX_COMMENTS) return;
    setComments(val);
    if (errors.comments)
      setErrors((prev) => ({ ...prev, comments: "" }));
  };

  const validate = () => {
    const e = {};
    const trimmed = comments.trim();

    
    if (trimmed.length > 0 && trimmed.length < MIN_COMMENTS)
      e.comments = `Comments must be at least ${MIN_COMMENTS} characters if provided.`;

    
    if (comments.length > 0 && trimmed.length === 0)
      e.comments = "Comments cannot be only whitespace.";

    
    if (!step?.offerWorkflowStepId)
      e.step = "Invalid step. Please close and try again.";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  
  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const ok = await onApprove(
        step.offerWorkflowStepId,
        comments.trim()
      );
      if (ok) {
        
        toast.success("Step approved successfully!");
        setComments("");
        setErrors({});
        onClose();
      } else {
        toast.error("Failed to approve. Please try again.");
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "An unexpected error occurred."
      );
    } finally {
      setLoading(false);   
    }
  };

  const charCount    = comments.length;
  const charNearLimit = charCount >= MAX_COMMENTS * 0.85;
  const charAtLimit   = charCount >= MAX_COMMENTS;

  if (!show || !step) return null;

  return (
    <>
      {}
      <div
        className="apm-backdrop"
        onClick={loading ? undefined : handleClose}
        style={{ cursor: loading ? "not-allowed" : "pointer" }}
      />

      {}
      <div
        className="apm-modal-container"
        role="dialog"
        aria-modal="true"
        aria-labelledby="apm-modal-title"
      >
        <div className="apm-modal-dialog">

          {}
          <div className="apm-modal-header">
            <div className="apm-header-title" id="apm-modal-title">
              <i className="bi bi-check-circle-fill" />
              Approve Offer
            </div>
            <button
              type="button"
              className="apm-close-btn"
              onClick={handleClose}
              disabled={loading}
              aria-label="Close modal"
            >
              <i className="bi bi-x-lg" />
            </button>
          </div>

          {}
          <form className="apm-form" onSubmit={handleSubmit}>
            <div className="apm-modal-body">

              {}
              <div className="apm-step-card">
                <div className="apm-step-icon-wrap">
                  <i className="bi bi-diagram-3-fill" />
                </div>
                <div className="apm-step-info">
                  <span className="apm-step-label">Approving Step</span>
                  <span className="apm-step-value">
                    Step {step.stepOrder}
                    {step.role && (
                      <span className="apm-step-role">
                        <i className="bi bi-dot" />
                        {getRoleLabel(step.role)}
                      </span>
                    )}
                  </span>
                </div>
                <span className="apm-step-badge">
                  <i className="bi bi-shield-check" />
                  Pending Your Approval
                </span>
              </div>

              {}
              {errors.step && (
                <div className="apm-alert apm-alert--error">
                  <i className="bi bi-exclamation-triangle-fill" />
                  <small>{errors.step}</small>
                </div>
              )}

              {}
              <div className="apm-form-group">
                <label className="apm-form-label">
                  Approval Comments
                  <span className="apm-optional">Optional</span>
                </label>

                <textarea
                  className={`apm-textarea ${errors.comments ? "apm-textarea--error" : ""}`}
                  rows={4}
                  value={comments}
                  onChange={handleCommentsChange}
                  placeholder="Add remarks or approval notes..."
                  disabled={loading}
                  maxLength={MAX_COMMENTS}
                />

                <div className="apm-textarea-footer">
                  {errors.comments ? (
                    <div className="apm-form-error">
                      <i className="bi bi-exclamation-circle" />
                      {errors.comments}
                    </div>
                  ) : (
                    <div className="apm-form-hint">
                      <i className="bi bi-info-circle" />
                      If provided, minimum {MIN_COMMENTS} characters required
                    </div>
                  )}

                  <span
                    className={[
                      "apm-char-count",
                      charAtLimit   ? "apm-char-count--limit" : "",
                      charNearLimit ? "apm-char-count--near"  : "",
                    ].filter(Boolean).join(" ")}
                  >
                    {charCount}/{MAX_COMMENTS}
                  </span>
                </div>
              </div>

              {}
              <div className="apm-alert apm-alert--info">
                <i className="bi bi-info-circle-fill" />
                <small>
                  By clicking <strong>Approve</strong>, you confirm that
                  you have reviewed this step and authorize it to proceed.
                </small>
              </div>

            </div>{}

            {}
            <div className="apm-modal-footer">
              <button
                type="button"
                className="apm-btn-cancel"
                onClick={handleClose}
                disabled={loading}
              >
                <i className="bi bi-x-circle" />
                Cancel
              </button>

              <button
                type="submit"
                className="apm-btn-approve"
                disabled={loading || !!errors.step}
              >
                {loading ? (
                  <><span className="apm-spinner" />Approving...</>
                ) : (
                  <><i className="bi bi-check-circle" />Approve</>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </>
  );
};

export default ApproveModal;
