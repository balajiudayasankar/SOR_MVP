import React, { useEffect, useState, useRef } from 'react';
import useAudit from '../../../hooks/sor/useAudit';
import AuditTable from '../../../components/sor/common/AuditTable';
import Breadcrumb from '../../../components/common/Breadcrumb';
import { AUDIT_PAGE_SIZE } from '../../../constants/sor/sorConstants';
import '../../../styles/sor/pages/AuditLog.css';


const AuditLog = () => {
  const {
    auditLogs,
    totalCount,
    totalPages,
    currentPage,
    loading,
    fetchAuditLogs,
  } = useAudit();

  const [pageSize]        = useState(AUDIT_PAGE_SIZE);
  const [showRowsDrop,    setShowRowsDrop]  = useState(false);
  const [rowsPerPage,     setRowsPerPage]   = useState(pageSize);
  const rowsDropRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (rowsDropRef.current && !rowsDropRef.current.contains(e.target)) {
        setShowRowsDrop(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    fetchAuditLogs(1, rowsPerPage);
  }, [fetchAuditLogs, rowsPerPage]);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    fetchAuditLogs(page, rowsPerPage);
  };

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (currentPage <= 3) {
      pages.push(1, 2, 3, '...', totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    }
    return pages;
  };

  const startRecord = totalCount === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const endRecord   = Math.min(currentPage * rowsPerPage, totalCount);

  return (
    <div className="al-page">

      <Breadcrumb items={[{ label: 'Audit Logs' }]} />

      {}
      <div className="al-page-header">
        <div>
          <h4 className="al-page-title">Audit Logs</h4>
          <p className="al-page-subtitle">
            System-wide activity trail
            {totalCount > 0 && (
              <span className="al-page-subtitle__count">
                — {totalCount} total records
              </span>
            )}
          </p>
        </div>
        <button
          className="al-btn-refresh"
          onClick={() => fetchAuditLogs(currentPage, rowsPerPage)}
          title="Refresh audit logs"
        >
          <i className="bi bi-arrow-clockwise"></i>
          Refresh
        </button>
      </div>

      {}
      <div className="al-table-card">

        {}
        <div className="al-table-card__header">
          <div className="al-table-card__header-left">
            <i className="bi bi-journal-text"></i>
            <span>Activity Trail</span>
            {totalCount > 0 && (
              <span className="al-record-pill">{totalCount} records</span>
            )}
          </div>
          {loading && (
            <div className="al-inline-spinner" role="status" aria-label="Loading" />
          )}
        </div>

        {}
        <div className="al-table-body">
          <AuditTable logs={auditLogs} loading={loading} />
        </div>

        {}
        <div className="al-pagination">

          {}
          <div className="al-pagination-info">
            <span>Show</span>
            <div ref={rowsDropRef} className="al-rows-dropdown-wrapper">
              <button
                type="button"
                className="al-rows-button"
                onClick={() => setShowRowsDrop(!showRowsDrop)}
              >
                <span>{rowsPerPage}</span>
                <i className={`bi bi-chevron-${showRowsDrop ? 'up' : 'down'} al-rows-chevron`}></i>
              </button>
              {showRowsDrop && (
                <div className="al-rows-dropdown">
                  {[10, 25, 50, 100].map((size) => (
                    <div
                      key={size}
                      className={`al-rows-option ${rowsPerPage === size ? 'al-rows-active' : ''}`}
                      onClick={() => {
                        setRowsPerPage(size);
                        setShowRowsDrop(false);
                      }}
                    >
                      {size}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <span>entries</span>
          </div>

          {}
          <div className="al-pagination-status">
            {totalCount === 0
              ? 'No entries'
              : `Showing ${startRecord} to ${endRecord} of ${totalCount} entries`}
          </div>

          {}
          {totalPages > 1 && (
            <nav className="al-pagination-nav">
              <ul className="al-pagination-list">

                <li className={`al-page-item ${currentPage <= 1 ? 'disabled' : ''}`}>
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage <= 1}
                    title="Previous page"
                  >
                    <i className="bi bi-chevron-left"></i>
                  </button>
                </li>

                {getPageNumbers().map((page, index) => (
                  <li
                    key={index}
                    className={`al-page-item ${page === currentPage ? 'active' : ''} ${typeof page !== 'number' ? 'disabled' : ''}`}
                  >
                    <button
                      onClick={() => typeof page === 'number' && goToPage(page)}
                      disabled={typeof page !== 'number'}
                    >
                      {page}
                    </button>
                  </li>
                ))}

                <li className={`al-page-item ${currentPage >= totalPages ? 'disabled' : ''}`}>
                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    title="Next page"
                  >
                    <i className="bi bi-chevron-right"></i>
                  </button>
                </li>

              </ul>
            </nav>
          )}

        </div>
      </div>
    </div>
  );
};

export default AuditLog;
