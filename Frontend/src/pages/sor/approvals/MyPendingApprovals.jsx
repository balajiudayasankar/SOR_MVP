import React from 'react';
import { useNavigate } from 'react-router-dom';
import useOfferApprovals from '../../../hooks/sor/useOfferApprovals';
import Breadcrumb from '../../../components/common/Breadcrumb';
import { formatDate } from '../../../utils/sor/offerHelpers';
import '../../../styles/sor/pages/MyPendingApprovals.css';

const resolveActiveStep = (steps = []) =>
  steps
    .filter(s => (s.status === 'Pending' || s.status === 0) && !s.isSkipped)
    .sort((a, b) => a.stepOrder - b.stepOrder)[0] ?? null;

const getTypeBadgeClass = (type) => {
  const t = (type || '').toLowerCase().replace(/\s/g, '');
  if (t.includes('fulltime') || t.includes('full'))  return 'mpa-type-fulltime';
  if (t.includes('intern'))                           return 'mpa-type-internship';
  if (t.includes('contract'))                         return 'mpa-type-contract';
  if (t.includes('parttime') || t.includes('part'))  return 'mpa-type-parttime';
  return 'mpa-type-default';
};

const getCardAccentClass = (type) => {
  const t = (type || '').toLowerCase().replace(/\s/g, '');
  if (t.includes('fulltime') || t.includes('full'))  return 'mpa-card--fulltime';
  if (t.includes('intern'))                           return 'mpa-card--internship';
  if (t.includes('contract'))                         return 'mpa-card--contract';
  if (t.includes('parttime') || t.includes('part'))  return 'mpa-card--parttime';
  return '';
};

