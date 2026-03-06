import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAudit from '../../../hooks/sor/useAudit';
import AuditTable from '../../../components/sor/common/AuditTable';
import '../../../styles/sor/pages/OfferAuditLog.css';


const OfferAuditLog = () => {
  const { offerId } = useParams();
  const navigate    = useNavigate();
  const { auditLogs, loading, fetchAuditByOffer } = useAudit();

  useEffect(() => {
    if (offerId) fetchAuditByOffer(offerId);
  }, [offerId, fetchAuditByOffer]);

  const handleRefresh = () => fetchAuditByOffer(offerId);

  return (
    <div className="oal-page">

      {}
      <div className="oal-page-header">
        <div className="oal-page-header-left">
          <button
            className="oal-btn-back"
            onClick={() => navigate(`/sor/offers/${offerId}`)}
            title="Back to Offer"
          >
            <i className="bi bi-arrow-left"></i>
            Back
          </button>
          <div>
            <h4 className="oal-page-title">Offer Audit Trail</h4>
            <p className="oal-page-subtitle">
              <i className="bi bi-hash"></i>
              Complete activity history for Offer #{offerId}
            </p>
          </div>
        </div>

        <div className="oal-page-header-right">
          {}
          {!loading && auditLogs.length > 0 && (
            <div className="oal-stats-pill">
              <i className="bi bi-activity"></i>
              {auditLogs.length} event{auditLogs.length !== 1 ? 's' : ''} recorded
            </div>
          )}

          {}
          <button
            className="oal-btn-refresh"
            onClick={handleRefresh}
            disabled={loading}
            title="Refresh audit log"
          >
            <i className={`bi bi-arrow-repeat ${loading ? 'oal-spin' : ''}`}></i>
            Refresh
          </button>
        </div>
      </div>

      {}
      {!loading && auditLogs.length > 0 && (
        <div className="oal-info-alert">
          <i className="bi bi-info-circle"></i>
          <small>
            Showing <strong>{auditLogs.length}</strong> audit event{auditLogs.length !== 1 ? 's' : ''} recorded for this offer.
            Changes are logged in real-time and cannot be modified.
          </small>
        </div>
      )}

      {}
      <div className="oal-card">
        <div className="oal-card-header">
          <i className="bi bi-clipboard2-pulse-fill"></i>
          <span>Audit Events</span>
          {!loading && auditLogs.length > 0 && (
            <span className="oal-card-header-pill">{auditLogs.length} total</span>
          )}
        </div>
        <div className="oal-card-body">
          <AuditTable logs={auditLogs} loading={loading} />
        </div>
      </div>

    </div>
  );
};

export default OfferAuditLog;
