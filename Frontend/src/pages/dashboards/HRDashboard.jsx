import React from 'react';
import { useNavigate } from 'react-router-dom';
import useDashboard from '../../hooks/sor/useDashboard';
import '../../styles/auth/HRDashboard.css';


// ── Metric Card ───────────────────────────────────────────────────────────────
const MetricCard = ({ title, value, icon, color, onClick }) => (
  <div
    className={`hrd-metric-card hrd-metric-card--${color} ${onClick ? 'hrd-metric-card--clickable' : ''}`}
    onClick={onClick}
    role={onClick ? 'button' : undefined}
    tabIndex={onClick ? 0 : undefined}
    onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
  >
    <div className="hrd-metric-card__icon">
      <i className={`bi ${icon}`}></i>
    </div>
    <div className="hrd-metric-card__body">
      <div className="hrd-metric-card__value">{value ?? '—'}</div>
      <div className="hrd-metric-card__title">{title}</div>
    </div>
    {onClick && <i className="bi bi-chevron-right hrd-metric-card__arrow"></i>}
  </div>
);


// ── Quick Action Button ───────────────────────────────────────────────────────
const QuickAction = ({ icon, label, onClick }) => (
  <button className="hrd-quick-btn" onClick={onClick}>
    <i className={`bi ${icon}`}></i>
    <span>{label}</span>
  </button>
);


// ── Component ─────────────────────────────────────────────────────────────────
const HRDashboard = () => {
  const { dashboardData, loading } = useDashboard();
  const navigate = useNavigate();

  // ── Loading ───────────────────────────────────────────────
  if (loading) {
    return (
      <div className="hrd-loader">
        <div className="hrd-spinner" />
        <p className="hrd-loader-text">Loading dashboard...</p>
      </div>
    );
  }

  const d = dashboardData || {};

  return (
    <div className="hrd-page">

      {/* ── Page Header ──────────────────────────────────────── */}
      <div className="hrd-page-header">
        <div className="hrd-page-header-left">
          <div className="hrd-page-header-icon">
            <i className="bi bi-speedometer2"></i>
          </div>
          <div>
            <h4 className="hrd-page-title">HR Dashboard</h4>
            <p className="hrd-page-subtitle">
              Smart Offer Release · Relevantz Technology Services
            </p>
          </div>
        </div>

        <div className="hrd-page-header-right">
          <button
            className="hrd-btn-primary"
            onClick={() => navigate('/sor/candidates/new')}
          >
            <i className="bi bi-person-plus-fill"></i>
            New Candidate
          </button>
          <button
            className="hrd-btn-outline"
            onClick={() => navigate('/sor/offers')}
          >
            <i className="bi bi-file-earmark-text"></i>
            View Offers
          </button>
        </div>
      </div>

      {/* ── Row 1: Core Offer Metrics ─────────────────────────── */}
      <div className="hrd-section-label">
        <i className="bi bi-bar-chart-fill"></i> Offer Overview
      </div>
      <div className="hrd-metrics-grid hrd-metrics-grid--4">
        <MetricCard
          title="Total Offers"
          value={d.totalOffers}
          icon="bi-file-earmark-text"
          color="primary"
          onClick={() => navigate('/sor/offers')}
        />
        <MetricCard
          title="Pending Approval"
          value={d.pendingApprovalCount}
          icon="bi-hourglass-split"
          color="warning"
          onClick={() => navigate('/sor/approvals')}
        />
        <MetricCard
          title="Approved This Month"
          value={d.approvedThisMonth}
          icon="bi-check-circle-fill"
          color="success"
        />
        <MetricCard
          title="Rejected Offers"
          value={d.rejectedOffers}
          icon="bi-x-circle-fill"
          color="danger"
        />
      </div>

      {/* ── Row 2: Pipeline Metrics ───────────────────────────── */}
      <div className="hrd-section-label">
        <i className="bi bi-diagram-3-fill"></i> Pipeline & Workflow
      </div>
      <div className="hrd-metrics-grid hrd-metrics-grid--4">
        <MetricCard
          title="Candidates in Pipeline"
          value={d.candidatesInPipeline}
          icon="bi-people-fill"
          color="info"
          onClick={() => navigate('/sor/candidates')}
        />
        <MetricCard
          title="Active Workflows"
          value={d.activeWorkflows}
          icon="bi-arrow-repeat"
          color="purple"
          onClick={() => navigate('/sor/approvals')}
        />
        <MetricCard
          title="Internship Offers"
          value={d.internshipOffers}
          icon="bi-mortarboard-fill"
          color="orange"
        />
        <MetricCard
          title="Full-Time Offers"
          value={d.fullTimeOffers}
          icon="bi-briefcase-fill"
          color="teal"
        />
      </div>

      {/* ── Avg. Approval Time ────────────────────────────────── */}
      {d.averageApprovalTimeDays !== undefined && (
        <div className="hrd-info-row">
          <div className="hrd-info-card">
            <div className="hrd-info-card__icon">
              <i className="bi bi-clock-history"></i>
            </div>
            <div>
              <div className="hrd-info-card__label">Avg. Approval Time</div>
              <div className="hrd-info-card__value">
                {d.averageApprovalTimeDays} days
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Quick Actions ─────────────────────────────────────── */}
      <div className="hrd-section-label">
        <i className="bi bi-lightning-charge-fill"></i> Quick Actions
      </div>
      <div className="hrd-quick-actions">
        <QuickAction icon="bi-people-fill"          label="Candidates"  onClick={() => navigate('/sor/candidates')} />
        <QuickAction icon="bi-file-earmark-text"    label="Offers"      onClick={() => navigate('/sor/offers')} />
        <QuickAction icon="bi-check2-circle"        label="Approvals"   onClick={() => navigate('/sor/approvals')} />
        <QuickAction icon="bi-diagram-3"            label="Chains"      onClick={() => navigate('/sor/approval-chains')} />
        <QuickAction icon="bi-shield-fill-check"    label="Audit Log"   onClick={() => navigate('/sor/audit')} />
        <QuickAction icon="bi-file-earmark-richtext" label="Templates"  onClick={() => navigate('/sor/templates')} />
        <QuickAction icon="bi-bell-fill"            label="Notifications" onClick={() => navigate('/sor/notifications')} />
      </div>

    </div>
  );
};

export default HRDashboard;
