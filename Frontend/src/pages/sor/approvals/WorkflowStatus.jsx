import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import offerApprovalService from '../../../services/sor/offerApprovalService';
import departmentService from '../../../services/auth/departmentService';
import OfferStatusBadge from '../../../components/sor/common/OfferStatusBadge';
import { OFFER_STATUS_BADGE_CONFIG } from '../../../constants/sor/offerStatuses';
import '../../../styles/sor/pages/WorkflowStatus.css';

const WorkflowStatus = () => {
  const navigate = useNavigate();

  const [workflows, setWorkflows] = useState([]);
  const [departments, setDepts]   = useState([]);
  const [loading, setLoading]     = useState(false);
  const [filters, setFilters]     = useState({ department: '', status: '' });

  useEffect(() => {
    departmentService.getActiveDepartments()
      .then(res => setDepts(res.data || []))
      .catch(() => {});
  }, []);

  const fetchWorkflows = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.department) params.department = filters.department;
      if (filters.status)     params.status     = filters.status;

      const res = await offerApprovalService.getAllWorkflowStatuses(params);

      
      const raw = res?.data ?? res;
      setWorkflows(Array.isArray(raw) ? raw : []);
    } catch {
      setWorkflows([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchWorkflows(); }, [fetchWorkflows]);

  const handleFilter = (e) =>
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));

  return (
    <div className="sor-page">

      <div className="sor-page-header">
        <div>
          <h4 className="sor-page-title">Workflow Overview</h4>
          <p className="text-muted small mb-0">All active approval workflows</p>
        </div>
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={fetchWorkflows}>
          Refresh
        </button>
      </div>

      {}
      <div className="sor-filter-bar">
        <select
          className="form-select"
          style={{ maxWidth: '220px' }}
          name="department"
          value={filters.department}
          onChange={handleFilter}>
          <option value="">All Departments</option>
          {departments.map(d => (
            <option key={d.departmentId} value={d.departmentName}>
              {d.departmentName}
            </option>
          ))}
        </select>
        <select
          className="form-select"
          style={{ maxWidth: '200px' }}
          name="status"
          value={filters.status}
          onChange={handleFilter}>
          <option value="">All Statuses</option>
          {Object.entries(OFFER_STATUS_BADGE_CONFIG).map(([key, cfg]) => (
            <option key={key} value={key}>{cfg.label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" />
        </div>
      ) : workflows.length === 0 ? (
        <div className="sor-empty-state">
          <p className="text-muted">No workflows found for the selected filters.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Offer #</th>
                <th>Candidate</th>
                <th>Offer Status</th>
                <th>Workflow</th>
                <th>Progress</th>
                <th>Current Approver</th>
                <th>Bottleneck</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {workflows.map((w) => (
                <tr key={w.offerId}>
                  <td>
                    <span
                      className="offer-number-link"
                      onClick={() => navigate(`/sor/offers/${w.offerId}`)}>
                      {w.offerNumber}
                    </span>
                  </td>
                  <td>{w.candidateName || '—'}</td>
                  <td><OfferStatusBadge status={w.offerStatus} /></td>
                  <td>
                    <span className={`badge ${
                      w.workflowStatus === 'InProgress'
                        ? 'bg-warning text-dark'
                        : 'bg-success'
                    }`}>
                      {w.workflowStatus}
                    </span>
                  </td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <div className="progress flex-grow-1" style={{ height: '6px', minWidth: '80px' }}>
                        <div
                          className="progress-bar bg-success"
                          style={{
                            width: `${Math.round(
                              (w.currentStep / Math.max(w.totalSteps, 1)) * 100
                            )}%`
                          }}
                        />
                      </div>
                      <small className="text-muted">
                        {w.currentStep}/{w.totalSteps}
                      </small>
                    </div>
                  </td>
                  <td>
                    <span className="badge bg-light text-dark">
                      {w.currentApproverRole || '—'}
                    </span>
                    {w.currentApproverName && (
                      <div className="small text-muted">{w.currentApproverName}</div>
                    )}
                  </td>
                  <td>
                    {w.hasBottleneck
                      ? <span className="badge bg-danger">Stuck</span>
                      : <span className="badge bg-success-subtle text-success">OK</span>
                    }
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => navigate(`/sor/approvals/${w.offerId}`)}>
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default WorkflowStatus;
