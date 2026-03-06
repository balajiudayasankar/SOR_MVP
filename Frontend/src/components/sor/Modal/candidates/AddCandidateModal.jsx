import React, { useState } from "react";
import { toast } from "sonner";
import "../../../../styles/sor/modals/candidates/AddCandidateModal.css";




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




const initialState = {
  candidateName: "",
  email: "",
  phone: "",
  address: "",
};




const AddCandidateModal = ({ show, onClose, onCreate }) => {
  const [form,    setForm]    = useState(initialState);
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleClose = () => {
    if (loading) return;
    setForm(initialState);
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
    const ok = await onCreate(form);
    setLoading(false);
    if (ok) {
      setForm(initialState);
      setErrors({});
      onClose();
    }
  };

  if (!show) return null;

  return (
    <>
      <div className="acm-backdrop" onClick={handleClose} />

      <div className="acm-modal-container">
        <div className="acm-modal-dialog">

          {/* ── Header ──────────────────────────────────────── */}
          <div className="acm-modal-header">
            <div className="acm-header-title">
              <i className="bi bi-person-plus-fill"></i>
              Add New Candidate
            </div>
            <button
              type="button"
              className="acm-close-btn"
              onClick={handleClose}
              disabled={loading}
              aria-label="Close"
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>

          {/* ── Form ────────────────────────────────────────── */}
          <form onSubmit={handleSubmit} noValidate>
            <div className="acm-modal-body">
              <div className="acm-form-grid">

                {/* Full Name */}
                <div className="acm-form-group">
                  <label className="acm-form-label">
                    Full Name <span className="acm-required">*</span>
                  </label>
                  <input
                    type="text"
                    name="candidateName"
                    value={form.candidateName}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder="Enter candidate's full legal name"
                    maxLength={150}
                    className={`acm-form-input ${errors.candidateName ? "error" : ""}`}
                  />
                  {errors.candidateName && (
                    <div className="acm-form-error">{errors.candidateName}</div>
                  )}
                </div>

                {/* Email */}
                <div className="acm-form-group">
                  <label className="acm-form-label">
                    Email Address <span className="acm-required">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder="e.g. name@company.com"
                    maxLength={255}
                    className={`acm-form-input ${errors.email ? "error" : ""}`}
                  />
                  {errors.email && (
                    <div className="acm-form-error">{errors.email}</div>
                  )}
                </div>

                {/* Phone */}
                <div className="acm-form-group">
                  <label className="acm-form-label">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder="Include country code if applicable"
                    maxLength={20}
                    className={`acm-form-input ${errors.phone ? "error" : ""}`}
                  />
                  {errors.phone ? (
                    <div className="acm-form-error">{errors.phone}</div>
                  ) : (
                    <small className="acm-form-hint">
                      <i className="bi bi-telephone"></i> Optional — include country code (e.g. +91)
                    </small>
                  )}
                </div>

                {/* Address */}
                <div className="acm-form-group acm-form-group--full">
                  <label className="acm-form-label">Address</label>
                  <textarea
                    name="address"
                    rows={2}
                    value={form.address}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder="City, State, Country"
                    maxLength={300}
                    className={`acm-form-input acm-textarea ${errors.address ? "error" : ""}`}
                  />
                  {errors.address ? (
                    <div className="acm-form-error">{errors.address}</div>
                  ) : (
                    <small className="acm-form-hint">
                      {form.address.length}/300 characters
                    </small>
                  )}
                </div>

              </div>

              {/* Info Alert */}
              <div className="acm-info-alert">
                <i className="bi bi-info-circle"></i>
                <small>
                  Fields marked <span className="acm-required">*</span> are
                  mandatory. Candidate will be linked to an offer letter after creation.
                </small>
              </div>
            </div>

            {/* ── Footer ────────────────────────────────────── */}
            <div className="acm-modal-footer">
              <button
                type="button"
                className="acm-btn-cancel"
                onClick={handleClose}
                disabled={loading}
              >
                <i className="bi bi-x-circle"></i> Cancel
              </button>

              <button
                type="submit"
                className="acm-btn-submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="acm-spinner" />
                    Creating...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle"></i> Create Candidate
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

export default AddCandidateModal;
