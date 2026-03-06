import React from 'react';
import { useNavigate } from 'react-router-dom';
import useDashboard from '../../../hooks/sor/useDashboard';
import authService from '../../../services/auth/authService';
import '../../../styles/sor/pages/SORDashboard.css';

const MetricCard = ({ title, value, icon, color, onClick }) => (
  <div
    className={`sor-metric-card sor-metric-card--${color} ${onClick ? 'clickable' : ''}`}
    onClick={onClick}>
    <div className="sor-metric-card__icon">{icon}</div>
    <div className="sor-metric-card__body">
      <div className="sor-metric-card__value">{value ?? '—'}</div>
      <div className="sor-metric-card__title">{title}</div>
    </div>
  </div>
);

const SORDashboard = () => {
  const { dashboardData, loading } = useDashboard();
  const navigate = useNavigate();
  const user     = authService.getCurrentUser();
  const role     = user?.roleName;
  const isManager = role === 'Manager';

  if (loading) {
    return (
      <div className="sor-page-loader">
        <div className="spinner-border text-primary" />
        <p className="mt-2 text-muted">Loading dashboard...</p>
      </div>
    );
  }

  const d = dashboardData || {};

  return (
    <div className="sor-dashboard">
      <div className="sor-page-header">
        <div>
          <h4 className="sor-page-title">
            {isManager ? '📊 Manager Dashboard' : '📊 HR Dashboard'} — SOR
          </h4>
          <p className="text-muted mb-0">Smart Offer Release · Relevantz Technology Services</p>
        </div>
        {!isManager && (
          <div className="d-flex gap-2">
            <button className="btn btn-primary btn-sm"
              onClick={() => navigate('/sor/candidates/new')}>
              + New Candidate
            </button>
            <button className="btn btn-outline-primary btn-sm"
              onClick={() => navigate('/sor/offers')}>
              View Offers
            </button>
          </div>
        )}
      </div>

      {isManager ? (
        <div className="row g-4">
          <div className="col-md-4">
            <MetricCard title="My Pending Approvals" value={d.myPendingApprovals}
              icon="⏳" color="warning"
              onClick={() => navigate('/sor/approvals')} />
          </div>
          <div className="col-md-4">
            <MetricCard title="Approved by Me" value={d.approvedByMe} icon="✅" color="success" />
          </div>
          <div className="col-md-4">
            <MetricCard title="Team Pipeline Offers" value={d.teamPipelineOffers}
              icon="📋" color="primary" />
          </div>
        </div>
      ) : (
        <>
          <div className="row g-4 mb-4">
            <div className="col-md-3">
              <MetricCard title="Total Offers" value={d.totalOffers}
                icon="📄" color="primary" onClick={() => navigate('/sor/offers')} />
            </div>
            <div className="col-md-3">
              <MetricCard title="Pending Approval" value={d.pendingApprovalCount}
                icon="⏳" color="warning" onClick={() => navigate('/sor/approvals')} />
            </div>
            <div className="col-md-3">
              <MetricCard title="Approved This Month" value={d.approvedThisMonth}
                icon="✅" color="success" />
            </div>
            <div className="col-md-3">
              <MetricCard title="Rejected Offers" value={d.rejectedOffers}
                icon="❌" color="danger" />
            </div>
          </div>

          <div className="row g-4 mb-4">
            <div className="col-md-3">
              <MetricCard title="Candidates in Pipeline" value={d.candidatesInPipeline}
                icon="👥" color="info" onClick={() => navigate('/sor/candidates')} />
            </div>
            <div className="col-md-3">
              <MetricCard title="Active Workflows" value={d.activeWorkflows}
                icon="🔄" color="purple" onClick={() => navigate('/sor/approvals')} />
            </div>
            <div className="col-md-3">
              <MetricCard title="Internship Offers" value={d.internshipOffers}
                icon="🎓" color="orange" />
            </div>
            <div className="col-md-3">
              <MetricCard title="Full-Time Offers" value={d.fullTimeOffers}
                icon="💼" color="teal" />
            </div>
          </div>

          {d.averageApprovalTimeDays !== undefined && (
            <div className="row g-4">
              <div className="col-md-4">
                <div className="sor-info-card">
                  <div className="sor-info-card__label">Avg. Approval Time</div>
                  <div className="sor-info-card__value">
                    {d.averageApprovalTimeDays} days
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <div className="row g-3 mt-3">
        <div className="col-12">
          <h6 className="sor-section-title">⚡ Quick Actions</h6>
          <div className="d-flex flex-wrap gap-2">
            <button className="btn btn-outline-secondary btn-sm"
              onClick={() => navigate('/sor/candidates')}>👥 Candidates</button>
            <button className="btn btn-outline-secondary btn-sm"
              onClick={() => navigate('/sor/offers')}>📄 Offers</button>
            <button className="btn btn-outline-secondary btn-sm"
              onClick={() => navigate('/sor/approvals')}>✅ Approvals</button>
            <button className="btn btn-outline-secondary btn-sm"
              onClick={() => navigate('/sor/approval-chains')}>🔗 Chains</button>
            <button className="btn btn-outline-secondary btn-sm"
              onClick={() => navigate('/sor/audit')}>📋 Audit</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SORDashboard;
