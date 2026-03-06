import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import candidateService from "../../../services/sor/candidateService";
import useOffers from "../../../hooks/sor/useOffers";
import { OFFER_TYPE_OPTIONS } from "../../../constants/sor/offerTypes";
import "../../../styles/sor/pages/CreateOffer.css";


const CreateOffer = () => {
  const navigate        = useNavigate();
  const [searchParams]  = useSearchParams();
  const { createOffer } = useOffers();

  const [candidates, setCandidates] = useState([]);
  const [loadingCandidates, setLoadingCandidates] = useState(true);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    candidateId: searchParams.get("candidateId") || "",
    offerType: 1,
  });

  useEffect(() => {
    setLoadingCandidates(true);
    candidateService
      .getCandidatesByStage(4)
      .then((res) => setCandidates(res.data || []))
      .catch(() => {})
      .finally(() => setLoadingCandidates(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const offer = await createOffer({
      candidateId: Number(form.candidateId),
      offerType:   Number(form.offerType),
    });
    setLoading(false);
    if (offer) navigate(`/sor/offers/${offer.offerId}/edit`);
  };

  const selectedCandidate = candidates.find(
    (c) => String(c.candidateId) === String(form.candidateId)
  );

  return (
    <div className="co-page">

      {}
      <div className="co-page-header">
        <div className="co-page-header-left">
          <button
            className="co-btn-back"
            onClick={() => navigate("/sor/offers")}
            title="Back to Offers"
          >
            <i className="bi bi-arrow-left"></i>
            Back
          </button>
          <div>
            <h4 className="co-page-title">Create New Offer</h4>
            <p className="co-page-subtitle">
              <i className="bi bi-list-ol"></i>
              Step 1 of 2 — Select Candidate &amp; Offer Type
            </p>
          </div>
        </div>

        {}
        <div className="co-steps">
          <div className="co-step co-step--active">
            <span className="co-step__num">1</span>
            <span className="co-step__label">Select</span>
          </div>
          <div className="co-step-divider" />
          <div className="co-step co-step--inactive">
            <span className="co-step__num">2</span>
            <span className="co-step__label">Build</span>
          </div>
        </div>
      </div>

      {}
      <div className="co-center-wrap">
        <div className="co-card">

          {}
          <div className="co-card-header">
            <i className="bi bi-file-earmark-person-fill"></i>
            <span>New Offer Details</span>
          </div>

          <form onSubmit={handleSubmit} className="co-card-body">

            {}
            <div className="co-field">
              <label className="co-label">
                Candidate <span className="co-required">*</span>
              </label>

              {loadingCandidates ? (
                <div className="co-skeleton" />
              ) : (
                <div className="co-select-wrapper">
                  <i className="bi bi-person co-select-icon"></i>
                  <select
                    className={`co-select ${!form.candidateId ? "co-select--placeholder" : ""}`}
                    value={form.candidateId}
                    onChange={(e) =>
                      setForm({ ...form, candidateId: e.target.value })
                    }
                    required
                  >
                    <option value="">Select candidate in Offer Stage</option>
                    {candidates.map((c) => (
                      <option key={c.candidateId} value={c.candidateId}>
                        {c.candidateName} — {c.email}
                      </option>
                    ))}
                  </select>
                  <i className="bi bi-chevron-down co-select-chevron"></i>
                </div>
              )}

              {}
              {selectedCandidate && (
                <div className="co-selected-pill">
                  <div className="co-selected-pill__avatar">
                    {selectedCandidate.candidateName.charAt(0).toUpperCase()}
                  </div>
                  <div className="co-selected-pill__info">
                    <span className="co-selected-pill__name">
                      {selectedCandidate.candidateName}
                    </span>
                    <span className="co-selected-pill__email">
                      {selectedCandidate.email}
                    </span>
                  </div>
                  <i className="bi bi-check-circle-fill co-selected-pill__check"></i>
                </div>
              )}

              {}
              {!loadingCandidates && candidates.length === 0 && (
                <div className="co-empty-hint">
                  <i className="bi bi-exclamation-circle"></i>
                  <span>
                    No candidates in Offer Stage.{" "}
                    <span
                      className="co-link"
                      onClick={() => navigate("/sor/candidates")}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) =>
                        e.key === "Enter" && navigate("/sor/candidates")
                      }
                    >
                      Manage candidates
                    </span>
                  </span>
                </div>
              )}
            </div>

            {}
            <div className="co-field">
              <label className="co-label">
                Offer Type <span className="co-required">*</span>
              </label>
              <p className="co-field-hint">
                Select the type of offer to generate for this candidate
              </p>

              <div className="co-type-grid">
                {OFFER_TYPE_OPTIONS.map((o) => {
                  const isActive = Number(form.offerType) === o.value;
                  return (
                    <div
                      key={o.value}
                      className={`co-type-card ${isActive ? "co-type-card--active" : ""}`}
                      onClick={() => setForm({ ...form, offerType: o.value })}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) =>
                        e.key === "Enter" && setForm({ ...form, offerType: o.value })
                      }
                    >
                      <div className="co-type-card__radio">
                        {isActive && <div className="co-type-card__radio-dot" />}
                      </div>
                      <div className="co-type-card__label">{o.label}</div>
                      {isActive && (
                        <i className="bi bi-check-circle-fill co-type-card__check"></i>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {}
            <div className="co-info-alert">
              <i className="bi bi-info-circle"></i>
              <small>
                Only candidates in <strong>Offer Stage</strong> are eligible.
                After creation, you will be redirected to fill in the offer details.
              </small>
            </div>

            {}
            <button
              type="submit"
              className="co-btn-primary"
              disabled={loading || !form.candidateId}
            >
              {loading ? (
                <>
                  <span className="co-spinner" />
                  Creating Draft...
                </>
              ) : (
                <>
                  <i className="bi bi-file-earmark-plus"></i>
                  Create Draft &amp; Continue
                  <i className="bi bi-arrow-right co-btn-arrow"></i>
                </>
              )}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateOffer;
