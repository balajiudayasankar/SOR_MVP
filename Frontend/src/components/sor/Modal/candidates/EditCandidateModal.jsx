import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import "../../../../styles/sor/modals/candidates/EditCandidateModal.css";




const validate = (form) => {
  const errors = {};

  if (!form.candidateName.trim()) {
    errors.candidateName = "Full name is required";
  } else if (form.candidateName.trim().length < 2) {
    errors.candidateName = "Name must be at least 2 characters";
  } else if (!/^[a-zA-Z\s.'-]+$/.test(form.candidateName.trim())) {
    errors.candidateName = "Name must contain only letters";
  }

  if (!form.email.trim()) {
    errors.email = "Email address is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = "Please enter a valid email address";
  }

  if (form.phone.trim() && !/^[+]?[\d\s\-().]{7,20}$/.test(form.phone.trim())) {
    errors.phone = "Enter a valid phone number (include country code if needed)";
  }

  if (form.address.trim() && form.address.trim().length > 300) {
    errors.address = "Address must be under 300 characters";
  }

  return errors;
};




const EditCandidateModal = ({ show, onClose, candidate, onUpdate }) => {
  const [form,    setForm]    = useState({
    candidateName: "",
    email: "",
    phone: "",
    address: "",
  });
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (candidate) {
      setForm({
        candidateName: candidate.candidateName || "",
        email:         candidate.email         || "",
        phone:         candidate.phone         || "",
        address:       candidate.address       || "",
      });
      setErrors({});
    }
  }, [candidate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleClose = () => {
    if (loading) return;
    setErrors({});
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Please fix the errors before submitting.");
      return;
    }
    setLoading(true);
    const ok = await onUpdate(candidate.candidateId, form);
    setLoading(false);
    if (ok) {
      setErrors({});
      onClose();
    }
  };

  if (!show || !candidate) return null;

  return (
    <>
      <div className="ecm-backdrop" onClick={handleClose} />

      <div className="ecm-modal-container">
        <div className="ecm-modal-dialog">

          {/* ── Header ──────────────────────────────────────── */}
          <div className="ecm-modal-header">
            <div className="ecm-header-title">
              <i className="bi bi-pencil-square"></i>
              Edit Candidate
            </div>
            <button
              type="button"
              className="ecm-close-btn"
              onClick={handleClose}
              disabled={loading}
              aria-label="Close"
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>

          {/* ── Form ────────────────────────────────────────── */}
          <form onSubmit={handleSubmit} noValidate>
            <div className="ecm-modal-body">
              <div className="ecm-form-grid">

                {/* Full Name */}
                <div className="ecm-form-group">
                  <label className="ecm-form-label">
                    Full Name <span className="ecm-required">*</span>
                  </label>
                  <input
                    type="text"
                    name="candidateName"
                    value={form.candidateName}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder="Enter candidate's full legal name"
                    maxLength={150}
                    className={`ecm-form-input ${errors.candidateName ? "error" : ""}`}
                  />
                  {errors.candidateName && (
                    <div className="ecm-form-error">{errors.candidateName}</div>
                  )}
                </div>

                {/* Email */}
                <div className="ecm-form-group">
                  <label className="ecm-form-label">
                    Email Address <span className="ecm-required">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder="e.g. name@company.com"
                    maxLength={255}
                    className={`ecm-form-input ${errors.email ? "error" : ""}`}
                  />
                  {errors.email && (
                    <div className="ecm-form-error">{errors.email}</div>
                  )}
                </div>

                {/* Phone */}
                <div className="ecm-form-group">
                  <label className="ecm-form-label">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder="Include country code if applicable"
                    maxLength={20}
                    className={`ecm-form-input ${errors.phone ? "error" : ""}`}
                  />
                  {errors.phone ? (
                    <div className="ecm-form-error">{errors.phone}</div>
                  ) : (
                    <small className="ecm-form-hint">
                      <i className="bi bi-telephone"></i> Optional — include country code (e.g. +91)
                    </small>
                  )}
                </div>

                {/* Address — full width */}
                <div className="ecm-form-group ecm-form-group--full">
                  <label className="ecm-form-label">Address</label>
                  <textarea
                    name="address"
                    rows={2}
                    value={form.address}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder="City, State, Country"
                    maxLength={300}
                    className={`ecm-form-input ecm-textarea ${errors.address ? "error" : ""}`}
                  />
                  {errors.address ? (
                    <div className="ecm-form-error">{errors.address}</div>
                  ) : (
                    <small className="ecm-form-hint">
                      {form.address.length}/300 characters
                    </small>
                  )}
                </div>

              </div>

              {/* Info Alert */}
              <div className="ecm-info-alert">
                <i className="bi bi-info-circle"></i>
                <small>
                  Fields marked <span className="ecm-required">*</span> are
                  mandatory. Changes will be saved immediately on submission.
                </small>
              </div>
            </div>

            {/* ── Footer ────────────────────────────────────── */}
            <div className="ecm-modal-footer">
              <button
                type="button"
                className="ecm-btn-cancel"
                onClick={handleClose}
                disabled={loading}
              >
                <i className="bi bi-x-circle"></i> Cancel
              </button>

              <button
                type="submit"
                className="ecm-btn-submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="ecm-spinner" />
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle"></i> Save Changes
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

export default EditCandidateModal;
