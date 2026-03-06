import React, { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import departmentService from "../../../../services/auth/departmentService";
import userService from "../../../../services/auth/userService";
import { APPROVAL_ROLE_OPTIONS } from "../../../../constants/sor/approvalRoles";
import "../../../../styles/sor/modals/approval_chains/AddChainModal.css";

const ROLE_NAME_MAP = {
  1: "hr",
  2: "hiringmanager",
  3: "finance",
  4: "hrhead",
};

const ROLE_OPTIONS = APPROVAL_ROLE_OPTIONS.map((o) => ({
  value: String(o.value),
  label: o.label,
}));

const uidCounter = { current: 1 };
const makeUid = () =>
  `step_${uidCounter.current++}_${Math.random().toString(36).slice(2, 7)}`;

const makeDefaultSteps = () =>
  APPROVAL_ROLE_OPTIONS.map((opt, i) => ({
    stepOrder:      i + 1,
    role:           opt.value,
    assignedUserId: "",
    isMandatory:    true,
    _id:            makeUid(),
  }));


const AcmDropdown = ({
  name, value, onChange, options,
  placeholder, error, disabled,
}) => {
  const [isOpen,     setIsOpen]     = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const ref = useRef(null);

  const selected = options.find((o) => String(o.value) === String(value));

  useEffect(() => {
    const handleOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    if (isOpen) document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setOpenUpward(
        window.innerHeight - rect.bottom < 250 &&
        rect.top > window.innerHeight - rect.bottom
      );
    }
  }, [isOpen]);

  const handleSelect = (val) => {
    onChange({ target: { name, value: val } });
    setIsOpen(false);
  };

  return (
    <div
      ref={ref}
      className={[
        "acm-dropdown",
        error    ? "acm-dropdown--error"    : "",
        isOpen   ? "acm-dropdown--open"     : "",
        disabled ? "acm-dropdown--disabled" : "",
      ].filter(Boolean).join(" ")}
    >
      <div
        className="acm-dropdown__selected"
        onClick={() => !disabled && setIsOpen((p) => !p)}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => e.key === "Enter" && !disabled && setIsOpen((p) => !p)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={`acm-dropdown__text ${!selected ? "acm-dropdown__text--ph" : ""}`}>
          {selected ? selected.label : placeholder}
        </span>
        <span className={`acm-dropdown__arrow ${isOpen ? "acm-dropdown__arrow--open" : ""}`} />
      </div>

      {isOpen && (
        <div
          className={`acm-dropdown__menu ${openUpward ? "acm-dropdown__menu--up" : ""}`}
          role="listbox"
        >
          {options.length === 0 ? (
            <div className="acm-dropdown__empty">No options available</div>
          ) : (
            options.map((opt) => (
              <div
                key={opt.value}
                role="option"
                aria-selected={String(value) === String(opt.value)}
                className={`acm-dropdown__option ${
                  String(value) === String(opt.value)
                    ? "acm-dropdown__option--selected"
                    : ""
                }`}
                onClick={() => handleSelect(opt.value)}
              >
                {opt.label}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};


const AddChainModal = ({ show, onClose, onCreate }) => {
  const [form,         setForm]    = useState({ chainName: "", departmentId: "", isDefault: false });
  const [steps,        setSteps]   = useState(makeDefaultSteps);
  const [depts,        setDepts]   = useState([]);
  const [allUsers,     setUsers]   = useState([]);
  const [loading,      setLoading] = useState(false);
  const [usersLoading, setUL]      = useState(false);
  const [errors,       setErrors]  = useState({});

  const deptOptions = [
    { label: "— Select Department —", value: "" },
    ...depts.map((d) => ({
      label: d.departmentName,
      value: String(d.departmentId),
    })),
  ];

  useEffect(() => {
    if (!show) return;
    let cancelled = false;

    departmentService
      .getActiveDepartments()
      .then((res) => { if (!cancelled) setDepts(res?.data || []); })
      .catch(() => { if (!cancelled) toast.error("Failed to load departments."); });

    setUL(true);
    userService
      .getAllUsers()
      .then((res) => {
        if (cancelled) return;
        const list = res?.data ?? res ?? [];
        setUsers(Array.isArray(list) ? list : []);
      })
      .catch(() => { if (!cancelled) toast.error("Failed to load users."); })
      .finally(() => { if (!cancelled) setUL(false); });

    return () => { cancelled = true; };
  }, [show]);

  const handleClose = useCallback(() => {
    if (loading) return;
    setForm({ chainName: "", departmentId: "", isDefault: false });
    setSteps(makeDefaultSteps());
    setErrors({});
    onClose();
  }, [loading, onClose]);

  useEffect(() => {
    if (!show) return;
    const onKey = (e) => { if (e.key === "Escape") handleClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [show, handleClose]);

  const normalizeRole = (r = "") => r.replace(/\s+/g, "").toLowerCase();

  const getUserOptions = (stepIdx) => {
    const step       = steps[stepIdx];
    const targetNorm = ROLE_NAME_MAP[Number(step.role)] ?? "";
    const takenIds   = steps
      .filter((_, i) => i !== stepIdx)
      .map((s) => String(s.assignedUserId))
      .filter(Boolean);

    const filtered = allUsers.filter((u) => {
      const roleNorm = normalizeRole(u.roleName ?? u.role ?? u.roleTitle ?? "");
      const uid      = String(u.userId ?? u.id ?? u.employeeId ?? "");
      return roleNorm === targetNorm && !takenIds.includes(uid);
    });

    return [
      { label: "— Assign User —", value: "" },
      ...filtered.map((u) => ({
        label:
          `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() ||
          u.email ||
          `User ${u.userId}`,
        value: String(u.userId ?? u.id ?? u.employeeId),
      })),
    ];
  };

  const handleStepChange = (idx, field, value) => {
    setSteps((prev) =>
      prev.map((s, i) => {
        if (i !== idx) return s;
        if (field === "role") return { ...s, role: Number(value), assignedUserId: "" };
        return { ...s, [field]: value };
      })
    );
    if (errors.steps) setErrors((prev) => ({ ...prev, steps: "" }));
  };

  const handleAddStep = () => {
    const maxOrder = Math.max(...steps.map((s) => s.stepOrder), 0);
    setSteps((prev) => [
      ...prev,
      {
        stepOrder:      maxOrder + 1,
        role:           APPROVAL_ROLE_OPTIONS[0].value,
        assignedUserId: "",
        isMandatory:    true,
        _id:            makeUid(),
      },
    ]);
  };

  const handleRemoveStep = (idx) => {
    if (steps.length === 1) {
      toast.warning("At least one approval step is required.");
      return;
    }
    setSteps((prev) =>
      prev
        .filter((_, i) => i !== idx)
        .map((s, i) => ({ ...s, stepOrder: i + 1 }))
    );
  };

  const handleMoveStep = (idx, direction) => {
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= steps.length) return;
    setSteps((prev) => {
      const next = [...prev];
      [next[idx], next[targetIdx]] = [next[targetIdx], next[idx]];
      return next.map((s, i) => ({ ...s, stepOrder: i + 1 }));
    });
  };

  const handle = (e) => {
    const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [e.target.name]: val }));
    if (errors[e.target.name])
      setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.chainName.trim())
      e.chainName = "Chain name is required.";
    else if (form.chainName.trim().length < 3)
      e.chainName = "Minimum 3 characters.";

    if (!form.departmentId) e.departmentId = "Department is required.";

    if (steps.length === 0) {
      e.steps = "At least one approval step is required.";
    } else {
      const emptyIdx = steps.findIndex((s) => !s.assignedUserId);
      if (emptyIdx !== -1) {
        e.steps = `Step ${emptyIdx + 1}: please assign a user.`;
      } else {
        const ids    = steps.map((s) => String(s.assignedUserId)).filter(Boolean);
        const unique = new Set(ids);
        if (unique.size < ids.length)
          e.steps = "The same user cannot be assigned to multiple steps.";
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) {
      toast.error("Please fix the errors before submitting.");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        chainName:    form.chainName.trim(),
        departmentId: Number(form.departmentId),
        isDefault:    form.isDefault,
        steps: steps.map((s) => ({
          stepOrder:      s.stepOrder,
          role:           Number(s.role),
          assignedUserId: Number(s.assignedUserId),
          isMandatory:    true,
        })),
      };
      const ok = await onCreate(payload);
      if (ok) {
        toast.success("Approval chain created successfully!");
        handleClose();
      } else {
        toast.error("Failed to create approval chain. Please try again.");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <>
      <div
        className="acm-backdrop"
        onClick={loading ? undefined : handleClose}
        style={{ cursor: loading ? "not-allowed" : "pointer" }}
      />

      <div
        className="acm-modal-container"
        role="dialog"
        aria-modal="true"
        aria-labelledby="acm-modal-title"
      >
        {}
        <div className="acm-modal-dialog">

          {}
          <div className="acm-modal-header">
            <div className="acm-header-title" id="acm-modal-title">
              <i className="bi bi-link-45deg me-2" />
              Create Approval Chain
            </div>
            <button
              type="button"
              className="acm-close-btn"
              onClick={handleClose}
              disabled={loading}
              aria-label="Close modal"
            >
              <i className="bi bi-x-lg" />
            </button>
          </div>

          {}
          <form className="acm-form" onSubmit={handleSubmit}>

            {}
            <div className="acm-modal-body">

              {}
              <div className="acm-section">
                <div className="acm-section__title">
                  <i className="bi bi-sliders me-2" />
                  Chain Configuration
                </div>

                <div className="acm-form-grid">

                  <div className="acm-form-group acm-form-group--wide">
                    <label className="acm-form-label" htmlFor="chainName">
                      Chain Name <span className="acm-required">*</span>
                    </label>
                    <input
                      id="chainName"
                      type="text"
                      name="chainName"
                      className={`acm-form-input ${errors.chainName ? "acm-form-input--error" : ""}`}
                      placeholder="e.g. Default Offer Approval Chain"
                      value={form.chainName}
                      onChange={handle}
                      maxLength={150}
                      autoComplete="off"
                    />
                    <div className="acm-char-hint">{form.chainName.trim().length}/150</div>
                    {errors.chainName && (
                      <div className="acm-form-error">
                        <i className="bi bi-exclamation-circle me-1" />
                        {errors.chainName}
                      </div>
                    )}
                  </div>

                  <div className="acm-form-group">
                    <label className="acm-form-label">
                      Department <span className="acm-required">*</span>
                    </label>
                    <AcmDropdown
                      name="departmentId"
                      value={form.departmentId}
                      onChange={handle}
                      options={deptOptions}
                      placeholder="— Select Department —"
                      error={!!errors.departmentId}
                    />
                    {errors.departmentId && (
                      <div className="acm-form-error">
                        <i className="bi bi-exclamation-circle me-1" />
                        {errors.departmentId}
                      </div>
                    )}
                  </div>

                  <div className="acm-form-group">
                    <label className="acm-form-label">Default Chain</label>
                    <div
                      className={`acm-toggle-wrapper ${form.isDefault ? "acm-toggle-wrapper--on" : ""}`}
                      onClick={() =>
                        handle({
                          target: { name: "isDefault", type: "checkbox", checked: !form.isDefault },
                        })
                      }
                      role="switch"
                      aria-checked={form.isDefault}
                      tabIndex={0}
                      onKeyDown={(e) =>
                        e.key === "Enter" &&
                        handle({
                          target: { name: "isDefault", type: "checkbox", checked: !form.isDefault },
                        })
                      }
                    >
                      <div className={`acm-toggle ${form.isDefault ? "acm-toggle--on" : ""}`}>
                        <div className="acm-toggle__knob" />
                      </div>
                      <span className="acm-toggle__label">
                        {form.isDefault ? "Yes — Set as default" : "No — Not default"}
                      </span>
                    </div>
                  </div>

                </div>
              </div>

              {}
              <div className="acm-section">
                <div className="acm-section__title">
                  <i className="bi bi-diagram-3-fill me-2" />
                  Approval Steps
                  <span className="acm-step-pill">
                    {steps.length} step{steps.length !== 1 ? "s" : ""}
                  </span>
                  <span className="acm-mandatory-note">
                    <i className="bi bi-shield-check me-1" />
                    All steps are mandatory
                  </span>
                </div>

                {usersLoading ? (
                  <div className="acm-users-loading">
                    <div className="spinner-border spinner-border-sm acm-loading-spinner" role="status" />
                    <span>Loading users...</span>
                  </div>
                ) : (
                  <div className="acm-steps-list">
                    <div className="acm-steps-header">
                      <div>#</div>
                      <div>Role</div>
                      <div>Assigned User</div>
                      <div>Actions</div>
                    </div>

                    {steps.map((step, idx) => {
                      const userOpts       = getUserOptions(idx);
                      const noUsersForRole = userOpts.length === 1;

                      return (
                        <div key={step._id} className="acm-step-row">
                          <div className="acm-col-order">
                            <div className="acm-order-badge">{step.stepOrder}</div>
                          </div>

                          <div className="acm-col-role">
                            <AcmDropdown
                              name={`role_${idx}`}
                              value={String(step.role)}
                              onChange={(e) => handleStepChange(idx, "role", e.target.value)}
                              options={ROLE_OPTIONS}
                              placeholder="Select Role"
                            />
                          </div>

                          <div className="acm-col-user">
                            <AcmDropdown
                              name={`user_${idx}`}
                              value={String(step.assignedUserId)}
                              onChange={(e) =>
                                handleStepChange(idx, "assignedUserId", e.target.value)
                              }
                              options={userOpts}
                              placeholder="— Assign User —"
                              disabled={!step.role}
                            />
                            {noUsersForRole && step.role && (
                              <div className="acm-no-users-hint">
                                <i className="bi bi-exclamation-triangle-fill me-1" />
                                No users available for this role
                              </div>
                            )}
                          </div>

                          <div className="acm-col-actions">
                            <button
                              type="button"
                              className="acm-step-action-btn acm-step-action-btn--up"
                              onClick={() => handleMoveStep(idx, -1)}
                              disabled={idx === 0}
                              title="Move up"
                            >
                              <i className="bi bi-chevron-up" />
                            </button>
                            <button
                              type="button"
                              className="acm-step-action-btn acm-step-action-btn--down"
                              onClick={() => handleMoveStep(idx, 1)}
                              disabled={idx === steps.length - 1}
                              title="Move down"
                            >
                              <i className="bi bi-chevron-down" />
                            </button>
                            <button
                              type="button"
                              className="acm-step-action-btn acm-step-action-btn--delete"
                              onClick={() => handleRemoveStep(idx)}
                              title="Remove step"
                            >
                              <i className="bi bi-trash3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    <button
                      type="button"
                      className="acm-add-step-btn"
                      onClick={handleAddStep}
                    >
                      <i className="bi bi-plus-circle me-1" />
                      Add Step
                    </button>
                  </div>
                )}

                {errors.steps && (
                  <div className="acm-form-error acm-form-error--block">
                    <i className="bi bi-exclamation-circle me-1" />
                    {errors.steps}
                  </div>
                )}
              </div>

              <div className="acm-info-alert">
                <i className="bi bi-info-circle-fill me-2" />
                <small>
                  Users are filtered by their assigned role. The same user cannot
                  appear in more than one step. Use the arrows to reorder steps.
                </small>
              </div>

            </div>{}

            {}
            <div className="acm-modal-footer">
              <button
                type="button"
                className="acm-btn-cancel"
                onClick={handleClose}
                disabled={loading}
              >
                <i className="bi bi-x-circle me-1" />
                Cancel
              </button>
              <button type="submit" className="acm-btn-submit" disabled={loading}>
                {loading ? (
                  <><span className="acm-spinner" />Creating...</>
                ) : (
                  <><i className="bi bi-check-circle me-1" />Create Chain</>
                )}
              </button>
            </div>

          </form>{}

        </div>
      </div>
    </>
  );
};

export default AddChainModal;
