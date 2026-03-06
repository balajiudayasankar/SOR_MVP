import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import offerService from '../../../services/sor/offerService';
import offerApprovalService from '../../../services/sor/offerApprovalService';
import authService from '../../../services/auth/authService';
import Breadcrumb from '../../../components/common/Breadcrumb';
import WorkflowTracker from '../../../components/sor/common/WorkflowTracker';
import ApproveModal from '../../../components/sor/Modal/approvals/ApproveModal';
import RejectModal from '../../../components/sor/Modal/approvals/RejectModal';
import RequestRevisionModal from '../../../components/sor/Modal/approvals/RequestRevisionModal';
import ExpediteModal from '../../../components/sor/Modal/approvals/ExpediteModal';
import FinanceValidateModal from '../../../components/sor/Modal/approvals/FinanceValidateModal';
import { formatDate, formatCurrency, canDownloadOffer } from '../../../utils/sor/offerHelpers';
import useOffers from '../../../hooks/sor/useOffers';
import '../../../styles/sor/pages/ApprovalAction.css';



const isStepPending = (step) =>
  step?.status === 'Pending' || step?.status === 0;

const normalizeRole = (role = '') =>
  role.replace(/\s+/g, '').toLowerCase();

const getStatusBadgeClass = (status) => {
  const s = (status || '').toLowerCase().replace(/\s/g, '');
  if (s.includes('draft'))                                        return 'aab-badge-draft';
  if (s.includes('pendingapproval') || s.includes('pending'))     return 'aab-badge-pending';
  if (s.includes('internallyapproved') || s.includes('approved')) return 'aab-badge-approved';
  if (s.includes('sent'))                                         return 'aab-badge-sent';
  if (s.includes('accepted'))                                     return 'aab-badge-accepted';
  if (s.includes('rejected'))                                     return 'aab-badge-rejected';
  if (s.includes('expired'))                                      return 'aab-badge-expired';
  if (s.includes('withdrawn'))                                    return 'aab-badge-withdrawn';
  return 'aab-badge-default';
};

const getTypeBadgeClass = (type) => {
  const t = (type || '').toLowerCase().replace(/\s/g, '');
  if (t.includes('fulltime') || t.includes('full')) return 'aab-type-fulltime';
  if (t.includes('intern'))                          return 'aab-type-internship';
  if (t.includes('contract'))                        return 'aab-type-contract';
  if (t.includes('parttime') || t.includes('part')) return 'aab-type-parttime';
  return 'aab-type-default';
};

const formatStatus = (status) => {
  if (!status) return '—';
  return status.replace(/([A-Z])/g, ' $1').trim();
};



