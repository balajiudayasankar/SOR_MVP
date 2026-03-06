import React, { useState, useEffect } from 'react';
import useApprovalChains from '../../../hooks/sor/useApprovalChains';
import departmentService from '../../../services/auth/departmentService';
import Breadcrumb from '../../../components/common/Breadcrumb';
import AddChainModal from '../../../components/sor/Modal/approval_chains/AddChainModal';
import EditChainModal from '../../../components/sor/Modal/approval_chains/EditChainModal';
import DeleteChainModal from '../../../components/sor/Modal/approval_chains/DeleteChainModal';
import TestChainModal from '../../../components/sor/Modal/approval_chains/TestChainModal';
import { APPROVAL_ROLE_LABELS } from '../../../constants/sor/approvalRoles';
import '../../../styles/sor/pages/ApprovalChainList.css';

const ApprovalChainList = () => {
  const {
    chains, loading, selectedDeptId, setSelectedDeptId,
    fetchChains, createChain, updateChain, deleteChain, testChain, setAsDefault,
  } = useApprovalChains();

  const [departments, setDepts]         = useState([]);
  const [showAdd, setShowAdd]           = useState(false);
  const [editTarget, setEditTarget]     = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [testTarget, setTestTarget]     = useState(null);

  useEffect(() => {
    departmentService.getActiveDepartments()
      .then((res) => {
        const depts = res.data || [];
        setDepts(depts);
        if (depts.length > 0 && !selectedDeptId) {
          setSelectedDeptId(depts[0].departmentId);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedDeptId) fetchChains(selectedDeptId);
  }, [selectedDeptId, fetchChains]);

  const handleCreate = async (data) => {
    const ok = await createChain(data);
    if (ok && selectedDeptId) fetchChains(selectedDeptId);
    return ok;
  };

  const handleUpdate = async (chainId, data) => {
    const ok = await updateChain(chainId, data);
    if (ok && selectedDeptId) fetchChains(selectedDeptId);
    return ok;
  };

  const handleDelete = async (chainId) => {
    const ok = await deleteChain(chainId);
    if (ok && selectedDeptId) fetchChains(selectedDeptId);
    return ok;
  };

  const handleSetDefault = async (chain) => {
    await setAsDefault(chain.approvalChainId, selectedDeptId);
  };

  
  const selectedDeptName = departments.find(
    d => String(d.departmentId) === String(selectedDeptId)
  )?.departmentName ?? null;

  const totalChains  = chains.length;
  const activeCount  = chains.filter(c => c.isActive).length;
  const inactiveCount = chains.filter(c => !c.isActive).length;
  const totalSteps   = chains.reduce((sum, c) => sum + (c.steps?.length || 0), 0);

  const getCardAccentClass = (chain) => {
    if (chain.isDefault)         return 'acl-card--default';
    if (chain.isActive)          return 'acl-card--active';
    return 'acl-card--inactive';
  };

  return (
    <div className="acl-page">

      <Breadcrumb items={[{ label: 'Approval Chains' }]} />

      {}
      <div className="acl-page-header">
        <div>
          <h4 className="acl-page-title">Approval Chains</h4>
          <p className="acl-page-subtitle">
            Configure multi-step approval workflows by department
          </p>
        </div>
        <button className="acl-btn-create" onClick={() => setShowAdd(true)}>
          <i className="bi bi-plus-circle"></i>
          New Chain
        </button>
      </div>

      {}
      <div className="acl-stats-grid">
        <div className="acl-stat-card acl-stat-total">
          <div className="acl-stat-icon">
            <i className="bi bi-link-45deg"></i>
          </div>
          <div className="acl-stat-content">
            <div className="acl-stat-value">{totalChains}</div>
            <div className="acl-stat-label">Total Chains</div>
          </div>
        </div>
        <div className="acl-stat-card acl-stat-active">
          <div className="acl-stat-icon">
            <i className="bi bi-toggle-on"></i>
          </div>
          <div className="acl-stat-content">
            <div className="acl-stat-value">{activeCount}</div>
            <div className="acl-stat-label">Active</div>
          </div>
        </div>
        <div className="acl-stat-card acl-stat-inactive">
          <div className="acl-stat-icon">
            <i className="bi bi-toggle-off"></i>
          </div>
          <div className="acl-stat-content">
            <div className="acl-stat-value">{inactiveCount}</div>
            <div className="acl-stat-label">Inactive</div>
          </div>
        </div>
        <div className="acl-stat-card acl-stat-steps">
          <div className="acl-stat-icon">
            <i className="bi bi-diagram-3-fill"></i>
          </div>
          <div className="acl-stat-content">
            <div className="acl-stat-value">{totalSteps}</div>
            <div className="acl-stat-label">Total Steps</div>
          </div>
        </div>
      </div>

      {}
      <div className="acl-filter-bar">
        <div className="acl-dept-wrapper">
          <span className="acl-dept-icon">
            <i className="bi bi-building"></i>
          </span>
          <select
            className="acl-dept-select"
            value={selectedDeptId}
            onChange={(e) => setSelectedDeptId(e.target.value)}
          >
            <option value="">— Select Department —</option>
            {departments.map((d) => (
              <option key={d.departmentId} value={d.departmentId}>
                {d.departmentName}
              </option>
            ))}
          </select>
        </div>

        {selectedDeptName && (
          <div className="acl-dept-chip">
            <i className="bi bi-building-fill"></i>
            {selectedDeptName}
          </div>
        )}

        {selectedDeptId && !loading && chains.length > 0 && (
          <span className="acl-results-count">
            {chains.length} chain{chains.length !== 1 ? 's' : ''} found
          </span>
        )}
      </div>

      {}
      {!selectedDeptId ? (
        <div className="acl-empty-state">
          <div className="acl-empty-content">
            <i className="bi bi-building"></i>
            <h4>Select a Department</h4>
            <p>Choose a department from the dropdown above to view and manage its approval chains.</p>
          </div>
        </div>

      ) : loading ? (
        <div className="acl-loading">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>

      ) : chains.length === 0 ? (
        <div className="acl-empty-state">
          <div className="acl-empty-content">
            <i className="bi bi-link"></i>
            <h4>No Approval Chains</h4>
            <p>No approval chains found for this department. Create the first one to get started.</p>
            <button className="acl-btn-create" onClick={() => setShowAdd(true)}>
              Create First Chain
            </button>
          </div>
        </div>

      ) : (
        <div className="acl-cards-grid">
          {chains.map((chain) => (
            <div
              key={chain.approvalChainId}
              className={`acl-card ${getCardAccentClass(chain)}`}
            >

              {}
              <div className="acl-card__header">
                <div className="acl-card__header-left">
                  <span className="acl-card__name">{chain.chainName}</span>
                  <div className="acl-card__badges">
                    {chain.isDefault && (
                      <span className="acl-badge-default">
                        <i className="bi bi-star-fill"></i>
                        Default
                      </span>
                    )}
                    {chain.isActive ? (
                      <span className="acl-badge-active">
                        <i className="bi bi-check-circle-fill"></i>
                        Active
                      </span>
                    ) : (
                      <span className="acl-badge-inactive">
                        <i className="bi bi-dash-circle-fill"></i>
                        Inactive
                      </span>
                    )}
                  </div>
                </div>
                <div className="acl-card__step-count">
                  <i className="bi bi-diagram-3"></i>
                  {chain.steps?.length || 0} step{(chain.steps?.length || 0) !== 1 ? 's' : ''}
                </div>
              </div>

              <div className="acl-card__divider"></div>

              {}
              <div className="acl-card__steps-section">
                <div className="acl-steps-label">
                  <i className="bi bi-arrow-right-circle"></i>
                  Workflow Steps
                </div>
                <div className="acl-steps-flow">
                  {(chain.steps || []).length === 0 ? (
                    <span className="acl-steps-empty">No steps defined</span>
                  ) : (
                    (chain.steps || []).map((step, idx) => (
                      <React.Fragment key={step.approvalChainStepId || idx}>
                        <div className="acl-step-pill">
                          <div className="acl-step-pill__order">{step.stepOrder}</div>
                          <div className="acl-step-pill__info">
                            <span className="acl-step-pill__role">
                              {APPROVAL_ROLE_LABELS[step.role] || step.role}
                            </span>
                            {step.isMandatory && (
                              <span className="acl-step-pill__mandatory" title="Mandatory">
                                Required
                              </span>
                            )}
                          </div>
                        </div>
                        {idx < (chain.steps?.length || 0) - 1 && (
                          <div className="acl-step-connector">
                            <i className="bi bi-chevron-right"></i>
                          </div>
                        )}
                      </React.Fragment>
                    ))
                  )}
                </div>
              </div>

              <div className="acl-card__divider"></div>

              {}
              <div className="acl-card__footer">
                <button
                  className="acl-action-edit"
                  onClick={() => setEditTarget(chain)}
                  title="Edit Chain"
                >
                  <i className="bi bi-pencil-square"></i>
                  Edit
                </button>
                <button
                  className="acl-action-test"
                  onClick={() => setTestTarget(chain)}
                  title="Test Chain"
                >
                  <i className="bi bi-play-circle"></i>
                  Test
                </button>
                {!chain.isDefault && (
                  <button
                    className="acl-action-setdefault"
                    onClick={() => handleSetDefault(chain)}
                    title="Set as Default"
                  >
                    <i className="bi bi-star"></i>
                    Set Default
                  </button>
                )}
                <button
                  className="acl-action-delete"
                  onClick={() => setDeleteTarget(chain)}
                  title="Delete Chain"
                >
                  <i className="bi bi-trash3"></i>
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {}
      <AddChainModal
        show={showAdd}
        onClose={() => setShowAdd(false)}
        onCreate={handleCreate}
      />
      <EditChainModal
        show={!!editTarget}
        onClose={() => setEditTarget(null)}
        chain={editTarget}
        onUpdate={handleUpdate}
      />
      <DeleteChainModal
        show={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        chain={deleteTarget}
        onDelete={handleDelete}
      />
      <TestChainModal
        show={!!testTarget}
        onClose={() => setTestTarget(null)}
        chain={testTarget}
        onTest={testChain}
      />
    </div>
  );
};

export default ApprovalChainList;
