import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import offerService from '../../../services/sor/offerService';
import authService from '../../../services/auth/authService';
import Breadcrumb from '../../../components/common/Breadcrumb';
import { canDownloadOffer } from '../../../utils/sor/offerHelpers';
import useOffers from '../../../hooks/sor/useOffers';
import '../../../styles/sor/pages/OfferPreview.css';


const getStatusBadgeClass = (status) => {
  const s = (status || '').toLowerCase().replace(/\s/g, '');
  if (s.includes('draft'))                                        return 'op-badge--draft';
  if (s.includes('pendingapproval') || s.includes('pending'))     return 'op-badge--pending';
  if (s.includes('internallyapproved') || s.includes('approved')) return 'op-badge--approved';
  if (s.includes('sent'))                                         return 'op-badge--sent';
  if (s.includes('accepted'))                                     return 'op-badge--accepted';
  if (s.includes('rejected'))                                     return 'op-badge--rejected';
  if (s.includes('expired'))                                      return 'op-badge--expired';
  if (s.includes('withdrawn'))                                    return 'op-badge--withdrawn';
  return 'op-badge--default';
};

const formatStatus = (status) => {
  if (!status) return '—';
  return status.replace(/([A-Z])/g, ' $1').trim();
};

const getErrMsg = (e) =>
  e?.response?.data?.message ||
  e?.response?.data?.title   ||
  e?.message                 ||
  'Failed to load preview.';


const OfferPreview = () => {
  const { id }   = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { downloadOffer } = useOffers();

  const user     = authService.getCurrentUser();
  const userRole = user?.roleName ?? '';
  const isHR     = userRole.replace(/\s+/g, '').toLowerCase() === 'hr';

  const [preview, setPreview] = useState(null);
  const [offer,   setOffer]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [prevRes, offerRes] = await Promise.all([
          offerService.getOfferPreview(id),
          offerService.getOfferById(id),
        ]);
        setPreview(prevRes.data);
        setOffer(offerRes.data);
      } catch (e) {
        toast.error(getErrMsg(e));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleBack = () => {
    if (location.state?.returnTo) {
      navigate(location.state.returnTo);
    } else {
      navigate(`/sor/offers/${id}`);
    }
  };

  const backLabel = location.state?.returnLabel ?? 'Back';
  const canDownload = offer && canDownloadOffer(offer.status, userRole);

  if (loading) {
    return (
      <div className="op-loading-screen">
        <div className="op-loading-spinner" role="status" aria-label="Loading" />
        <p className="op-loading-text">Loading preview...</p>
      </div>
    );
  }

  return (
    <div className="op-page">
      {}
      <div className="op-header-card">

        <div className="op-header-card__left">

          {}
          <button className="op-btn-back" onClick={handleBack} aria-label="Go back">
            <i className="bi bi-arrow-left"></i>
            <span>{backLabel}</span>
          </button>

          <div className="op-header-v-divider" />

          <div className="op-header-title-block">
            <h4 className="op-page-title">Offer Preview</h4>
            {offer && (
              <div className="op-header-badges-row">
                <span className="op-offer-number-pill">
                  {offer.offerNumber ?? '—'}
                </span>
                <span className={`op-status-badge ${getStatusBadgeClass(offer.status)}`}>
                  <span className="op-status-dot" />
                  {formatStatus(offer.status)}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="op-header-card__actions">
          {isHR && (
            <button
              className="op-btn-action op-btn-action--outline"
              onClick={() => navigate(`/sor/offers/${id}/edit`)}
            >
              <i className="bi bi-pencil-square"></i>
              Edit Details
            </button>
          )}
          {canDownload && (
            <button
              className="op-btn-action op-btn-action--primary"
              onClick={() => downloadOffer(id, offer.offerNumber)}
            >
              <i className="bi bi-file-earmark-arrow-down"></i>
              Download PDF
            </button>
          )}
        </div>
      </div>

      {}
      {offer && (
        <div className="op-meta-strip">
          <div className="op-meta-item">
            <i className="bi bi-file-earmark-text op-meta-item__icon"></i>
            <div className="op-meta-item__body">
              <span className="op-meta-item__label">Offer Number</span>
              <span className="op-meta-item__value op-meta-item__value--mono">
                {offer.offerNumber ?? '—'}
              </span>
            </div>
          </div>

          <div className="op-meta-sep" />

          <div className="op-meta-item">
            <i className="bi bi-person op-meta-item__icon"></i>
            <div className="op-meta-item__body">
              <span className="op-meta-item__label">Candidate</span>
              <span className="op-meta-item__value">
                {offer.candidateName ?? '—'}
              </span>
            </div>
          </div>

          <div className="op-meta-sep" />

          <div className="op-meta-item">
            <i className="bi bi-briefcase op-meta-item__icon"></i>
            <div className="op-meta-item__body">
              <span className="op-meta-item__label">Type</span>
              <span className="op-meta-item__value">
                {offer.offerType ?? '—'}
              </span>
            </div>
          </div>

          <div className="op-meta-sep" />

          <div className="op-meta-item">
            <i className="bi bi-layers op-meta-item__icon"></i>
            <div className="op-meta-item__body">
              <span className="op-meta-item__label">Version</span>
              <span className="op-meta-item__value op-meta-item__value--mono">
                {offer.version != null ? `v${offer.version}` : '—'}
              </span>
            </div>
          </div>

          <div className="op-meta-sep" />

          <div className="op-meta-item">
            <i className="bi bi-shield-check op-meta-item__icon"></i>
            <div className="op-meta-item__body">
              <span className="op-meta-item__label">Status</span>
              <span className={`op-status-badge op-status-badge--sm ${getStatusBadgeClass(offer.status)}`}>
                <span className="op-status-dot" />
                {formatStatus(offer.status)}
              </span>
            </div>
          </div>
        </div>
      )}

      {}
      <div className="op-viewer-card">
        {preview?.htmlContent ? (
          <>
            {}
            <div className="op-viewer-toolbar">
              <div className="op-viewer-toolbar__left">
                <i className="bi bi-eye-fill"></i>
                <span className="op-viewer-toolbar__title">Document Preview</span>
                <span className="op-viewer-chip">Read Only</span>
              </div>
              <div className="op-viewer-toolbar__right">
                {canDownload && (
                  <button
                    className="op-toolbar-btn"
                    onClick={() => downloadOffer(id, offer.offerNumber)}
                    title="Download PDF"
                    aria-label="Download PDF"
                  >
                    <i className="bi bi-download"></i>
                  </button>
                )}
              </div>
            </div>

            {}
            <div className="op-viewer-stage">
              <div className="op-viewer-paper">
                <iframe
                  className="op-preview-iframe"
                  srcDoc={preview.htmlContent}
                  title="Offer Letter Preview"
                  sandbox="allow-same-origin"
                  scrolling="auto"
                />
              </div>
            </div>
          </>
        ) : (
          <div className="op-empty-state">
            <div className="op-empty-state__icon">
              <i className="bi bi-file-earmark-x"></i>
            </div>
            <h5 className="op-empty-state__title">Preview Not Available</h5>
            <p className="op-empty-state__desc">
              The offer letter preview could not be generated.
              Please fill in all required offer details first.
            </p>
            {isHR && (
              <button
                className="op-btn-action op-btn-action--outline"
                onClick={() => navigate(`/sor/offers/${id}/edit`)}
              >
                <i className="bi bi-pencil-square"></i>
                Fill Offer Details
              </button>
            )}
          </div>
        )}
      </div>

    </div>
  );
};

export default OfferPreview;
