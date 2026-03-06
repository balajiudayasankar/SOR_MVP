import React from 'react';
import { getAuditConfig, formatAuditDateTime } from '../../../utils/sor/auditHelpers';
import '../../../styles/sor/components/AuditTable.css';

const AuditTable = ({ logs = [], loading = false }) => {
  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  if (!logs.length) {
    return (
      <div className="audit-empty">
        <p className="text-muted mb-0">No audit logs found.</p>
      </div>
    );
  }

  return (
    <div className="table-responsive audit-table-wrapper">
      <table className="table table-hover align-middle mb-0">
        <thead className="table-light">
          <tr>
            <th>#</th>
            <th>Entity</th>
            <th>Action</th>
            <th>Performed By</th>
            <th>Date & Time</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log, idx) => {
            const config = getAuditConfig(log.action);
            return (
              <tr key={log.auditLogId || idx}>
                <td className="text-muted">{log.auditLogId}</td>
                <td>
                  <span className="fw-semibold">{log.entityType}</span>
                  {log.entityId && (
                    <span className="text-muted ms-1">#{log.entityId}</span>
                  )}
                </td>
                <td>
                  <span className={`sor-badge sor-badge-${config.bg}`}>
                    {config.label}
                  </span>
                </td>
                <td>{log.performedByUserName || `User#${log.performedByUserId}`}</td>
                <td className="text-muted">{formatAuditDateTime(log.performedAt)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AuditTable;
