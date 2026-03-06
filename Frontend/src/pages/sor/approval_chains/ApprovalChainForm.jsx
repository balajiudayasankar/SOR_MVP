import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import approvalChainService from '../../../services/sor/approvalChainService';
import departmentService from '../../../services/auth/departmentService';
import Breadcrumb from '../../../components/common/Breadcrumb';
import StepBuilder from '../../../components/sor/common/StepBuilder';
import '../../../styles/sor/pages/ApprovalChainForm.css';

const defaultSteps = [
  { stepOrder: 1, role: 1, assignedUserId: '', isMandatory: true, _id: 1 },
  { stepOrder: 2, role: 2, assignedUserId: '', isMandatory: true, _id: 2 },
  { stepOrder: 3, role: 3, assignedUserId: '', isMandatory: true, _id: 3 },
  { stepOrder: 4, role: 4, assignedUserId: '', isMandatory: true, _id: 4 },
];



const AcfDropdown = ({ name, value, onChange, options, placeholder, error }) => {
  const [isOpen, setIsOpen]       = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const dropdownRef = useRef(null);

  const selectedOption = options.find(o => o.value === value);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      const rect          = dropdownRef.current.getBoundingClientRect();
      const spaceBelow    = window.innerHeight - rect.bottom;
      const spaceAbove    = rect.top;
      const dropdownHeight = 250;
      setOpenUpward(spaceBelow < dropdownHeight && spaceAbove > spaceBelow);
    }
  }, [isOpen]);

  const handleSelect = (val) => {
    onChange({ target: { name, value: val } });
    setIsOpen(false);
  };

  return (
    <div
      ref={dropdownRef}
      className={`acf-dropdown ${error ? 'acf-dropdown--error' : ''} ${isOpen ? 'acf-dropdown--open' : ''}`}
    >
      <div
        className="acf-dropdown__selected"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={`acf-dropdown__text ${!selectedOption ? 'acf-dropdown__text--placeholder' : ''}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span className={`acf-dropdown__arrow ${isOpen ? 'acf-dropdown__arrow--open' : ''}`} />
      </div>

      {isOpen && (
        <div className={`acf-dropdown__menu ${openUpward ? 'acf-dropdown__menu--upward' : ''}`}>
          {options.map((opt) => (
            <div
              key={opt.value}
              className={`acf-dropdown__option ${value === opt.value ? 'acf-dropdown__option--selected' : ''}`}
              onClick={() => handleSelect(opt.value)}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};



const ApprovalChainForm = () => {
  const { id }   = useParams();
  const navigate = useNavigate();
  const isEdit   = !!id;

  const [form, setForm]         = useState({ chainName: '', departmentId: '', isDefault: false });
  const [steps, setSteps]       = useState(defaultSteps);
  const [departments, setDepts] = useState([]);
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  const deptOptions = [
    { label: '— Select Department —', value: '' },
    ...departments.map(d => ({ label: d.departmentName, value: String(d.departmentId) })),
  ];

  useEffect(() => {
    departmentService.getActiveDepartments()
      .then((res) => setDepts(res.data || []))
      .catch(() => {});

    if (isEdit) {
      setFetching(true);
      approvalChainService.getChainById(id)
        .then((res) => {
          const chain = res.data;
          setForm({
            chainName:    chain.chainName,
            departmentId: String(chain.departmentId),
            isDefault:    chain.isDefault,
          });
          setSteps(
            (chain.steps || []).map((s, i) => ({
              ...s,
              role: typeof s.role === 'string'
                ? { HR: 1, HiringManager: 2, Finance: 3, HRHead: 4 }[s.role] || 1
                : s.role,
              assignedUserId: s.assignedUserId || '',
              _id: s.approvalChainStepId || i,
            }))
          );
        })
        .catch((e) => toast.error(e.message))
        .finally(() => setFetching(false));
    }
  }, [id, isEdit]);

  const handle = (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: val });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const newErrors = {};
    if (!form.chainName.trim())    newErrors.chainName    = 'Chain name is required';
    else if (form.chainName.trim().length < 3) newErrors.chainName = 'Chain name must be at least 3 characters';
    if (!form.departmentId)        newErrors.departmentId = 'Department is required';
    if (steps.some(s => !s.assignedUserId)) newErrors.steps = 'Please assign a user to every step';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fix the errors before submitting.');
      return;
    }
    setLoading(true);
    const payload = {
      chainName:    form.chainName,
      departmentId: Number(form.departmentId),
      isDefault:    form.isDefault,
      steps: steps.map((s) => ({
        stepOrder:      s.stepOrder,
        role:           Number(s.role),
        assignedUserId: Number(s.assignedUserId),
        isMandatory:    s.isMandatory,
      })),
    };
    try {
      if (isEdit) {
        await approvalChainService.updateChain(id, payload);
        toast.success('Chain updated successfully!');
      } else {
        await approvalChainService.createChain(payload);
        toast.success('Chain created successfully!');
      }
      navigate('/sor/approval-chains');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="acf-loading">
      <div className="spinner-border" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );

  return (
    <div className="acf-page">

      <Breadcrumb items={[
        { label: 'Approval Chains' },
        { label: isEdit ? 'Edit Chain' : 'New Chain' },
      ]} />

      {}
      <div className="acf-page-header">
        <div className="acf-header-left">
          <button
            className="acf-btn-back"
            onClick={() => navigate('/sor/approval-chains')}
          >
            <i className="bi bi-arrow-left"></i>
            Back
          </button>
          <div>
            <h4 className="acf-page-title">
              {isEdit ? 'Edit Approval Chain' : 'New Approval Chain'}
            </h4>
            <p className="acf-page-subtitle">
              {isEdit
                ? 'Update the chain configuration and step assignments'
                : 'Configure a new multi-step approval workflow for a department'}
            </p>
          </div>
        </div>
      </div>

      {}
      <div className="acf-form-card">

        {}
        <div className="acf-form-card__header">
          <i className="bi bi-link-45deg"></i>
          {isEdit ? 'Edit Chain Details' : 'Chain Details'}
        </div>

        <form onSubmit={handleSubmit} className="acf-form">
          <div className="acf-form-body">

            {}
            <div className="acf-form-grid">

              {}
              <div className="acf-form-group acf-form-group--wide">
                <label className="acf-form-label">
                  Chain Name <span className="acf-required">*</span>
                </label>
                <input
                  type="text"
                  name="chainName"
                  className={`acf-form-input ${errors.chainName ? 'acf-form-input--error' : ''}`}
                  placeholder="e.g. Default Offer Approval Chain"
                  value={form.chainName}
                  onChange={handle}
                  maxLength={150}
                />
                {errors.chainName && (
                  <div className="acf-form-error">
                    <i className="bi bi-exclamation-circle"></i>
                    {errors.chainName}
                  </div>
                )}
              </div>

              {}
              <div className="acf-form-group">
                <label className="acf-form-label">
                  Department <span className="acf-required">*</span>
                </label>
                <AcfDropdown
                  name="departmentId"
                  value={form.departmentId}
                  onChange={handle}
                  options={deptOptions}
                  placeholder="— Select Department —"
                  error={errors.departmentId}
                />
                {errors.departmentId && (
                  <div className="acf-form-error">
                    <i className="bi bi-exclamation-circle"></i>
                    {errors.departmentId}
                  </div>
                )}
              </div>

              {}
              <div className="acf-form-group acf-form-group--end">
                <label className="acf-form-label">Default Chain</label>
                <div
                  className={`acf-toggle-wrapper ${form.isDefault ? 'acf-toggle-wrapper--checked' : ''}`}
                  onClick={() => handle({ target: { name: 'isDefault', type: 'checkbox', checked: !form.isDefault } })}
                >
                  <div className={`acf-toggle ${form.isDefault ? 'acf-toggle--on' : ''}`}>
                    <div className="acf-toggle__knob"></div>
                  </div>
                  <span className="acf-toggle__label">
                    {form.isDefault ? 'Yes — This is the default chain' : 'No — Not the default chain'}
                  </span>
                </div>
                <small className="acf-form-hint">
                  <i className="bi bi-info-circle"></i>
                  The default chain is auto-assigned to new offers in this department
                </small>
              </div>
            </div>

            {}
            <div className="acf-info-alert">
              <i className="bi bi-info-circle-fill"></i>
              <small>
                Assign a specific user to each approval step. Every step must have an assigned approver before the chain can be saved.
              </small>
            </div>

            {}
            <div className="acf-steps-section">
              <div className="acf-steps-section__header">
                <i className="bi bi-diagram-3-fill"></i>
                Approval Steps
                <span className="acf-steps-count">
                  {steps.length} step{steps.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="acf-steps-section__body">
                <StepBuilder steps={steps} onChange={setSteps} />
              </div>
              {errors.steps && (
                <div className="acf-form-error acf-form-error--block">
                  <i className="bi bi-exclamation-circle"></i>
                  {errors.steps}
                </div>
              )}
            </div>

          </div>

          {}
          <div className="acf-form-footer">
            <button
              type="button"
              className="acf-btn-cancel"
              onClick={() => navigate('/sor/approval-chains')}
              disabled={loading}
            >
              <i className="bi bi-x-circle"></i>
              Cancel
            </button>
            <button
              type="submit"
              className="acf-btn-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="acf-spinner"></span>
                  {isEdit ? 'Saving...' : 'Creating...'}
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle"></i>
                  {isEdit ? 'Save Changes' : 'Create Chain'}
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default ApprovalChainForm;
