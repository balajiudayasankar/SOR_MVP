import React, { useEffect, useState, useCallback, useRef } from "react";
import { toast } from "react-toastify";
import { EMPLOYMENT_TYPE_OPTIONS } from "../../../constants/sor/sorConstants";
import { formatCurrency } from "../../../utils/sor/offerHelpers";
import "../../../styles/sor/components/FullTimeDetailsForm.css";



const isCurrencyInput = (v) => /^\d*\.?\d*$/.test(String(v));

const validate = (name, value) => {
  switch (name) {
    case "annualCtc":
      if (!value && value !== 0) return "Annual CTC is required.";
      if (Number(value) <= 0)    return "Annual CTC must be greater than ₹0.";
      return "";
    case "employmentType":
      return !value && value !== 0 ? "Employment type is required." : "";
    case "probationPeriod":
      return !value?.trim() ? "Probation period is required." : "";
    case "noticePeriod":
      return !value?.trim() ? "Notice period is required." : "";
    default:
      return "";
  }
};



const FullTimeDetailsForm = ({
  data,
  onChange,
  errors = {},
  setErrors,
  touched = {},
  setTouched,
}) => {
  const [autoCalculate, setAutoCalculate] = useState(true);
  const stableOnChange    = useCallback(onChange, []);
  const exceedsToastShown = useRef(false);

  
  const ctc        = Number(data.annualCtc)   || 0;
  const basic      = Number(data.basicSalary) || 0;
  const hra        = Number(data.hra)         || 0;
  const allowances = Number(data.allowances)  || 0;
  const monthlyCtc = ctc > 0 ? Math.round(ctc / 12) : 0;
  const totalFixed = basic + hra + allowances;
  const exceedsCtc = ctc > 0 && totalFixed > ctc;

  
  useEffect(() => {
    if (!autoCalculate || !ctc || ctc <= 0) return;
    const newBasic = Math.round(ctc * 0.4);
    const newHra   = Math.round(newBasic * 0.4);
    if (newBasic !== data.basicSalary || newHra !== data.hra) {
      stableOnChange({ ...data, basicSalary: newBasic, hra: newHra });
    }
  }, [ctc, autoCalculate, stableOnChange]);

  
  useEffect(() => {
    if (exceedsCtc && !exceedsToastShown.current) {
      toast.warning(
        `Fixed components (₹${totalFixed.toLocaleString("en-IN")}) exceed Annual CTC (₹${ctc.toLocaleString("en-IN")}). Please review your salary breakdown.`,
        { toastId: "exceeds-ctc", autoClose: 5000 }
      );
      exceedsToastShown.current = true;
    }
    if (!exceedsCtc) exceedsToastShown.current = false;
  }, [exceedsCtc]);

  
  const handle = (e) => {
    const { name, value, type, checked } = e.target;
    let val;

    if (type === "checkbox") {
      val = checked;
    } else if (
      type === "number" ||
      ["annualCtc", "basicSalary", "hra", "allowances", "bonusOrVariablePay", "joiningBonus"].includes(name)
    ) {
      if (value === "") { val = ""; }
      else if (isCurrencyInput(value)) { val = value; }
      else { return; }
    } else {
      val = value;
    }

    if (name === "basicSalary" || name === "hra") setAutoCalculate(false);

    const updated = { ...data, [name]: val };
    onChange(updated);

    if (touched[name]) {
      const err = validate(name, val);
      setErrors?.((prev) => ({ ...prev, [name]: err }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched?.((prev) => ({ ...prev, [name]: true }));

    const numericFields = ["annualCtc", "basicSalary", "hra", "allowances", "bonusOrVariablePay", "joiningBonus"];
    if (numericFields.includes(name) && value !== "") {
      const parsed = parseFloat(value);
      onChange({ ...data, [name]: isNaN(parsed) ? "" : parsed });
    }

    const err = validate(name, value);
    setErrors?.((prev) => ({ ...prev, [name]: err }));
    if (err) toast.error(err, { toastId: name });
  };

  const handleAutoCalcToggle = () => {
    const next = !autoCalculate;
    setAutoCalculate(next);
    if (next) {
      toast.info("Auto-calculate enabled. Basic & HRA will be recalculated from CTC.", {
        toastId: "auto-calc-on",
      });
    }
  };

  
  const fieldErr = (name) =>
    touched[name] && errors[name] ? (
      <div className="ftd-error">
        <i className="bi bi-exclamation-circle-fill me-1" />
        {errors[name]}
      </div>
    ) : null;

  const fc = (name) =>
    `form-control ${touched[name] ? (errors[name] ? "is-invalid-ftd" : "is-valid-ftd") : ""}`;

  const fs = (name) =>
    `form-select ${touched[name] ? (errors[name] ? "is-invalid-ftd" : "is-valid-ftd") : ""}`;

  const numVal = (name) => data[name] ?? "";

  
  return (
    <div className="ftd-wrapper">

      {}
      <div className="ftd-card">
        <div className="ftd-card-header">
          <i className="bi bi-briefcase-fill" />
          Employment Details
        </div>
        <div className="ftd-card-body row g-3">

          <div className="col-md-4">
            <label className="ftd-label">
              Employment Type <span className="ftd-req">*</span>
            </label>
            <select
              className={fs("employmentType")}
              name="employmentType"
              value={data.employmentType ?? EMPLOYMENT_TYPE_OPTIONS[0]?.value ?? ""}
              onChange={handle}
              onBlur={handleBlur}
            >
              {EMPLOYMENT_TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            {fieldErr("employmentType")}
          </div>

          <div className="col-md-4">
            <label className="ftd-label">
              Probation Period <span className="ftd-req">*</span>
            </label>
            <input
              className={fc("probationPeriod")}
              name="probationPeriod"
              placeholder="e.g. 90 days"
              value={data.probationPeriod || ""}
              onChange={handle}
              onBlur={handleBlur}
            />
            {fieldErr("probationPeriod")}
          </div>

          <div className="col-md-4">
            <label className="ftd-label">
              Notice Period <span className="ftd-req">*</span>
            </label>
            <input
              className={fc("noticePeriod")}
              name="noticePeriod"
              placeholder="e.g. 60 days"
              value={data.noticePeriod || ""}
              onChange={handle}
              onBlur={handleBlur}
            />
            {fieldErr("noticePeriod")}
          </div>

          <div className="col-12">
            <label className="ftd-label">Confirmation Terms</label>
            <textarea
              className="form-control"
              name="confirmationTerms"
              rows={2}
              placeholder="e.g. Confirmation subject to satisfactory performance review at the end of the probation period."
              value={data.confirmationTerms || ""}
              onChange={handle}
            />
          </div>

        </div>
      </div>

      {}
      <div className="ftd-card">
        <div className="ftd-card-header">
          <i className="bi bi-currency-rupee" />
          Compensation Structure
          <div className="ftd-auto-toggle ms-auto">
            <input
              type="checkbox"
              className="form-check-input"
              id="autoCalculate"
              checked={autoCalculate}
              onChange={handleAutoCalcToggle}
            />
            <label htmlFor="autoCalculate" className="ms-2 ftd-toggle-label">
              Auto Calculate
              <span className="ftd-hint ms-1">(Basic = 40% CTC, HRA = 40% Basic)</span>
            </label>
          </div>
        </div>
        <div className="ftd-card-body row g-3">

          {}
          <div className="col-md-4">
            <label className="ftd-label">
              Annual CTC (₹) <span className="ftd-req">*</span>
            </label>
            <div className="ftd-currency-wrap">
              <span className="ftd-currency-prefix">₹</span>
              <input
                type="text"
                inputMode="decimal"
                className={fc("annualCtc")}
                name="annualCtc"
                placeholder="e.g. 600000"
                value={numVal("annualCtc")}
                onChange={handle}
                onBlur={handleBlur}
              />
            </div>
            {fieldErr("annualCtc")}
            {ctc > 0 && (
              <div className="ftd-ctc-info">
                <span className="ftd-ctc-badge">
                  <i className="bi bi-calendar3 me-1" />
                  {formatCurrency(ctc)} / year
                </span>
                <span className="ftd-ctc-badge ms-2">
                  <i className="bi bi-cash me-1" />
                  {formatCurrency(monthlyCtc)} / month
                </span>
              </div>
            )}
          </div>

          {}
          <div className="col-md-4">
            <label className="ftd-label">
              Basic Salary (₹)
              {autoCalculate && <span className="ftd-auto-badge ms-2">Auto</span>}
            </label>
            <div className="ftd-currency-wrap">
              <span className="ftd-currency-prefix">₹</span>
              <input
                type="text"
                inputMode="decimal"
                className={`form-control ${autoCalculate ? "ftd-auto-input" : ""}`}
                name="basicSalary"
                placeholder="Auto-calculated"
                value={numVal("basicSalary")}
                onChange={handle}
                onBlur={handleBlur}
                readOnly={autoCalculate}
              />
            </div>
          </div>

          {}
          <div className="col-md-4">
            <label className="ftd-label">
              HRA (₹)
              {autoCalculate && <span className="ftd-auto-badge ms-2">Auto</span>}
            </label>
            <div className="ftd-currency-wrap">
              <span className="ftd-currency-prefix">₹</span>
              <input
                type="text"
                inputMode="decimal"
                className={`form-control ${autoCalculate ? "ftd-auto-input" : ""}`}
                name="hra"
                placeholder="Auto-calculated"
                value={numVal("hra")}
                onChange={handle}
                onBlur={handleBlur}
                readOnly={autoCalculate}
              />
            </div>
          </div>

          {}
          <div className="col-md-4">
            <label className="ftd-label">Special Allowances (₹)</label>
            <div className="ftd-currency-wrap">
              <span className="ftd-currency-prefix">₹</span>
              <input
                type="text"
                inputMode="decimal"
                className="form-control"
                name="allowances"
                placeholder="e.g. 50000"
                value={numVal("allowances")}
                onChange={handle}
                onBlur={handleBlur}
              />
            </div>
          </div>

          {}
          <div className="col-md-4">
            <label className="ftd-label">Bonus / Variable Pay (₹)</label>
            <div className="ftd-currency-wrap">
              <span className="ftd-currency-prefix">₹</span>
              <input
                type="text"
                inputMode="decimal"
                className="form-control"
                name="bonusOrVariablePay"
                placeholder="e.g. 60000"
                value={numVal("bonusOrVariablePay")}
                onChange={handle}
                onBlur={handleBlur}
              />
            </div>
          </div>

          {}
          <div className="col-md-4">
            <label className="ftd-label">Joining Bonus (₹)</label>
            <div className="ftd-currency-wrap">
              <span className="ftd-currency-prefix">₹</span>
              <input
                type="text"
                inputMode="decimal"
                className="form-control"
                name="joiningBonus"
                placeholder="Optional"
                value={numVal("joiningBonus")}
                onChange={handle}
                onBlur={handleBlur}
              />
            </div>
          </div>

          {}
          <div className="col-12">
            <label className="ftd-label">ESOP Details</label>
            <input
              className="form-control"
              name="esopDetails"
              placeholder="e.g. 500 RSUs vesting over 4 years with 1-year cliff"
              value={data.esopDetails || ""}
              onChange={handle}
            />
          </div>

          {}
          {totalFixed > 0 && (
            <div className="col-12">
              <div className={`ftd-ctc-summary ${exceedsCtc ? "ftd-ctc-summary--error" : "ftd-ctc-summary--ok"}`}>
                <div className="ftd-ctc-summary-row">
                  <span>Basic + HRA + Allowances</span>
                  <strong>{formatCurrency(totalFixed)}</strong>
                </div>
                <div className="ftd-ctc-summary-row">
                  <span>Annual CTC</span>
                  <strong>{ctc > 0 ? formatCurrency(ctc) : "—"}</strong>
                </div>
                {ctc > 0 && (
                  <div className="ftd-ctc-summary-row">
                    <span>Remaining (Variable + Bonus pool)</span>
                    <strong className={exceedsCtc ? "text-danger" : "text-success"}>
                      {exceedsCtc
                        ? `⚠ Exceeds by ${formatCurrency(totalFixed - ctc)}`
                        : formatCurrency(ctc - totalFixed)}
                    </strong>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {}
      <div className="ftd-card">
        <div className="ftd-card-header">
          <i className="bi bi-gift-fill" />
          Benefits &amp; Entitlements
        </div>
        <div className="ftd-card-body row g-3">

          <div className="col-md-6">
            <label className="ftd-label">Insurance Plan</label>
            <input
              className="form-control"
              name="insurancePlan"
              placeholder="e.g. Group Mediclaim — ₹3L per annum"
              value={data.insurancePlan || ""}
              onChange={handle}
            />
          </div>

          <div className="col-md-6">
            <label className="ftd-label">Leave Entitlement</label>
            <input
              className="form-control"
              name="leaveEntitlement"
              placeholder="e.g. 18 EL + 12 SL + 12 CL per year"
              value={data.leaveEntitlement || ""}
              onChange={handle}
            />
          </div>

          <div className="col-12">
            <label className="ftd-label">Other Benefits</label>
            <input
              className="form-control"
              name="otherBenefits"
              placeholder="e.g. Flexi-work, Cab facility, Meal vouchers"
              value={data.otherBenefits || ""}
              onChange={handle}
            />
          </div>

        </div>
      </div>

      {}
      <div className="ftd-card">
        <div className="ftd-card-header">
          <i className="bi bi-shield-fill-check" />
          Statutory &amp; Compliance
        </div>
        <div className="ftd-card-body row g-3">

          {[
            ["PF Eligible",        "pfEligibility",                  "Provident Fund deduction applicable as per EPF Act."],
            ["Gratuity Eligible",  "gratuityEligibility",            "Gratuity applicable after 5 years of continuous service."],
            ["BGV Required",       "backgroundVerificationRequired", "Background verification required before or on joining."],
            ["Non-Compete Clause", "nonCompeteEnabled",              "Candidate agrees not to join competitor for 12 months post-separation."],
          ].map(([label, name, hint]) => (
            <div className="col-md-6" key={name}>
              <div className="ftd-toggle-card">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id={name}
                  name={name}
                  checked={!!data[name]}
                  onChange={handle}
                />
                <label htmlFor={name} className="ms-2">
                  <strong>{label}</strong>
                  <span className="ftd-hint d-block">{hint}</span>
                </label>
              </div>
            </div>
          ))}

        </div>
      </div>

    </div>
  );
};

export default FullTimeDetailsForm;
