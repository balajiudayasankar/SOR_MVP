import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import departmentService from '../../../../services/auth/departmentService';
import userService from '../../../../services/auth/userService';
import { APPROVAL_ROLE_OPTIONS } from '../../../../constants/sor/approvalRoles';
import '../../../../styles/sor/modals/approval_chains/EditChainModal.css';


const ROLE_STR_TO_NUM = {
  HR:             1,
  HiringManager:  2,
  Finance:        3,
  HRHead:         4,
};


const ROLE_NAME_MAP = {
  1: 'hr',
  2: 'hiringmanager',
  3: 'finance',
  4: 'hrhead',
};


const ROLE_OPTIONS = APPROVAL_ROLE_OPTIONS.map(o => ({
  value: String(o.value),
  label: o.label,
}));


const EcmDropdown = ({ name, value, onChange, options, placeholder, error, disabled }) => {
  const [isOpen, setIsOpen]         = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const ref = useRef(null);

  const selected = options.find(o => String(o.value) === String(value));

  useEffect(() => {
    const handleOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    if (isOpen) document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
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
        'ecm-dropdown',
        error    ? 'ecm-dropdown--error'    : '',
        isOpen   ? 'ecm-dropdown--open'     : '',
        disabled ? 'ecm-dropdown--disabled' : '',
      ].filter(Boolean).join(' ')}
    >
      <div
        className="ecm-dropdown__selected"
        onClick={() => !disabled && setIsOpen(prev => !prev)}
      >
        <span className={`ecm-dropdown__text ${!selected ? 'ecm-dropdown__text--ph' : ''}`}>
          {selected ? selected.label : placeholder}
        </span>
        <span className={`ecm-dropdown__arrow ${isOpen ? 'ecm-dropdown__arrow--open' : ''}`} />
      </div>

      {isOpen && (
        <div className={`ecm-dropdown__menu ${openUpward ? 'ecm-dropdown__menu--up' : ''}`}>
          {options.length === 0 ? (
            <div className="ecm-dropdown__empty">No options available</div>
          ) : (
            options.map(opt => (
              <div
                key={opt.value}
                className={`ecm-dropdown__option ${
                  String(value) === String(opt.value) ? 'ecm-dropdown__option--selected' : ''
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


const EditChainModal = ({ show, onClose, chain, onUpdate }) => {
  const [form, setForm]         = useState({ chainName: '', departmentId: '', isDefault: false });
  const [steps, setSteps]       = useState([]);
  const [departments, setDepts] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [usersLoading, setUL]   = useState(false);
  const [errors, setErrors]     = useState({});

  const deptOptions = [
    { label: '— Select Department —', value: '' },
    ...departments.map(d => ({
      label: d.departmentName,
      value: String(d.departmentId),
    })),
  ];

  
  useEffect(() => {
    if (!show || !chain) return;

    setForm({
      chainName:    chain.chainName    || '',
      departmentId: String(chain.departmentId || ''),
      isDefault:    chain.isDefault    || false,
    });

    setSteps(
      (chain.steps || []).map((s, i) => ({
        ...s,
        role: typeof s.role === 'string'
          ? ROLE_STR_TO_NUM[s.role] || 1
          : Number(s.role),
        assignedUserId: String(s.assignedUserId || ''),
        isMandatory:    true,
        _id:            s.approvalChainStepId || i,
      }))
    );

    departmentService.getActiveDepartments()
      .then(res => setDepts(res.data || []))
      .catch(() => {});

    setUL(true);
    userService.getAllUsers()
      .then(res => {
        const list = res?.data ?? res ?? [];
        setAllUsers(Array.isArray(list) ? list : []);
      })
      .catch(() => toast.error('Failed to load users.'))
      .finally(() => setUL(false));

    setErrors({});
  }, [chain, show]);

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  
  const normalizeRole = (r = '') => r.replace(/\s+/g, '').toLowerCase();

  const getUserOptions = (stepIdx) => {
    const step       = steps[stepIdx];
    const targetNorm = ROLE_NAME_MAP[Number(step.role)] ?? '';

    const takenIds = steps
      .filter((_, i) => i !== stepIdx)
      .map(s => String(s.assignedUserId))
      .filter(Boolean);

    const filtered = allUsers.filter(u => {
      const roleName = u.roleName ?? u.role ?? u.roleTitle ?? '';
      const roleNorm = normalizeRole(roleName);
      const uid      = String(u.userId ?? u.id ?? u.employeeId ?? '');
      return roleNorm === targetNorm && !takenIds.includes(uid);
    });

    return [
      { label: '— Assign User —', value: '' },
      ...filtered.map(u => ({
        label: `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || u.email || `User ${u.userId}`,
        value: String(u.userId ?? u.id ?? u.employeeId),
      })),
    ];
  };

  
  const handleStepChange = (idx, field, value) => {
    setSteps(prev => prev.map((s, i) => {
      if (i !== idx) return s;
      if (field === 'role') return { ...s, role: Number(value), assignedUserId: '' };
      return { ...s, [field]: value };
    }));
    if (errors.steps) setErrors(prev => ({ ...prev, steps: '' }));
  };

  const handleAddStep = () => {
    const maxOrder = Math.max(...steps.map(s => s.stepOrder), 0);
    setSteps(prev => [
      ...prev,
      {
        stepOrder:      maxOrder + 1,
        role:           APPROVAL_ROLE_OPTIONS[0].value,
        assignedUserId: '',
        isMandatory:    true,
        _id:            Date.now(),
      },
    ]);
  };

  
  const handle = (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm(prev => ({ ...prev, [e.target.name]: val }));
    if (errors[e.target.name]) setErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  
  const validate = () => {
    const e = {};

    if (!form.chainName.trim())
      e.chainName = 'Chain name is required';
    else if (form.chainName.trim().length < 3)
      e.chainName = 'Minimum 3 characters';

    if (!form.departmentId)
      e.departmentId = 'Department is required';

    const emptyIdx = steps.findIndex(s => !s.assignedUserId);
    if (emptyIdx !== -1) {
      e.steps = `Step ${emptyIdx + 1} has no assigned user`;
    } else {
      const ids    = steps.map(s => String(s.assignedUserId)).filter(Boolean);
      const unique = new Set(ids);
      if (unique.size < ids.length)
        e.steps = 'The same user cannot be assigned to multiple steps';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  
  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) {
      toast.error('Please fix the errors before submitting.');
      return;
    }
    setLoading(true);
    const payload = {
      chainName:    form.chainName.trim(),
      departmentId: Number(form.departmentId),
      isDefault:    form.isDefault,
      steps: steps.map(s => ({
        stepOrder:      s.stepOrder,
        role:           Number(s.role),
        assignedUserId: Number(s.assignedUserId),
        isMandatory:    true,
      })),
    };
    const ok = await onUpdate(chain.approvalChainId, payload);
    setLoading(false);
    if (ok) handleClose();
  };

  if (!show || !chain) return null;

  return (
    <>
      <div className="ecm-backdrop" onClick={handleClose} />

      <div className="ecm-modal-container">
        <div className="ecm-modal-dialog">

          {}
          <div className="ecm-modal-header">
            <div className="ecm-header-title">
              <i className="bi bi-pencil-square"></i>
              Edit Approval Chain
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

          <form onSubmit={handleSubmit}>
            <div className="ecm-modal-body">

              {}
              <div className="ecm-section">
                <div className="ecm-section__title">
                  <i className="bi bi-sliders"></i>
                  Chain Configuration
                </div>

                <div className="ecm-form-grid">

                  {}
                  <div className="ecm-form-group ecm-form-group--wide">
                    <label className="ecm-form-label">
                      Chain Name <span className="ecm-required">*</span>
                    </label>
                    <input
                      type="text"
                      name="chainName"
                      className={`ecm-form-input ${errors.chainName ? 'ecm-form-input--error' : ''}`}
                      placeholder="e.g. Default Offer Approval Chain"
                      value={form.chainName}
                      onChange={handle}
                      maxLength={150}
                      autoComplete="off"
                    />
                    {errors.chainName && (
                      <div className="ecm-form-error">
                        <i className="bi bi-exclamation-circle"></i>
                        {errors.chainName}
                      </div>
                    )}
                  </div>

                  {}
                  <div className="ecm-form-group">
                    <label className="ecm-form-label">
                      Department <span className="ecm-required">*</span>
                    </label>
                    <EcmDropdown
                      name="departmentId"
                      value={form.departmentId}
                      onChange={handle}
                      options={deptOptions}
                      placeholder="— Select Department —"
                      error={!!errors.departmentId}
                    />
                    {errors.departmentId && (
                      <div className="ecm-form-error">
                        <i className="bi bi-exclamation-circle"></i>
                        {errors.departmentId}
                      </div>
                    )}
                  </div>

                  {}
                  <div className="ecm-form-group">
                    <label className="ecm-form-label">Default Chain</label>
                    <div
                      className={`ecm-toggle-wrapper ${form.isDefault ? 'ecm-toggle-wrapper--on' : ''}`}
                      onClick={() =>
                        handle({
                          target: { name: 'isDefault', type: 'checkbox', checked: !form.isDefault },
                        })
                      }
                    >
                      <div className={`ecm-toggle ${form.isDefault ? 'ecm-toggle--on' : ''}`}>
                        <div className="ecm-toggle__knob"></div>
                      </div>
                      <span className="ecm-toggle__label">
                        {form.isDefault ? 'Yes — Set as default' : 'No — Not default'}
                      </span>
                    </div>
                  </div>

                </div>
              </div>

              {}
              <div className="ecm-section">
                <div className="ecm-section__title">
                  <i className="bi bi-diagram-3-fill"></i>
                  Approval Steps
                  <span className="ecm-step-pill">
                    {steps.length} step{steps.length !== 1 ? 's' : ''}
                  </span>
                  <span className="ecm-mandatory-note">
                    <i className="bi bi-shield-check"></i>
                    All steps are mandatory
                  </span>
                </div>

                {usersLoading ? (
                  <div className="ecm-users-loading">
                    <div className="spinner-border spinner-border-sm ecm-loading-spinner" role="status" />
                    <span>Loading users...</span>
                  </div>
                ) : (
                  <div className="ecm-steps-list">

                    {}
                    <div className="ecm-steps-header">
                      <div className="ecm-col-order">#</div>
                      <div className="ecm-col-role">Role</div>
                      <div className="ecm-col-user">Assigned User</div>
                    </div>

                    {}
                    {steps.map((step, idx) => {
                      const userOpts       = getUserOptions(idx);
                      const noUsersForRole = userOpts.length === 1;

                      return (
                        <div key={step._id} className="ecm-step-row">

                          <div className="ecm-col-order">
                            <div className="ecm-order-badge">{step.stepOrder}</div>
                          </div>

                          <div className="ecm-col-role">
                            <EcmDropdown
                              name={`role_${idx}`}
                              value={String(step.role)}
                              onChange={e => handleStepChange(idx, 'role', e.target.value)}
                              options={ROLE_OPTIONS}
                              placeholder="Select Role"
                            />
                          </div>

                          <div className="ecm-col-user">
                            <EcmDropdown
                              name={`user_${idx}`}
                              value={String(step.assignedUserId)}
                              onChange={e => handleStepChange(idx, 'assignedUserId', e.target.value)}
                              options={userOpts}
                              placeholder="— Assign User —"
                              disabled={!step.role}
                            />
                            {noUsersForRole && step.role && (
                              <div className="ecm-no-users-hint">
                                <i className="bi bi-exclamation-triangle-fill"></i>
                                No available users for this role
                              </div>
                            )}
                          </div>

                        </div>
                      );
                    })}

                    {}
                    <button
                      type="button"
                      className="ecm-add-step-btn"
                      onClick={handleAddStep}
                    >
                      <i className="bi bi-plus"></i>
                      Add Step
                    </button>

                  </div>
                )}

                {errors.steps && (
                  <div className="ecm-form-error ecm-form-error--block">
                    <i className="bi bi-exclamation-circle"></i>
                    {errors.steps}
                  </div>
                )}
              </div>

              {}
              <div className="ecm-info-alert">
                <i className="bi bi-info-circle-fill"></i>
                <small>
                  Users are filtered by role. The same user cannot appear in more than one step.
                  Select a role first to populate the user dropdown.
                </small>
              </div>

            </div>

            {}
            <div className="ecm-modal-footer">
              <button
                type="button"
                className="ecm-btn-cancel"
                onClick={handleClose}
                disabled={loading}
              >
                <i className="bi bi-x-circle"></i>
                Cancel
              </button>
              <button
                type="submit"
                className="ecm-btn-submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="ecm-spinner"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle"></i>
                    Save Changes
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

export default EditChainModal;
