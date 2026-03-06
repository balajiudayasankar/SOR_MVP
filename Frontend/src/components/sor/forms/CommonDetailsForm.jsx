import React, { useEffect, useState } from "react";
import userService from "../../../services/auth/userService";
import departmentService from "../../../services/auth/departmentService";
import "../../../styles/sor/components/CommonDetailsForm.css";

const WORKING_HOURS_OPTIONS = [
  "9:00 AM - 6:00 PM",
  "10:00 AM - 7:00 PM",
  "Flexible (8 hours)",
  "Night Shift (6:00 PM - 3:00 AM)",
  "Rotational Shift",
];

const WORKING_DAYS_OPTIONS = [
  "Monday - Friday",
  "Monday - Saturday",
  "5 Days (Flexible)",
  "6 Days (Alternate Saturday Off)",
];

const POLICY_MAX_LENGTH = 1000;


const isValidPhone   = (v) => /^[6-9]\d{9}$/.test(v?.trim());
const isValidEmail   = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v?.trim());
const isValidName    = (v) => v?.trim().length >= 2;

const CommonDetailsForm = ({ data, onChange }) => {
  const [departments,   setDepartments]   = useState([]);
  const [hrUsers,       setHrUsers]       = useState([]);
  const [selectedHrId,  setSelectedHrId]  = useState("");   
  const [errors,        setErrors]        = useState({});
  const [touched,       setTouched]       = useState({});

  
  useEffect(() => {
    departmentService.getActiveDepartments().then((res) => {
      if (res?.success) setDepartments(res.data || []);
    });
  }, []);

  useEffect(() => {
    userService.getAllUsers().then((res) => {
      if (res?.success)
        setHrUsers((res.data || []).filter(
          (u) => u.roleName?.toLowerCase() === "hr"
        ));
    });
  }, []);

  
  const validate = (name, value, fullData = data) => {
    switch (name) {
      case "candidateName":
        return !isValidName(value) ? "Candidate name must be at least 2 characters." : "";
      case "candidateEmail":
        return !isValidEmail(value) ? "Enter a valid email address." : "";
      case "candidatePhone":
        return !isValidPhone(value) ? "Enter a valid 10-digit Indian mobile number." : "";
      case "candidateAddress":
        return !value?.trim() ? "Address is required." : "";
      case "designation":
        return !value?.trim() ? "Designation is required." : "";
      case "department":
        return !value ? "Please select a department." : "";
      case "workLocation":
        return !value?.trim() ? "Work location is required." : "";
      case "reportingManager":
        return !value?.trim() ? "Reporting manager is required." : "";
      case "offerIssueDate":
        return !value ? "Offer issue date is required." : "";
      case "joiningDate": {
        if (!value) return "Joining date is required.";
        
        const issue = fullData.offerIssueDate;
        if (issue && value <= issue)
          return "Joining date must be after the offer issue date.";
        return "";
      }
      case "workingDays":  
        return !value ? "Please select working days." : "";
      case "workingHours": 
        return !value ? "Please select working hours." : "";
      case "weeklyHours": {
        const n = Number(value);
        
        if (!value && value !== 0) return "Weekly hours is required.";
        if (n < 1 || n > 60)       return "Weekly hours must be between 1 and 60.";
        return "";
      }
      case "companyName":
        return !value?.trim() ? "Company name is required." : "";
      case "hrContactName":
        return !value?.trim() ? "Please select an HR contact." : "";
      case "hrPhone":
        return !isValidPhone(value) ? "Enter a valid 10-digit HR phone number." : "";
      case "signatoryName":
        return !isValidName(value) ? "Signatory name must be at least 2 characters." : "";
      case "signatoryDesignation":
        return !value?.trim() ? "Signatory designation is required." : "";
      default:
        return "";
    }
  };

  
  const handle = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;
    const updated = { ...data, [name]: val };
    onChange(updated);
    if (touched[name])
      setErrors((prev) => ({ ...prev, [name]: validate(name, val, updated) }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validate(name, value) }));
  };

  
  
  
  const handleHrSelect = (e) => {
    const id = e.target.value;
    setSelectedHrId(id);
    const user = hrUsers.find((u) => String(u.userId) === id);
    const updated = {
      ...data,
      hrContactName: user ? `${user.firstName} ${user.lastName || ""}`.trim() : "",
      hrEmail:       user?.email       || "",
      hrPhone:       user?.phoneNumber || "",
    };
    onChange(updated);
    setTouched((prev) => ({ ...prev, hrContactName: true }));
    setErrors((prev) => ({
      ...prev,
      hrContactName: validate("hrContactName", updated.hrContactName),
    }));
  };

  
  const err = (name) =>
    touched[name] && errors[name] ? (
      <div className="cdf-error">
        <i className="bi bi-exclamation-circle-fill me-1" />
        {errors[name]}
      </div>
    ) : null;

  const fieldClass = (name) =>
    `form-control ${touched[name] ? (errors[name] ? "is-invalid-cdf" : "is-valid-cdf") : ""}`;

  const selectClass = (name) =>
    `form-select ${touched[name] ? (errors[name] ? "is-invalid-cdf" : "is-valid-cdf") : ""}`;

  const policyLength = (data.companyPolicyText || "").length;

  
  return (
    <div className="cdf-wrapper">

      {}
      <div className="cdf-card">
        <div className="cdf-card-header">
          <i className="bi bi-person-fill me-2" />
          Candidate Information
        </div>
        <div className="cdf-card-body row g-3">

          <div className="col-md-6">
            <label className="cdf-label">Full Name <span className="cdf-required">*</span></label>
            <input
              className={fieldClass("candidateName")}
              name="candidateName"
              placeholder="e.g. Arjun Sharma"
              value={data.candidateName || ""}
              onChange={handle}
              onBlur={handleBlur}
            />
            {err("candidateName")}
          </div>

          <div className="col-md-6">
            <label className="cdf-label">Email Address <span className="cdf-required">*</span></label>
            <input
              type="email"
              className={fieldClass("candidateEmail")}
              name="candidateEmail"
              placeholder="e.g. arjun.sharma@gmail.com"
              value={data.candidateEmail || ""}
              onChange={handle}
              onBlur={handleBlur}
            />
            {err("candidateEmail")}
          </div>

          <div className="col-md-6">
            <label className="cdf-label">Mobile Number <span className="cdf-required">*</span></label>
            <div className="cdf-input-group">
              <span className="cdf-input-prefix">+91</span>
              <input
                type="tel"
                className={fieldClass("candidatePhone")}
                name="candidatePhone"
                placeholder="9876543210"
                maxLength={10}
                value={data.candidatePhone || ""}
                onChange={handle}
                onBlur={handleBlur}
              />
            </div>
            {err("candidatePhone")}
          </div>

          <div className="col-md-6">
            <label className="cdf-label">Address <span className="cdf-required">*</span></label>
            <input
              className={fieldClass("candidateAddress")}
              name="candidateAddress"
              placeholder="City, State"
              value={data.candidateAddress || ""}
              onChange={handle}
              onBlur={handleBlur}
            />
            {err("candidateAddress")}
          </div>

        </div>
      </div>

      {}
      <div className="cdf-card">
        <div className="cdf-card-header">
          <i className="bi bi-briefcase-fill me-2" />
          Job Details
        </div>
        <div className="cdf-card-body row g-3">

          <div className="col-md-6">
            <label className="cdf-label">Designation <span className="cdf-required">*</span></label>
            <input
              className={fieldClass("designation")}
              name="designation"
              placeholder="e.g. Software Engineer"
              value={data.designation || ""}
              onChange={handle}
              onBlur={handleBlur}
            />
            {err("designation")}
          </div>

          {}
          <div className="col-md-6">
            <label className="cdf-label">Department <span className="cdf-required">*</span></label>
            <select
              className={selectClass("department")}
              name="department"
              value={data.department || ""}
              onChange={handle}
              onBlur={handleBlur}
            >
              <option value="">— Select Department —</option>
              {departments.map((d) => (
                <option key={d.departmentId} value={d.departmentName}>
                  {d.departmentName}
                </option>
              ))}
            </select>
            {err("department")}
          </div>

          <div className="col-md-6">
            <label className="cdf-label">Work Location <span className="cdf-required">*</span></label>
            <input
              className={fieldClass("workLocation")}
              name="workLocation"
              placeholder="e.g. Chennai, Tamil Nadu"
              value={data.workLocation || ""}
              onChange={handle}
              onBlur={handleBlur}
            />
            {err("workLocation")}
          </div>

          <div className="col-md-6">
            <label className="cdf-label">Reporting Manager <span className="cdf-required">*</span></label>
            <input
              className={fieldClass("reportingManager")}
              name="reportingManager"
              placeholder="e.g. Priya Menon"
              value={data.reportingManager || ""}
              onChange={handle}
              onBlur={handleBlur}
            />
            {err("reportingManager")}
          </div>

          <div className="col-md-6">
            <label className="cdf-label">Offer Issue Date <span className="cdf-required">*</span></label>
            <input
              type="date"
              className={fieldClass("offerIssueDate")}
              name="offerIssueDate"
              value={data.offerIssueDate || ""}
              onChange={handle}
              onBlur={handleBlur}
            />
            {err("offerIssueDate")}
          </div>

          {}
          <div className="col-md-6">
            <label className="cdf-label">Date of Joining <span className="cdf-required">*</span></label>
            <input
              type="date"
              className={fieldClass("joiningDate")}
              name="joiningDate"
              min={data.offerIssueDate
                ? new Date(new Date(data.offerIssueDate).getTime() + 86400000)
                    .toISOString().split("T")[0]
                : undefined}
              value={data.joiningDate || ""}
              onChange={handle}
              onBlur={handleBlur}
            />
            {err("joiningDate")}
          </div>

          {}
          <div className="col-md-6">
            <label className="cdf-label">Working Days <span className="cdf-required">*</span></label>
            <select
              className={selectClass("workingDays")}
              name="workingDays"
              value={data.workingDays || ""}
              onChange={handle}
              onBlur={handleBlur}
            >
              <option value="">— Select Working Days —</option>
              {WORKING_DAYS_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            {err("workingDays")}
          </div>

          {}
          <div className="col-md-6">
            <label className="cdf-label">Working Hours <span className="cdf-required">*</span></label>
            <select
              className={selectClass("workingHours")}
              name="workingHours"
              value={data.workingHours || ""}
              onChange={handle}
              onBlur={handleBlur}
            >
              <option value="">— Select Working Hours —</option>
              {WORKING_HOURS_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            {err("workingHours")}
          </div>

          {}
          <div className="col-md-6">
            <label className="cdf-label">Weekly Hours <span className="cdf-required">*</span></label>
            <input
              type="number"
              className={fieldClass("weeklyHours")}
              name="weeklyHours"
              placeholder="e.g. 40"
              min={1}
              max={60}
              value={data.weeklyHours || ""}
              onChange={handle}
              onBlur={handleBlur}
            />
            <div className="cdf-hint">Standard: 40 hrs/week · Max: 60 hrs/week</div>
            {err("weeklyHours")}
          </div>

        </div>
      </div>

      {}
      <div className="cdf-card">
        <div className="cdf-card-header">
          <i className="bi bi-building me-2" />
          Company Details
        </div>
        <div className="cdf-card-body row g-3">

          <div className="col-md-6">
            <label className="cdf-label">Company Name <span className="cdf-required">*</span></label>
            <input
              className={fieldClass("companyName")}
              name="companyName"
              placeholder="e.g. Relevantz Technology Services"
              value={data.companyName || ""}
              onChange={handle}
              onBlur={handleBlur}
            />
            {err("companyName")}
          </div>

          {}
          <div className="col-md-6">
            <label className="cdf-label">Select HR Contact <span className="cdf-required">*</span></label>
            <select
              className={selectClass("hrContactName")}
              value={selectedHrId}
              onChange={handleHrSelect}
              onBlur={() => {
                setTouched((p) => ({ ...p, hrContactName: true }));
                setErrors((p) => ({
                  ...p,
                  hrContactName: validate("hrContactName", data.hrContactName),
                }));
              }}
            >
              <option value="">— Select HR —</option>
              {hrUsers.map((u) => (
                <option key={u.userId} value={u.userId}>
                  {u.firstName} {u.lastName}
                </option>
              ))}
            </select>
            {err("hrContactName")}
          </div>

          {}
          {data.hrContactName && (
            <div className="col-12">
              <div className="cdf-autofill-banner">
                <i className="bi bi-check-circle-fill me-2 text-success" />
                <strong>HR Auto-filled: </strong>
                <span>{data.hrContactName}</span>
                <span className="cdf-autofill-sep">|</span>
                <i className="bi bi-envelope me-1" />
                <span>{data.hrEmail}</span>
                <span className="cdf-autofill-sep">|</span>
                <i className="bi bi-telephone me-1" />
                <span>{data.hrPhone}</span>
              </div>
            </div>
          )}

          {}
          <div className="col-md-6">
            <label className="cdf-label">HR Phone <span className="cdf-required">*</span></label>
            <div className="cdf-input-group">
              <span className="cdf-input-prefix">+91</span>
              <input
                type="tel"
                className={fieldClass("hrPhone")}
                name="hrPhone"
                placeholder="9876543210"
                maxLength={10}
                value={data.hrPhone || ""}
                onChange={handle}
                onBlur={handleBlur}
              />
            </div>
            {err("hrPhone")}
          </div>

          <div className="col-md-6">
            <label className="cdf-label">Signatory Name <span className="cdf-required">*</span></label>
            <input
              className={fieldClass("signatoryName")}
              name="signatoryName"
              placeholder="e.g. Ramesh Kumar"
              value={data.signatoryName || ""}
              onChange={handle}
              onBlur={handleBlur}
            />
            {err("signatoryName")}
          </div>

          <div className="col-md-6">
            <label className="cdf-label">Signatory Designation <span className="cdf-required">*</span></label>
            <input
              className={fieldClass("signatoryDesignation")}
              name="signatoryDesignation"
              placeholder="e.g. Chief Executive Officer"
              value={data.signatoryDesignation || ""}
              onChange={handle}
              onBlur={handleBlur}
            />
            {err("signatoryDesignation")}
          </div>

          {}
          <div className="col-12">
            <label className="cdf-label">
              Company Policy Text
              <span className="cdf-char-count ms-2">
                {policyLength}/{POLICY_MAX_LENGTH}
              </span>
            </label>
            <textarea
              className="form-control"
              name="companyPolicyText"
              rows={3}
              maxLength={POLICY_MAX_LENGTH}
              placeholder="Enter additional company policy notes to appear in the offer letter..."
              value={data.companyPolicyText || ""}
              onChange={handle}
            />
          </div>

          <div className="col-12">
            <div className="cdf-checkbox-card">
              <input
                className="form-check-input"
                type="checkbox"
                id="confidentialityClause"
                name="confidentialityClause"
                checked={!!data.confidentialityClause}
                onChange={handle}
              />
              <label htmlFor="confidentialityClause" className="ms-2">
                <strong>Confidentiality Clause</strong>
                <span className="cdf-hint d-block">
                  Enabling this will include a confidentiality clause in the generated offer letter.
                </span>
              </label>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default CommonDetailsForm;
