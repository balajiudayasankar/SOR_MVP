import React, { useState, useEffect } from 'react';
import { APPROVAL_ROLE_OPTIONS } from '../../../constants/sor/approvalRoles';
import userService from '../../../services/auth/userService';
import '../../../styles/sor/components/StepBuilder.css';

const StepBuilder = ({ steps, onChange }) => {
  const [users, setUsers]               = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [fetchError, setFetchError]     = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      setFetchError('');
      try {
        
        const res = await userService.getAllUsers();
        
        const list = res?.data || [];
        setUsers(Array.isArray(list) ? list : []);
      } catch (e) {
        console.error('StepBuilder: Failed to fetch users', e);
        setFetchError('Could not load users. Check if the API is running.');
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  const updateStep = (index, field, value) => {
    const updated = steps.map((s, i) =>
      i === index ? { ...s, [field]: value } : s
    );
    onChange(updated);
  };

  const addStep = () => {
    onChange([
      ...steps,
      {
        stepOrder:      steps.length + 1,
        role:           1,
        assignedUserId: '',
        isMandatory:    true,
        _id:            Date.now(),
      },
    ]);
  };

  const removeStep = (index) => {
    const updated = steps
      .filter((_, i) => i !== index)
      .map((s, i) => ({ ...s, stepOrder: i + 1 }));
    onChange(updated);
  };

  const moveStep = (index, direction) => {
    const updated = [...steps];
    const swapIndex = index + direction;
    if (swapIndex < 0 || swapIndex >= updated.length) return;
    [updated[index], updated[swapIndex]] = [updated[swapIndex], updated[index]];
    onChange(updated.map((s, i) => ({ ...s, stepOrder: i + 1 })));
  };

  return (
    <div className="step-builder">

      {loadingUsers && (
        <div className="step-builder__loading">
          <div className="spinner-border spinner-border-sm text-primary me-2" />
          <span className="text-muted small">Loading users...</span>
        </div>
      )}

      {fetchError && (
        <div className="alert alert-danger py-2 small mb-3">{fetchError}</div>
      )}

      {!loadingUsers && !fetchError && users.length === 0 && (
        <div className="alert alert-warning py-2 small mb-3">
          No users returned from /User/all. Check if active users exist in the system.
        </div>
      )}

      {steps.map((step, index) => (
        <div key={step._id || index} className="step-row">

          <div className="step-row__order">{step.stepOrder}</div>

          <div className="step-row__fields">

            <div className="step-row__field">
              <label className="step-row__label">Role</label>
              <select
                className="form-select form-select-sm"
                value={step.role}
                onChange={(e) => updateStep(index, 'role', Number(e.target.value))}>
                {APPROVAL_ROLE_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

            <div className="step-row__field step-row__field--wide">
              <label className="step-row__label">
                Assigned User <span className="text-danger">*</span>
              </label>
              <select
                className="form-select form-select-sm"
                value={step.assignedUserId}
                onChange={(e) => updateStep(index, 'assignedUserId', e.target.value)}
                disabled={loadingUsers}>
                <option value="">
                  {loadingUsers ? 'Loading...' : '— Select User —'}
                </option>
                {users.map((u) => (
                  <option
                    key={u.userId}
                    value={u.userId}>
                    {u.fullName || u.userName || u.email}
                    {u.roleName ? ` — ${u.roleName}` : ''}
                    {u.departmentName ? ` (${u.departmentName})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="step-row__field step-row__field--checkbox">
              <label className="step-row__label">Mandatory</label>
              <div className="form-check mt-1">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={step.isMandatory}
                  onChange={(e) => updateStep(index, 'isMandatory', e.target.checked)}
                />
              </div>
            </div>

          </div>

          <div className="step-row__actions">
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary step-btn"
              onClick={() => moveStep(index, -1)}
              disabled={index === 0}
              title="Move Up">
              <i className="bi bi-arrow-up" />
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary step-btn"
              onClick={() => moveStep(index, 1)}
              disabled={index === steps.length - 1}
              title="Move Down">
              <i className="bi bi-arrow-down" />
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-danger step-btn"
              onClick={() => removeStep(index)}
              disabled={steps.length === 1}
              title="Remove Step">
              <i className="bi bi-x" />
            </button>
          </div>

        </div>
      ))}

      <button
        type="button"
        className="btn btn-outline-primary btn-sm w-100 mt-3"
        onClick={addStep}>
        + Add Step
      </button>

    </div>
  );
};

export default StepBuilder;
