import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import offerService from "../../../services/sor/offerService";
import offerApprovalService from "../../../services/sor/offerApprovalService";
import authService from "../../../services/auth/authService";
import OfferStatusBadge from "../../../components/sor/common/OfferStatusBadge";
import OfferTypeBadge from "../../../components/sor/common/OfferTypeBadge";
import WorkflowTracker from "../../../components/sor/common/WorkflowTracker";
import SubmitForApprovalModal from "../../../components/sor/Modal/offers/SubmitForApprovalModal";
import RegenerateOfferModal from "../../../components/sor/Modal/offers/RegenerateOfferModal";
import {
  canEditOffer,
  canDownloadOffer,
  formatDate,
  formatCurrency,
} from "../../../utils/sor/offerHelpers";
import useOffers from "../../../hooks/sor/useOffers";
import "../../../styles/sor/pages/OfferDetail.css";


const OfferDetail = () => {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { downloadOffer, submitForApproval, regenerateOffer } = useOffers();

  const user     = authService.getCurrentUser();
  const userRole = user?.roleName ?? "";

  const [offer,   setOffer]   = useState(null);
  const [workflow, setWorkflow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSubmit, setShowSubmit] = useState(false);
  const [showRegen,  setShowRegen]  = useState(false);

  const fetchOffer = async () => {
    setLoading(true);
    try {
      const res  = await offerService.getOfferById(id);
      const data = res.data;
      setOffer(data);

      if (data?.workflow) {
        setWorkflow(data.workflow);
      } else {
        try {
          const wfRes = await offerApprovalService.getWorkflowByOffer(id);
          setWorkflow(wfRes.data);
        } catch {}
      }
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffer();
  }, [id]);

  if (loading) {
    return (
      <div className="od-loading-screen">
        <div className="od-loading-spinner" role="status" aria-label="Loading" />
        <p className="od-loading-text">Loading offer details...</p>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="od-page">
        <div className="od-not-found">
          <div className="od-not-found__icon">
            <i className="bi bi-exclamation-triangle"></i>
          </div>
          <h5 className="od-not-found__title">Offer Not Found</h5>
          <p className="od-not-found__desc">
            The offer you are looking for does not exist or has been removed.
          </p>
          <button
            className="od-btn od-btn--outline"
            onClick={() => navigate("/sor/offers")}
          >
            <i className="bi bi-arrow-left"></i>
            Back to Offers
          </button>
        </div>
      </div>
    );
  }

  const cd  = offer.commonDetails    || {};
  const id_ = offer.internshipDetails ?? null;
  const ft  = offer.fullTimeDetails   ?? null;

  const handleSubmit = async (data) => {
    const ok = await submitForApproval(data);
    if (ok) { fetchOffer(); return true; }
    return false;
  };

  const handleRegen = async (data) => {
    const ok = await regenerateOffer(data);
    if (ok) { fetchOffer(); return true; }
    return false;
  };

  return (
    <div className="od-page">

      {}
      <div className="od-header-card">
        <div className="od-header-card__left">
          <button
            className="od-btn-back"
            onClick={() => navigate("/sor/offers")}
            aria-label="Back to offers list"
          >
            <i className="bi bi-arrow-left"></i>
            <span>Back</span>
          </button>

          <div className="od-header-v-divider" />

          <div className="od-header-title-block">
            <h4 className="od-offer-number">{offer.offerNumber}</h4>
            <div className="od-badge-row">
              <OfferTypeBadge offerType={offer.offerType} />
              <OfferStatusBadge status={offer.status} />
              <span className="od-version-pill">v{offer.version}</span>
            </div>
          </div>
        </div>

        <div className="od-header-card__actions">
          {canEditOffer(offer.status) && (
            <button
              className="od-btn od-btn--outline"
              onClick={() => navigate(`/sor/offers/${id}/edit`)}
            >
              <i className="bi bi-pencil-square"></i>
              Edit
            </button>
          )}

          <button
            className="od-btn od-btn--teal"
            onClick={() => navigate(`/sor/offers/${id}/preview`)}
          >
            <i className="bi bi-eye"></i>
            Preview
          </button>

          {canEditOffer(offer.status) && (
            <button
              className="od-btn od-btn--primary"
              onClick={() => setShowSubmit(true)}
            >
              <i className="bi bi-send-check"></i>
              Submit
            </button>
          )}

          {canDownloadOffer(offer.status, userRole) && (
            <button
              className="od-btn od-btn--success"
              onClick={() => downloadOffer(offer.offerId, offer.offerNumber)}
            >
              <i className="bi bi-file-earmark-arrow-down"></i>
              Download
            </button>
          )}

          {offer.status === "RevisionRequested" && (
            <button
              className="od-btn od-btn--warning"
              onClick={() => setShowRegen(true)}
            >
              <i className="bi bi-arrow-repeat"></i>
              Regenerate
            </button>
          )}
        </div>
      </div>

      {}
      <div className="od-content-grid">

        {}
        <div className="od-col-main">
          <SectionCard
            icon="bi-person-fill"
            title="Candidate & Job Details"
            items={[
              ["Candidate",        cd.candidateName],
              ["Email",            cd.candidateEmail],
              ["Phone",            cd.candidatePhone],
              ["Designation",      cd.designation],
              ["Department",       cd.department],
              ["Work Location",    cd.workLocation],
              ["Reporting Manager",cd.reportingManager],
              ["Offer Issue Date", formatDate(cd.offerIssueDate)],
              ["Joining Date",     formatDate(cd.joiningDate)],
              ["Working Days",     cd.workingDays],
              ["Working Hours",    cd.workingHours],
            ]}
          />

          {id_ && (
            <SectionCard
              icon="bi-mortarboard-fill"
              title="Internship Details"
              items={[
                ["Start Date",              formatDate(id_.internshipStartDate)],
                ["End Date",                formatDate(id_.internshipEndDate)],
                ["Duration",                id_.durationMonths ? `${id_.durationMonths} months` : null],
                ["Stipend",                 formatCurrency(id_.stipendAmount)],
                ["Training Location",       id_.trainingLocation],
                ["Full-Time Salary After",  formatCurrency(id_.fullTimeSalaryAfterInternship)],
              ]}
            />
          )}

          {ft && (
            <SectionCard
              icon="bi-briefcase-fill"
              title="Full-Time Details"
              items={[
                ["Annual CTC",    formatCurrency(ft.annualCtc)],
                ["Basic Salary",  formatCurrency(ft.basicSalary)],
                ["HRA",           formatCurrency(ft.hra)],
                ["Allowances",    formatCurrency(ft.allowances)],
                ["Joining Bonus", formatCurrency(ft.joiningBonus)],
                ["Notice Period", ft.noticePeriod],
                ["Probation",     ft.probationPeriod],
                ["Insurance",     ft.insurancePlan],
              ]}
            />
          )}
        </div>

        {}
        <div className="od-col-sidebar">

          {workflow && (
            <div className="od-card">
              <div className="od-card__header">
                <i className="bi bi-diagram-3-fill"></i>
                <span>Approval Workflow</span>
              </div>
              <div className="od-card__body">
                <div className="od-workflow-meta">
                  <span className="od-workflow-number">{workflow.workflowNumber}</span>
                  <span
                    className={`od-workflow-status-badge ${
                      workflow.status === "InProgress"
                        ? "od-workflow-status-badge--progress"
                        : "od-workflow-status-badge--done"
                    }`}
                  >
                    {workflow.status}
                  </span>
                </div>
                <WorkflowTracker
                  steps={workflow.steps || []}
                  currentStepIndex={workflow.currentStepIndex}
                />
              </div>
            </div>
          )}

          <div className="od-card">
            <div className="od-card__header">
              <i className="bi bi-link-45deg"></i>
              <span>Quick Links</span>
            </div>
            <div className="od-card__body od-quick-links">
              <button
                className="od-link-btn"
                onClick={() => navigate(`/sor/offers/${id}/versions`)}
              >
                <i className="bi bi-clock-history"></i>
                <span>Version History</span>
                <i className="bi bi-chevron-right od-link-btn__chevron"></i>
              </button>
              <button
                className="od-link-btn"
                onClick={() => navigate(`/sor/audit/offer/${id}`)}
              >
                <i className="bi bi-journal-text"></i>
                <span>Audit Trail</span>
                <i className="bi bi-chevron-right od-link-btn__chevron"></i>
              </button>
            </div>
          </div>

        </div>
      </div>

      <SubmitForApprovalModal
        show={showSubmit}
        onClose={() => setShowSubmit(false)}
        offer={offer}
        onSubmit={handleSubmit}
      />

      <RegenerateOfferModal
        show={showRegen}
        onClose={() => setShowRegen(false)}
        offer={offer}
        onRegenerate={handleRegen}
      />
    </div>
  );
};


const SectionCard = ({ icon, title, items }) => (
  <div className="od-card od-card--mb">
    <div className="od-card__header">
      <i className={`bi ${icon}`}></i>
      <span>{title}</span>
    </div>
    <div className="od-card__body">
      <div className="od-detail-grid">
        {items.map(([label, value]) => (
          <div className="od-detail-item" key={label}>
            <span className="od-detail-item__label">{label}</span>
            <span className="od-detail-item__value">{value || "—"}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);


export default OfferDetail;