const ApprovalAction = () => {
  const { offerId } = useParams();
  const navigate    = useNavigate();
  const location    = useLocation();
  const { downloadOffer } = useOffers();

  const user   = authService.getCurrentUser();
  const claims = authService.getClaims();

  const userId   = Number(claims?.sub ?? claims?.userId ?? 0);
  const userRole = user?.roleName ?? '';

  const [offer,      setOffer]      = useState(null);
  const [workflow,   setWorkflow]   = useState(null);
  const [activeStep, setActiveStep] = useState(null);
  const [loading,    setLoading]    = useState(true);

  const [showApprove,  setShowApprove]  = useState(false);
  const [showReject,   setShowReject]   = useState(false);
  const [showRevision, setShowRevision] = useState(false);
  const [showExpedite, setShowExpedite] = useState(false);
  const [showFinance,  setShowFinance]  = useState(false);

  

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [offerRes, wfRes] = await Promise.all([
        offerService.getOfferById(offerId),
        offerApprovalService.getWorkflowByOffer(offerId),
      ]);

      const offerData = offerRes?.data ?? offerRes;
      const wfRaw     = wfRes?.data    ?? wfRes;
      const wfData    = wfRaw?.data    ?? wfRaw;

      setOffer(offerData);
      setWorkflow(wfData);

      const steps        = wfData?.steps ?? [];
      const passedStepId = location.state?.stepId;

      let step = null;

      if (passedStepId) {
        step = steps.find(s => s.offerWorkflowStepId === Number(passedStepId));
      }

      if (!step) {
        const currentStepOrder = (wfData?.currentStepIndex ?? 0) + 1;
        step = steps.find(s =>
          isStepPending(s) &&
          s.approverUserId === userId &&
          s.stepOrder === currentStepOrder
        );
      }

      if (!step) {
        step = steps.find(s =>
          isStepPending(s) && s.approverUserId === userId
        );
      }

      if (!step && import.meta.env.DEV) {
        const currentStepOrder = (wfData?.currentStepIndex ?? 0) + 1;
        step = steps.find(s =>
          isStepPending(s) && s.stepOrder === currentStepOrder
        );
      }

      setActiveStep(step ?? null);

      if (import.meta.env.DEV) {
        console.log('[ApprovalAction] userId:', userId);
        console.log('[ApprovalAction] userRole:', userRole);
        console.log('[ApprovalAction] passedStepId:', passedStepId);
        console.log('[ApprovalAction] currentStepIndex:', wfData?.currentStepIndex);
        console.log('[ApprovalAction] steps:', steps);
        console.log('[ApprovalAction] activeStep resolved:', step);
      }

    } catch (e) {
      toast.error(e?.message ?? 'Failed to load offer details.');
    } finally {
      setLoading(false);
    }
  }, [offerId, location.state, userId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  

  const handleActionDone = useCallback(() => {
    fetchData();
    navigate('/sor/approvals');
  }, [fetchData, navigate]);

  

  const isFinanceStep = normalizeRole(activeStep?.role) === 'finance';
  const canTakeAction = !!activeStep && isStepPending(activeStep);
  const isHRHead      = ['hrhead', 'admin'].includes(normalizeRole(userRole));
  const canDownload   = canDownloadOffer(offer?.status, userRole);

  

  if (loading) return (
    <div className="aab-loading">
      <div className="spinner-border" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );

  

  if (!offer) return (
    <div className="aab-page">
      <div className="aab-error-state">
        <i className="bi bi-exclamation-triangle"></i>
        <h5>Offer not found</h5>
        <p>The offer you are looking for does not exist or has been removed.</p>
        <button className="aab-btn-back" onClick={() => navigate('/sor/approvals')}>
          <i className="bi bi-arrow-left"></i>
          Back to Approvals
        </button>
      </div>
    </div>
  );

  const cd  = offer.commonDetails     ?? {};
  const id_ = offer.internshipDetails ?? null;
  const ft  = offer.fullTimeDetails   ?? null;

  const approvedSteps = (workflow?.steps ?? []).filter(s => s.status === 'Approved').length;
  const totalWfSteps  = (workflow?.steps ?? []).length;
  const progressPct   = Math.round((approvedSteps / Math.max(totalWfSteps, 1)) * 100);

  

  return (
    <div className="aab-page">

      <Breadcrumb items={[
        { label: 'My Pending Approvals' },
        { label: offer.offerNumber },
      ]} />

      {}
      <div className="aab-page-header">
        <div className="aab-header-left">
          <button
            className="aab-btn-back"
            onClick={() => navigate('/sor/approvals')}
          >
            <i className="bi bi-arrow-left"></i>
            Back
          </button>
          <div className="aab-header-meta">
            <h4 className="aab-page-title">{offer.offerNumber}</h4>
            <div className="aab-header-badges">
              {offer.offerType && (
                <span className={`aab-type-badge ${getTypeBadgeClass(offer.offerType)}`}>
                  {offer.offerType}
                </span>
              )}
              <span className={`aab-status-badge ${getStatusBadgeClass(offer.status)}`}>
                {formatStatus(offer.status)}
              </span>
            </div>
          </div>
        </div>

        <div className="aab-header-actions">
          {isHRHead && (
            <button className="aab-btn-expedite" onClick={() => setShowExpedite(true)}>
              <i className="bi bi-lightning-charge-fill"></i>
              Expedite
            </button>
          )}

          {}
          <button
            className="aab-btn-preview"
            onClick={() =>
              navigate(`/sor/offers/${offerId}/preview`, {
                state: {
                  returnTo:    location.pathname,
                  returnLabel: 'Back to Approval',
                },
              })
            }
          >
            <i className="bi bi-file-earmark-richtext"></i>
            Preview
          </button>

          {canDownload && (
            <button
              className="aab-btn-download"
              onClick={() => downloadOffer(offer.offerId, offer.offerNumber)}
            >
              <i className="bi bi-file-earmark-pdf"></i>
              Download PDF
            </button>
          )}
        </div>
      </div>

      {}
      {canTakeAction ? (
        <div className="aab-action-banner">
          <div className="aab-action-banner__left">
            <div className="aab-action-banner__icon">
              <i className="bi bi-bell-fill"></i>
            </div>
            <div>
              <div className="aab-action-banner__title">Action Required</div>
              <div className="aab-action-banner__desc">
                You are the <strong>{activeStep.role}</strong> approver — Step {activeStep.stepOrder}
              </div>
            </div>
          </div>
          <div className="aab-action-banner__btns">
            {isFinanceStep ? (
              <button className="aab-btn-finance" onClick={() => setShowFinance(true)}>
                <i className="bi bi-shield-check"></i>
                Finance Validate
              </button>
            ) : (
              <>
                <button className="aab-btn-approve" onClick={() => setShowApprove(true)}>
                  <i className="bi bi-check-circle-fill"></i>
                  Approve
                </button>
                <button className="aab-btn-revision" onClick={() => setShowRevision(true)}>
                  <i className="bi bi-pencil-fill"></i>
                  Request Revision
                </button>
                <button className="aab-btn-reject" onClick={() => setShowReject(true)}>
                  <i className="bi bi-x-circle-fill"></i>
                  Reject
                </button>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="aab-info-banner">
          <i className="bi bi-info-circle-fill aab-info-banner__icon"></i>
          <span>
            {workflow?.status === 'Completed'
              ? 'This offer workflow has been completed.'
              : activeStep
                ? `Waiting for ${activeStep.role} approval.`
                : 'No action required from you at this time.'
            }
          </span>
        </div>
      )}

      {}
      <div className="row g-4 mt-1">

        {}
        <div className="col-lg-7">

          {}
          <div className="aab-detail-card">
            <div className="aab-detail-card__header">
              <i className="bi bi-person-vcard-fill"></i>
              Candidate &amp; Job Details
            </div>
            <div className="aab-detail-card__body">
              <div className="row g-2">
                {[
                  ['Candidate',        cd.candidateName],
                  ['Email',            cd.candidateEmail],
                  ['Designation',      cd.designation],
                  ['Department',       cd.department],
                  ['Work Location',    cd.workLocation],
                  ['Reporting Mgr',    cd.reportingManager],
                  ['Offer Issue Date', formatDate(cd.offerIssueDate)],
                  ['Joining Date',     formatDate(cd.joiningDate)],
                ].map(([label, value]) => (
                  <div className="col-md-6" key={label}>
                    <div className="aab-detail-row">
                      <span className="aab-detail-row__label">{label}</span>
                      <span className="aab-detail-row__value">{value || '—'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {}
          {id_ && (
            <div className="aab-detail-card">
              <div className="aab-detail-card__header">
                <i className="bi bi-mortarboard-fill"></i>
                Internship Details
              </div>
              <div className="aab-detail-card__body">
                <div className="row g-2">
                  {[
                    ['Duration',           `${id_.durationMonths} months`],
                    ['Stipend',            formatCurrency(id_.stipendAmount)],
                    ['Start Date',         formatDate(id_.internshipStartDate)],
                    ['End Date',           formatDate(id_.internshipEndDate)],
                    ['Post-Intern Salary', formatCurrency(id_.fullTimeSalaryAfterInternship)],
                    ['Joining Bonus',      formatCurrency(id_.joiningBonus)],
                    ['Pay Frequency',      id_.payFrequency],
                    ['Other Benefits',     id_.otherBenefits],
                  ].map(([label, value]) => (
                    <div className="col-md-6" key={label}>
                      <div className="aab-detail-row">
                        <span className="aab-detail-row__label">{label}</span>
                        <span className="aab-detail-row__value">{value || '—'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {}
          {ft && (
            <div className="aab-detail-card">
              <div className="aab-detail-card__header">
                <i className="bi bi-currency-dollar"></i>
                Full-Time Compensation
              </div>
              <div className="aab-detail-card__body">
                <div className="row g-2">
                  {[
                    ['Annual CTC',    formatCurrency(ft.annualCtc)],
                    ['Basic Salary',  formatCurrency(ft.basicSalary)],
                    ['HRA',           formatCurrency(ft.hra)],
                    ['Allowances',    formatCurrency(ft.allowances)],
                    ['Bonus',         formatCurrency(ft.bonusOrVariablePay)],
                    ['Joining Bonus', formatCurrency(ft.joiningBonus)],
                    ['Notice Period', ft.noticePeriod],
                    ['Probation',     ft.probationPeriod],
                    ['Insurance',     ft.insurancePlan],
                    ['Leave',         ft.leaveEntitlement],
                  ].map(([label, value]) => (
                    <div className="col-md-6" key={label}>
                      <div className="aab-detail-row">
                        <span className="aab-detail-row__label">{label}</span>
                        <span className="aab-detail-row__value">{value || '—'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {}
        <div className="col-lg-5">
          {workflow && (
            <div className="aab-workflow-card">
              <div className="aab-detail-card__header">
                <i className="bi bi-diagram-3-fill"></i>
                Approval Workflow
              </div>
              <div className="aab-workflow-card__body">

                {}
                <div className="aab-workflow-meta">
                  <span className="aab-workflow-number">{workflow.workflowNumber}</span>
                  <span className={`aab-wf-status-badge ${
                    workflow.status === 'Completed'  ? 'aab-wf-completed'  :
                    workflow.status === 'InProgress' ? 'aab-wf-inprogress' :
                    'aab-wf-default'
                  }`}>
                    {formatStatus(workflow.status)}
                  </span>
                </div>

                {}
                <div className="aab-workflow-progress">
                  <div className="aab-workflow-progress__header">
                    <span className="aab-workflow-progress__label">Progress</span>
                    <span className="aab-workflow-progress__count">
                      {approvedSteps} / {totalWfSteps} steps
                    </span>
                  </div>
                  <div className="aab-progress-track">
                    <div
                      className="aab-progress-fill"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>

                {}
                <WorkflowTracker
                  steps={workflow.steps ?? []}
                  currentStepIndex={workflow.currentStepIndex}
                />

              </div>
            </div>
          )}
        </div>

      </div>

      {}

      <ApproveModal
        show={showApprove}
        onClose={() => setShowApprove(false)}
        step={activeStep}
        onApprove={async (stepId, comments) => {
          try {
            await offerApprovalService.approveOffer({ workflowStepId: stepId, comments });
            toast.success('Offer approved successfully!');
            handleActionDone();
            return true;
          } catch (e) {
            toast.error(e?.message ?? 'Approval failed.');
            return false;
          }
        }}
      />

      <RejectModal
        show={showReject}
        onClose={() => setShowReject(false)}
        step={activeStep}
        onReject={async (stepId, comments) => {
          try {
            await offerApprovalService.rejectOffer({ workflowStepId: stepId, comments });
            toast.success('Offer rejected.');
            handleActionDone();
            return true;
          } catch (e) {
            toast.error(e?.message ?? 'Rejection failed.');
            return false;
          }
        }}
      />

      <RequestRevisionModal
        show={showRevision}
        onClose={() => setShowRevision(false)}
        step={activeStep}
        onRequestRevision={async (stepId, reason, fields) => {
          try {
            await offerApprovalService.requestRevision({
              workflowStepId:    stepId,
              revisionReason:    reason,
              highlightedFields: fields,
            });
            toast.success('Revision requested!');
            handleActionDone();
            return true;
          } catch (e) {
            toast.error(e?.message ?? 'Revision request failed.');
            return false;
          }
        }}
      />

      <ExpediteModal
        show={showExpedite}
        onClose={() => setShowExpedite(false)}
        offer={offer}
        onExpedite={async (oId, justification) => {
          try {
            await offerApprovalService.expediteOffer({ offerId: oId, justification });
            toast.success('Offer expedited!');
            setShowExpedite(false);
            fetchData();
            return true;
          } catch (e) {
            toast.error(e?.message ?? 'Expedite failed.');
            return false;
          }
        }}
      />

      <FinanceValidateModal
        show={showFinance}
        onClose={() => setShowFinance(false)}
        step={activeStep}
        onValidate={handleActionDone}
      />

    </div>
  );
};

export default ApprovalAction;
