import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import offerService from '../../../services/sor/offerService';
import OfferStatusBadge from '../../../components/sor/common/OfferStatusBadge';
import OfferTypeBadge from '../../../components/sor/common/OfferTypeBadge';
import { formatDate } from '../../../utils/sor/offerHelpers';
import '../../../styles/sor/pages/OfferVersions.css';


const OfferVersions = () => {
  const { id }   = useParams();
  const navigate = useNavigate();
  const [versions, setVersions] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    offerService
      .getOfferVersions(id)
      .then((res) => setVersions(res.data || []))
      .catch((e)  => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="ovp-page">

      {}
      <div className="ovp-page-header">
        <div className="ovp-page-header-left">
          <button
            className="ovp-btn-back"
            onClick={() => navigate(`/sor/offers/${id}`)}
            title="Back to Offer"
          >
            <i className="bi bi-arrow-left"></i>
            Back
          </button>
          <div>
            <h4 className="ovp-page-title">Version History</h4>
            <p className="ovp-page-subtitle">All versions of this offer letter</p>
          </div>
        </div>

        {!loading && versions.length > 0 && (
          <div className="ovp-stats-pill">
            <i className="bi bi-clock-history"></i>
            {versions.length} version{versions.length !== 1 ? 's' : ''} found
          </div>
        )}
      </div>

      {}
      {loading ? (
        <div className="ovp-loading">
          <div className="ovp-spinner" role="status" aria-label="Loading" />
          <p className="ovp-loading-text">Loading version history...</p>
        </div>

      ) : versions.length === 0 ? (
        <div className="ovp-empty-state">
          <div className="ovp-empty-state__icon">
            <i className="bi bi-clock-history"></i>
          </div>
          <h5 className="ovp-empty-state__title">No Version History</h5>
          <p className="ovp-empty-state__desc">
            No version history found for this offer letter.
          </p>
          <button
            className="ovp-btn-outline"
            onClick={() => navigate(`/sor/offers/${id}`)}
          >
            <i className="bi bi-arrow-left"></i> Back to Offer
          </button>
        </div>

      ) : (
        <div className="ovp-card">

          {}
          <div className="ovp-card-header">
            <i className="bi bi-clock-history"></i>
            <span>Version Timeline</span>
            <span className="ovp-card-header-pill">
              {versions.length} total
            </span>
          </div>

          {}
          <div className="ovp-timeline">
            {versions.map((v, idx) => (
              <div
                key={v.offerId || idx}
                className={`ovp-item ${idx === 0 ? 'ovp-item--latest' : ''}`}
              >
                {}
                <div className="ovp-item__left">
                  <div className={`ovp-version-badge ${idx === 0 ? 'ovp-version-badge--latest' : ''}`}>
                    v{v.version}
                  </div>
                  {idx < versions.length - 1 && (
                    <div className="ovp-connector" />
                  )}
                </div>

                {}
                <div className="ovp-item__content">

                  {}
                  <div className="ovp-item__header">
                    <span className="ovp-offer-number">
                      <i className="bi bi-file-earmark-text"></i>
                      {v.offerNumber}
                    </span>
                    <div className="ovp-item__badges">
                      <OfferTypeBadge   offerType={v.offerType} />
                      <OfferStatusBadge status={v.status} />
                      {idx === 0 && (
                        <span className="ovp-latest-badge">
                          <i className="bi bi-check-circle-fill"></i>
                          Latest
                        </span>
                      )}
                    </div>
                  </div>

                  {}
                  <div className="ovp-item__meta">
                    <span className="ovp-meta-item">
                      <i className="bi bi-person"></i>
                      {v.candidateName}
                    </span>
                    <span className="ovp-meta-item">
                      <i className="bi bi-calendar3"></i>
                      Created: {formatDate(v.createdAt)}
                    </span>
                    {v.updatedAt && (
                      <span className="ovp-meta-item">
                        <i className="bi bi-arrow-repeat"></i>
                        Updated: {formatDate(v.updatedAt)}
                      </span>
                    )}
                  </div>

                  {}
                  <div className="ovp-item__actions">
                    <button
                      className="ovp-btn-action ovp-btn-action--primary"
                      onClick={() => navigate(`/sor/offers/${v.offerId}`)}
                    >
                      <i className="bi bi-eye"></i>
                      View This Version
                    </button>
                    <button
                      className="ovp-btn-action ovp-btn-action--ghost"
                      onClick={() => navigate(`/sor/offers/${v.offerId}/preview`)}
                    >
                      <i className="bi bi-search"></i>
                      Preview
                    </button>
                  </div>

                </div>
              </div>
            ))}
          </div>

        </div>
      )}
    </div>
  );
};

export default OfferVersions;
