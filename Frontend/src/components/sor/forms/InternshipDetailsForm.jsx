import React, { useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { PAY_FREQUENCY_OPTIONS } from "../../../constants/sor/sorConstants";
import "../../../styles/sor/components/InternshipDetailsForm.css";


const REQUIRED_CURRENCY_FIELDS = ["stipendAmount"];
const OPTIONAL_CURRENCY_FIELDS = [
  "joiningBonus", "retentionBonus", "fullTimeSalaryAfterInternship",
  "insuranceAmount", "breakageCharges", "accommodationCost",
];
const INTEGER_FIELDS = ["durationMonths", "serviceAgreementDurationMonths"];
const ENUM_FIELDS    = ["payFrequency"];



const isCurrency = (v) => /^\d+(\.\d{0,2})?$/.test(String(v));
const isPositive = (v) => Number(v) > 0;

const validate = (name, value, fullData = {}) => {
  switch (name) {
    case "internshipStartDate":
      return !value ? "Start date is required." : "";
    case "internshipEndDate":
      if (!value) return "End date is required.";
      if (fullData.internshipStartDate && value <= fullData.internshipStartDate)
        return "End date must be after the start date.";
      return "";
    case "stipendAmount":
      if (!value && value !== 0) return "Stipend amount is required.";
      if (!isPositive(value))    return "Stipend must be greater than ₹0.";
      return "";
    case "payFrequency":
      return !value && value !== 0 ? "Pay frequency is required." : "";
    case "paymentTiming":
      return !value?.trim() ? "Payment timing is required." : "";
    case "trainingLocation":
      return !value?.trim() ? "Training location is required." : "";
    case "trainingInstitution":
      return !value?.trim() ? "Training institution is required." : "";
    case "serviceAgreementDurationMonths":
      if (value !== null && value !== "" && (isNaN(value) || Number(value) < 1))
        return "Must be at least 1 month.";
      return "";
    default:
      return "";
  }
};


const InternshipDetailsForm = ({ data, onChange, errors = {}, setErrors, touched = {}, setTouched }) => {

  
  const stableOnChange = useCallback(onChange, []);

  
  useEffect(() => {
    if (!data.internshipStartDate || !data.internshipEndDate) return;
    const start = new Date(data.internshipStartDate);
    const end   = new Date(data.internshipEndDate);
    if (end <= start) return;

    const months =
      (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth());

    const calculated = Math.max(months, 1);
    if (calculated !== data.durationMonths)
      stableOnChange({ ...data, durationMonths: calculated });

  }, [data.internshipStartDate, data.internshipEndDate, stableOnChange]);

  
  const handle = (e) => {
    const { name, value, type, checked } = e.target;
    let val;

    if (type === "checkbox") {
      val = checked;
    } else if (ENUM_FIELDS.includes(name)) {
      val = Number(value);
    } else if (REQUIRED_CURRENCY_FIELDS.includes(name) || OPTIONAL_CURRENCY_FIELDS.includes(name)) {
      
      
      if (value === "") {
        val = OPTIONAL_CURRENCY_FIELDS.includes(name) ? null : "";
      } else if (/^\d*\.?\d{0,2}$/.test(value)) {
        val = value; 
      } else {
        return; 
      }
    } else if (INTEGER_FIELDS.includes(name)) {
      if (value === "") { val = null; }
      else if (/^\d+$/.test(value)) { val = Number(value); }
      else return;
    } else {
      val = value;
    }

    const updated = { ...data, [name]: val };
    onChange(updated);

    if (touched[name]) {
      const err = validate(name, val, updated);
      setErrors?.((prev) => ({ ...prev, [name]: err }));
      
      if (err && REQUIRED_CURRENCY_FIELDS.includes(name))
        toast.error(err, { toastId: name });
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched?.((prev) => ({ ...prev, [name]: true }));

    
    let finalVal = data[name];
    if ((REQUIRED_CURRENCY_FIELDS.includes(name) || OPTIONAL_CURRENCY_FIELDS.includes(name))
        && value !== "" && value !== null) {
      finalVal = parseFloat(value);
      onChange({ ...data, [name]: isNaN(finalVal) ? null : finalVal });
    }

    const err = validate(name, finalVal ?? value, data);
    setErrors?.((prev) => ({ ...prev, [name]: err }));
    if (err) toast.error(err, { toastId: name });
  };

  
  const fieldErr = (name) =>
    touched[name] && errors[name] ? (
      <div className="idf-error">
        <i className="bi bi-exclamation-circle-fill me-1" />
        {errors[name]}
      </div>
    ) : null;

  const fc = (name) =>
    `form-control ${touched[name] ? (errors[name] ? "is-invalid-idf" : "is-valid-idf") : ""}`;

  const fs = (name) =>
    `form-select ${touched[name] ? (errors[name] ? "is-invalid-idf" : "is-valid-idf") : ""}`;

  
  const numVal = (name) => data[name] ?? "";

  
  return (
    <div className="idf-wrapper">

      {}
      <div className="idf-card">
        <div className="idf-card-header">
          <i className="bi bi-calendar-event-fill me-2" />
          Internship Duration
        </div>
        <div className="idf-card-body row g-3">

          <div className="col-md-4">
            <label className="idf-label">Start Date <span className="idf-req">*</span></label>
            <input
              type="date"
              className={fc("internshipStartDate")}
              name="internshipStartDate"
              value={data.internshipStartDate || ""}
              onChange={handle}
              onBlur={handleBlur}
            />
            {fieldErr("internshipStartDate")}
          </div>

          {}
          <div className="col-md-4">
            <label className="idf-label">End Date <span className="idf-req">*</span></label>
            <input
              type="date"
              className={fc("internshipEndDate")}
              name="internshipEndDate"
              min={data.internshipStartDate
                ? new Date(new Date(data.internshipStartDate).getTime() + 86400000)
                    .toISOString().split("T")[0]
                : undefined}
              value={data.internshipEndDate || ""}
              onChange={handle}
              onBlur={handleBlur}
            />
            {fieldErr("internshipEndDate")}
          </div>

          <div className="col-md-4">
            <label className="idf-label">Duration (Months)</label>
            <div className="idf-readonly-box">
              <i className="bi bi-clock-history me-2 text-muted" />
              {data.durationMonths
                ? `${data.durationMonths} month${data.durationMonths > 1 ? "s" : ""}`
                : <span className="text-muted">Auto-calculated</span>}
            </div>
            <small className="idf-helper">Calculated from start & end dates</small>
          </div>

        </div>
      </div>

      {}
      {}
      <div className="idf-card">
        <div className="idf-card-header">
          <i className="bi bi-mortarboard-fill me-2" />
          Training Details
        </div>
        <div className="idf-card-body row g-3">

          <div className="col-md-6">
            <label className="idf-label">Training Location <span className="idf-req">*</span></label>
            <input
              className={fc("trainingLocation")}
              name="trainingLocation"
              placeholder="e.g. Chennai Office, Block A"
              value={data.trainingLocation || ""}
              onChange={handle}
              onBlur={handleBlur}
            />
            {fieldErr("trainingLocation")}
          </div>

          <div className="col-md-6">
            <label className="idf-label">Training Institution <span className="idf-req">*</span></label>
            <input
              className={fc("trainingInstitution")}
              name="trainingInstitution"
              placeholder="e.g. IIT Madras / In-House"
              value={data.trainingInstitution || ""}
              onChange={handle}
              onBlur={handleBlur}
            />
            {fieldErr("trainingInstitution")}
          </div>

          <div className="col-md-6">
            <label className="idf-label">Training Duration</label>
            <input
              className="form-control"
              name="trainingDuration"
              placeholder="e.g. 2 Weeks Classroom + On-the-job"
              value={data.trainingDuration || ""}
              onChange={handle}
            />
          </div>

          <div className="col-md-6">
            <label className="idf-label">Training Working Days</label>
            <input
              className="form-control"
              name="trainingWorkingDays"
              placeholder="e.g. Monday – Friday"
              value={data.trainingWorkingDays || ""}
              onChange={handle}
            />
          </div>

        </div>
      </div>

      {}
      <div className="idf-card">
        <div className="idf-card-header">
          <i className="bi bi-cash-stack me-2" />
          Stipend & Payment
        </div>
        <div className="idf-card-body row g-3">

          <div className="col-md-4">
            <label className="idf-label">Stipend Amount (₹) <span className="idf-req">*</span></label>
            <div className="idf-currency-wrap">
              <span className="idf-currency-prefix">₹</span>
              <input
                type="text"
                inputMode="decimal"
                className={fc("stipendAmount")}
                name="stipendAmount"
                placeholder="e.g. 15000"
                
                value={numVal("stipendAmount")}
                onChange={handle}
                onBlur={handleBlur}
              />
            </div>
            {fieldErr("stipendAmount")}
          </div>

          {}
          <div className="col-md-4">
            <label className="idf-label">Pay Frequency <span className="idf-req">*</span></label>
            <select
              className={fs("payFrequency")}
              name="payFrequency"
              value={data.payFrequency ?? PAY_FREQUENCY_OPTIONS[0]?.value ?? ""}
              onChange={handle}
              onBlur={handleBlur}
            >
              {PAY_FREQUENCY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            {fieldErr("payFrequency")}
          </div>

          <div className="col-md-4">
            <label className="idf-label">Payment Timing <span className="idf-req">*</span></label>
            <input
              className={fc("paymentTiming")}
              name="paymentTiming"
              placeholder="e.g. End of month"
              value={data.paymentTiming || ""}
              onChange={handle}
              onBlur={handleBlur}
            />
            {fieldErr("paymentTiming")}
          </div>

        </div>
      </div>

      {}
      <div className="idf-card">
        <div className="idf-card-header">
          <i className="bi bi-gift-fill me-2" />
          Benefits & Bonuses
        </div>
        <div className="idf-card-body row g-3">

          {[
            ["Full-Time Salary After Internship (₹)", "fullTimeSalaryAfterInternship", "e.g. 400000"],
            ["Joining Bonus (₹)",                     "joiningBonus",                  "e.g. 10000"],
            ["Retention Bonus (₹)",                   "retentionBonus",                "e.g. 5000"],
          ].map(([label, name, placeholder]) => (
            <div className="col-md-4" key={name}>
              <label className="idf-label">{label}</label>
              <div className="idf-currency-wrap">
                <span className="idf-currency-prefix">₹</span>
                {}
                <input
                  type="text"
                  inputMode="decimal"
                  className="form-control"
                  name={name}
                  placeholder={placeholder}
                  value={numVal(name)}
                  onChange={handle}
                  onBlur={handleBlur}
                />
              </div>
            </div>
          ))}

          <div className="col-12">
            <label className="idf-label">Other Benefits</label>
            <input
              className="form-control"
              name="otherBenefits"
              placeholder="e.g. Free lunch, Transport, Laptop provided"
              value={data.otherBenefits || ""}
              onChange={handle}
            />
          </div>

        </div>
      </div>

      {}
      {}
      {}
      <div className="idf-card">
        <div className="idf-card-header">
          <i className="bi bi-shield-fill-check me-2" />
          Insurance
        </div>
        <div className="idf-card-body row g-3">

          <div className="col-12">
            <div className="idf-toggle-card">
              <input
                type="checkbox"
                className="form-check-input"
                id="insuranceEnabled"
                name="insuranceEnabled"
                checked={!!data.insuranceEnabled}
                onChange={handle}
              />
              <label htmlFor="insuranceEnabled" className="ms-2">
                <strong>Insurance Coverage Enabled</strong>
                <span className="idf-hint d-block">
                  Enable to provide health/accident insurance to the intern.
                </span>
              </label>
            </div>
          </div>

          {data.insuranceEnabled && (
            <div className="col-md-4">
              <label className="idf-label">Insurance Amount (₹) <span className="idf-req">*</span></label>
              <div className="idf-currency-wrap">
                <span className="idf-currency-prefix">₹</span>
                <input
                  type="text"
                  inputMode="decimal"
                  className={fc("insuranceAmount")}
                  name="insuranceAmount"
                  placeholder="e.g. 100000"
                  value={numVal("insuranceAmount")}
                  onChange={handle}
                  onBlur={handleBlur}
                />
              </div>
              {fieldErr("insuranceAmount")}
            </div>
          )}

        </div>
      </div>

      {}
      {}
      <div className="idf-card">
        <div className="idf-card-header">
          <i className="bi bi-house-fill me-2" />
          Accommodation
        </div>
        <div className="idf-card-body row g-3">

          <div className="col-12">
            <div className="idf-toggle-card">
              <input
                type="checkbox"
                className="form-check-input"
                id="accommodationAvailable"
                name="accommodationAvailable"
                checked={!!data.accommodationAvailable}
                onChange={handle}
              />
              <label htmlFor="accommodationAvailable" className="ms-2">
                <strong>Accommodation Available</strong>
                <span className="idf-hint d-block">
                  Enable if the company provides accommodation to the intern.
                </span>
              </label>
            </div>
          </div>

          {data.accommodationAvailable && (
            <div className="col-md-4">
              <label className="idf-label">Accommodation Cost (₹/month)</label>
              <div className="idf-currency-wrap">
                <span className="idf-currency-prefix">₹</span>
                <input
                  type="text"
                  inputMode="decimal"
                  className="form-control"
                  name="accommodationCost"
                  placeholder="e.g. 5000"
                  value={numVal("accommodationCost")}
                  onChange={handle}
                  onBlur={handleBlur}
                />
              </div>
            </div>
          )}

        </div>
      </div>

      {}
      {}
      <div className="idf-card">
        <div className="idf-card-header">
          <i className="bi bi-file-earmark-text-fill me-2" />
          Service Agreement & Terms
        </div>
        <div className="idf-card-body row g-3">

          <div className="col-md-4">
            <label className="idf-label">Agreement Duration (Months)</label>
            <input
              type="text"
              inputMode="numeric"
              className={fc("serviceAgreementDurationMonths")}
              name="serviceAgreementDurationMonths"
              placeholder="e.g. 12"
              value={numVal("serviceAgreementDurationMonths")}
              onChange={handle}
              onBlur={handleBlur}
            />
            {fieldErr("serviceAgreementDurationMonths")}
          </div>

          <div className="col-md-4">
            <label className="idf-label">Agreement Period</label>
            <input
              className="form-control"
              name="serviceAgreementPeriod"
              placeholder="e.g. 1 Year from joining"
              value={data.serviceAgreementPeriod || ""}
              onChange={handle}
            />
          </div>

          <div className="col-md-4">
            <label className="idf-label">Breakage Charges (₹)</label>
            <div className="idf-currency-wrap">
              <span className="idf-currency-prefix">₹</span>
              <input
                type="text"
                inputMode="decimal"
                className="form-control"
                name="breakageCharges"
                placeholder="e.g. 50000"
                value={numVal("breakageCharges")}
                onChange={handle}
                onBlur={handleBlur}
              />
            </div>
          </div>

          <div className="col-12">
            <label className="idf-label">Certificate Retention Terms</label>
            <textarea
              className="form-control"
              name="certificateRetentionTerms"
              rows={2}
              placeholder="e.g. Original certificates will be returned after completion of the service agreement period."
              value={data.certificateRetentionTerms || ""}
              onChange={handle}
            />
          </div>

        </div>
      </div>

      {}
      {}
      <div className="idf-card">
        <div className="idf-card-header">
          <i className="bi bi-folder-fill me-2" />
          Required Documents on Joining
        </div>
        <div className="idf-card-body">
          <textarea
            className="form-control"
            name="requiredDocuments"
            rows={3}
            placeholder={`List documents required on Day 1, e.g.:\n• Aadhaar Card (Original + Copy)\n• 10th & 12th Marksheets\n• College ID / Enrollment Letter`}
            value={data.requiredDocuments || ""}
            onChange={handle}
          />
        </div>
      </div>

    </div>
  );
};

export default InternshipDetailsForm;