const getInitials = (name) => {
  if (!name || name === 'N/A') return '?';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const MyPendingApprovals = () => {
  const navigate = useNavigate();
  const { pendingApprovals, loading } = useOfferApprovals();

  if (import.meta.env.DEV && pendingApprovals.length > 0) {
    console.log('[MyPendingApprovals] count:', pendingApprovals.length);
    console.log('[MyPendingApprovals] item[0]:', pendingApprovals[0]);
  }

  
  const totalPending  = pendingApprovals.length;
  const today         = new Date().toDateString();
  const newToday      = pendingApprovals.filter(item => {
    const d = item.createdAt ?? item.CreatedAt;
    return d && new Date(d).toDateString() === today;
  }).length;
  const fullTimeCount = pendingApprovals.filter(item =>
    (item.offerType || '').toLowerCase().includes('full')
  ).length;
  const internCount   = pendingApprovals.filter(item =>
    (item.offerType || '').toLowerCase().includes('intern')
  ).length;

  if (loading) {
    return (
      <div className="mpa-loading">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mpa-page">

      <Breadcrumb items={[{ label: 'My Pending Approvals' }]} />

      {}
      <div className="mpa-page-header">
        <div>
          <h4 className="mpa-page-title">My Pending Approvals</h4>
          <p className="mpa-page-subtitle">
            Offers waiting for your action
            {pendingApprovals.length > 0 && (
              <span className="mpa-pending-chip">
                <i className="bi bi-clock-fill"></i>
                {pendingApprovals.length} pending
              </span>
            )}
          </p>
        </div>
      </div>

      {}
      <div className="mpa-stats-grid">
        <div className="mpa-stat-card mpa-stat-total">
          <div className="mpa-stat-icon">
            <i className="bi bi-hourglass-split"></i>
          </div>
          <div className="mpa-stat-content">
            <div className="mpa-stat-value">{totalPending}</div>
            <div className="mpa-stat-label">Total Pending</div>
          </div>
        </div>
        <div className="mpa-stat-card mpa-stat-today">
          <div className="mpa-stat-icon">
            <i className="bi bi-calendar-check-fill"></i>
          </div>
          <div className="mpa-stat-content">
            <div className="mpa-stat-value">{newToday}</div>
            <div className="mpa-stat-label">Submitted Today</div>
          </div>
        </div>
        <div className="mpa-stat-card mpa-stat-fulltime">
          <div className="mpa-stat-icon">
            <i className="bi bi-briefcase-fill"></i>
          </div>
          <div className="mpa-stat-content">
            <div className="mpa-stat-value">{fullTimeCount}</div>
            <div className="mpa-stat-label">Full Time</div>
          </div>
        </div>
        <div className="mpa-stat-card mpa-stat-intern">
          <div className="mpa-stat-icon">
            <i className="bi bi-mortarboard-fill"></i>
          </div>
          <div className="mpa-stat-content">
            <div className="mpa-stat-value">{internCount}</div>
            <div className="mpa-stat-label">Internship</div>
          </div>
        </div>
      </div>

      {}
      {pendingApprovals.length === 0 ? (
        <div className="mpa-empty-state">
          <div className="mpa-empty-content">
            <i className="bi bi-check-circle"></i>
            <h4>You are all caught up!</h4>
            <p>No pending approvals at the moment. Check back later.</p>
          </div>
        </div>

      ) : (
        <div className="mpa-cards-grid">
          {pendingApprovals.map((item, index) => {

            const steps      = item.steps ?? item.Steps ?? [];
            const activeStep = resolveActiveStep(steps);

            const key     = item.offerWorkflowId ?? item.OfferWorkflowId ?? `wf-${index}`;
            const offerId = item.offerId ?? item.OfferId;

            const role       = activeStep?.role      ?? 'N/A';
            const stepOrder  = activeStep?.stepOrder ?? 1;
            const totalSteps = steps.length || 4;
            const stepId     = activeStep?.offerWorkflowStepId ?? null;

            const offerNumber   = item.offerNumber   ?? item.workflowNumber ?? 'N/A';
            const candidateName = item.candidateName ?? 'N/A';
            const offerType     = item.offerType     ?? activeStep?.offerType ?? null;
            const createdAt     = item.createdAt     ?? item.CreatedAt ?? null;

            const progressPercent = Math.round((stepOrder / totalSteps) * 100);

            return (
              <div key={key} className={`mpa-card ${getCardAccentClass(offerType)}`}>

                {}
                <div className="mpa-card__header">
                  <span className="mpa-card__offer-num">{offerNumber}</span>
                  {offerType && (
                    <span className={`mpa-type-badge ${getTypeBadgeClass(offerType)}`}>
                      {offerType}
                    </span>
                  )}
                </div>

                {}
                <div className="mpa-card__candidate">
                  <div className="mpa-card__avatar">
                    {getInitials(candidateName)}
                  </div>
                  <div className="mpa-card__candidate-info">
                    <span className="mpa-card__candidate-label">Candidate</span>
                    <span className="mpa-card__candidate-name">{candidateName}</span>
                  </div>
                </div>

                <div className="mpa-card__divider"></div>

                {}
                <div className="mpa-card__details">
                  <div className="mpa-card__row">
                    <span className="mpa-card__row-label">
                      <i className="bi bi-person-badge"></i>
                      Your Role
                    </span>
                    <span className="mpa-role-badge">{role}</span>
                  </div>
                  <div className="mpa-card__row">
                    <span className="mpa-card__row-label">
                      <i className="bi bi-diagram-3"></i>
                      Step
                    </span>
                    <span className="mpa-card__row-value">
                      Step {stepOrder} of {totalSteps}
                    </span>
                  </div>
                  {createdAt && (
                    <div className="mpa-card__row">
                      <span className="mpa-card__row-label">
                        <i className="bi bi-calendar3"></i>
                        Submitted
                      </span>
                      <span className="mpa-card__row-value mpa-card__row-muted">
                        {formatDate(createdAt)}
                      </span>
                    </div>
                  )}
                </div>

                {}
                <div className="mpa-progress-wrapper">
                  <div className="mpa-progress-header">
                    <span className="mpa-progress-label">Workflow Progress</span>
                    <span className="mpa-progress-percent">{progressPercent}%</span>
                  </div>
                  <div className="mpa-progress-track">
                    <div
                      className="mpa-progress-fill"
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                </div>

                {}
                <div className="mpa-card__footer">
                  <button
                    className="mpa-btn-action"
                    onClick={() => navigate(`/sor/approvals/${offerId}`, {
                      state: { stepId, offerId, role }
                    })}
                  >
                    <i className="bi bi-clipboard2-check"></i>
                    Review & Take Action
                    <i className="bi bi-arrow-right mpa-btn-arrow"></i>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default MyPendingApprovals;
