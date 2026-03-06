import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import candidateService from "../../../services/sor/candidateService";
import StageBadge from "../../../components/sor/common/StageBadge";
import EditCandidateModal from "../../../components/sor/Modal/candidates/EditCandidateModal";
import MoveToOfferStageModal from "../../../components/sor/Modal/candidates/MoveToOfferStageModal";
import CreateOfferModal from "../../../components/sor/Modal/offers/CreateOfferModal";
import useOffers from "../../../hooks/sor/useOffers";
import {
  canMoveToOfferStage,
  canCreateOffer,
} from "../../../utils/sor/candidateHelpers";
import "../../../styles/sor/pages/CandidateDetail.css";


const CandidateDetail = () => {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [candidate, setCandidate] = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [showEdit,  setShowEdit]  = useState(false);
  const [showMove,  setShowMove]  = useState(false);
  const [showOffer, setShowOffer] = useState(false);

  const { createOffer } = useOffers();

  const fetchCandidate = async () => {
    setLoading(true);
    try {
      const res = await candidateService.getCandidateById(id);
      setCandidate(res.data);
    } catch (e) {
      toast.error(e?.response?.data?.message || e?.message || "Failed to load candidate.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCandidate(); }, [id]);

  const handleUpdate = async (cId, data) => {
    try {
      await candidateService.updateCandidate(cId, data);
      toast.success("Candidate updated successfully");
      fetchCandidate();
      return true;
    } catch (e) {
      toast.error(e?.response?.data?.message || e?.message || "Update failed.");
      return false;
    }
  };

  const handleMove = async (cId) => {
    try {
      await candidateService.moveToOfferStage(cId);
      toast.success("Moved to Offer Stage");
      fetchCandidate();
      return true;
    } catch (e) {
      toast.error(e?.response?.data?.message || e?.message || "Move failed.");
      return false;
    }
  };

  const handleCreateOffer = async (data) => {
    const offer = await createOffer(data);
    if (offer) {
      navigate(`/sor/offers/${offer.offerId}/edit`);
      return true;
    }
    return false;
  };

  
  if (loading) {
    return (
      <div className="cd-loading-screen">
        <div className="cd-loading-spinner" role="status" aria-label="Loading" />
        <p className="cd-loading-text">Loading candidate details...</p>
      </div>
    );
  }

  
  if (!candidate) {
    return (
      <div className="cd-page">
        <div className="cd-not-found">
          <div className="cd-not-found__icon">
            <i className="bi bi-person-x"></i>
          </div>
          <h5 className="cd-not-found__title">Candidate Not Found</h5>
          <p className="cd-not-found__desc">
            This candidate does not exist or has been removed.
          </p>
          <button
            className="cd-btn cd-btn--outline"
            onClick={() => navigate("/sor/candidates")}
          >
            <i className="bi bi-arrow-left"></i>
            Back to Candidates
          </button>
        </div>
      </div>
    );
  }

  const addedOn = candidate.createdAt
    ? new Date(candidate.createdAt).toLocaleDateString("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
      })
    : "—";

  
  const initials = (candidate.candidateName || "?")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div className="cd-page">

      {}
      <div className="cd-header-card">
        <div className="cd-header-card__left">
          <button
            className="cd-btn-back"
            onClick={() => navigate("/sor/candidates")}
            aria-label="Back to candidates"
          >
            <i className="bi bi-arrow-left"></i>
            <span>Back</span>
          </button>

          <div className="cd-header-v-divider" />

          <div className="cd-header-avatar">{initials}</div>

          <div className="cd-header-title-block">
            <h4 className="cd-candidate-name">{candidate.candidateName}</h4>
            <div className="cd-header-badge-row">
              <StageBadge stage={candidate.currentStage} />
              <span
                className={`cd-active-pill ${
                  candidate.isActive ? "cd-active-pill--active" : "cd-active-pill--inactive"
                }`}
              >
                <span className="cd-active-pill__dot" />
                {candidate.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </div>

        <div className="cd-header-card__actions">
          <button
            className="cd-btn cd-btn--outline"
            onClick={() => setShowEdit(true)}
          >
            <i className="bi bi-pencil-square"></i>
            Edit
          </button>

          {canMoveToOfferStage(candidate.currentStage) && (
            <button
              className="cd-btn cd-btn--teal"
              onClick={() => setShowMove(true)}
            >
              <i className="bi bi-arrow-right-circle"></i>
              Move to Offer Stage
            </button>
          )}

          {canCreateOffer(candidate.currentStage) && (
            <button
              className="cd-btn cd-btn--primary"
              onClick={() => setShowOffer(true)}
            >
              <i className="bi bi-file-earmark-plus"></i>
              Create Offer
            </button>
          )}
        </div>
      </div>

      {}
      <div className="cd-cards-grid">

        {}
        <div className="cd-card">
          <div className="cd-card__header">
            <i className="bi bi-person-lines-fill"></i>
            <span>Contact Information</span>
          </div>
          <div className="cd-card__body">
            <div className="cd-detail-grid">

              <div className="cd-detail-item">
                <span className="cd-detail-item__label">Full Name</span>
                <span className="cd-detail-item__value">
                  {candidate.candidateName || "—"}
                </span>
              </div>

              <div className="cd-detail-item">
                <span className="cd-detail-item__label">Email Address</span>
                <span className="cd-detail-item__value cd-detail-item__value--email">
                  <i className="bi bi-envelope"></i>
                  {candidate.email || "—"}
                </span>
              </div>

              <div className="cd-detail-item">
                <span className="cd-detail-item__label">Phone Number</span>
                <span className="cd-detail-item__value">
                  <i className="bi bi-telephone"></i>
                  {candidate.phone || "—"}
                </span>
              </div>

              <div className="cd-detail-item cd-detail-item--full">
                <span className="cd-detail-item__label">Address</span>
                <span className="cd-detail-item__value">
                  <i className="bi bi-geo-alt"></i>
                  {candidate.address || "—"}
                </span>
              </div>

            </div>
          </div>
        </div>

        {}
        <div className="cd-card">
          <div className="cd-card__header">
            <i className="bi bi-diagram-3-fill"></i>
            <span>Pipeline Information</span>
          </div>
          <div className="cd-card__body">
            <div className="cd-detail-grid">

              <div className="cd-detail-item">
                <span className="cd-detail-item__label">Current Stage</span>
                <span className="cd-detail-item__value">
                  <StageBadge stage={candidate.currentStage} />
                </span>
              </div>

              <div className="cd-detail-item">
                <span className="cd-detail-item__label">Status</span>
                <span className="cd-detail-item__value">
                  <span
                    className={`cd-active-pill ${
                      candidate.isActive
                        ? "cd-active-pill--active"
                        : "cd-active-pill--inactive"
                    }`}
                  >
                    <span className="cd-active-pill__dot" />
                    {candidate.isActive ? "Active" : "Inactive"}
                  </span>
                </span>
              </div>

              <div className="cd-detail-item">
                <span className="cd-detail-item__label">Added On</span>
                <span className="cd-detail-item__value">
                  <i className="bi bi-calendar3"></i>
                  {addedOn}
                </span>
              </div>

              {candidate.candidateId && (
                <div className="cd-detail-item">
                  <span className="cd-detail-item__label">Candidate ID</span>
                  <span className="cd-detail-item__value cd-detail-item__value--mono">
                    {candidate.candidateId}
                  </span>
                </div>
              )}

            </div>
          </div>
        </div>

      </div>

      {}
      <EditCandidateModal
        show={showEdit}
        onClose={() => setShowEdit(false)}
        candidate={candidate}
        onUpdate={handleUpdate}
      />

      <MoveToOfferStageModal
        show={showMove}
        onClose={() => setShowMove(false)}
        candidate={candidate}
        onMove={handleMove}
      />

      <CreateOfferModal
        show={showOffer}
        onClose={() => setShowOffer(false)}
        candidate={candidate}
        onCreateOffer={handleCreateOffer}
      />

    </div>
  );
};

export default CandidateDetail;
