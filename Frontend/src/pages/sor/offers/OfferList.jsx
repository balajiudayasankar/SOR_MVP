import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useOffers from '../../../hooks/sor/useOffers';
import authService from '../../../services/auth/authService';
import Breadcrumb from '../../../components/common/Breadcrumb';
import { canEditOffer, canDownloadOffer, formatDate } from '../../../utils/sor/offerHelpers';
import { OFFER_STATUS_BADGE_CONFIG } from '../../../constants/sor/offerStatuses';
import '../../../styles/sor/pages/OfferList.css';

const getStatusBadgeClass = (status) => {
  const s = (status || '').toLowerCase().replace(/\s/g, '');
  if (s.includes('draft'))              return 'ol-badge-draft';
  if (s.includes('pendingapproval') ||
      s.includes('pending'))            return 'ol-badge-pending';
  if (s.includes('internallyapproved') ||
      s.includes('approved'))           return 'ol-badge-approved';
  if (s.includes('sent'))               return 'ol-badge-sent';
  if (s.includes('accepted'))           return 'ol-badge-accepted';
  if (s.includes('rejected'))           return 'ol-badge-rejected';
  if (s.includes('expired'))            return 'ol-badge-expired';
  if (s.includes('withdrawn'))          return 'ol-badge-withdrawn';
  return 'ol-badge-default';
};

const getTypeBadgeClass = (type) => {
  const t = (type || '').toLowerCase().replace(/\s/g, '');
  if (t.includes('fulltime') || t.includes('full'))  return 'ol-type-fulltime';
  if (t.includes('intern'))                           return 'ol-type-internship';
  if (t.includes('contract'))                         return 'ol-type-contract';
  if (t.includes('parttime') || t.includes('part'))  return 'ol-type-parttime';
  return 'ol-type-default';
};

const getOfferInitials = (candidateName) => {
  if (!candidateName) return '?';
  const parts = candidateName.trim().split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const OfferList = () => {
  const navigate = useNavigate();
  const { offers, loading, downloadOffer } = useOffers();

  const user     = authService.getCurrentUser();
  const userRole = user?.roleName ?? '';

  const [search, setSearch]                     = useState('');
  const [statusFilter, setStatusFilter]         = useState('');
  const [rowsPerPage, setRowsPerPage]           = useState(10);
  const [currentPage, setCurrentPage]           = useState(1);
  const [showRowsDropdown, setShowRowsDropdown] = useState(false);
  const rowsDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (rowsDropdownRef.current && !rowsDropdownRef.current.contains(e.target)) {
        setShowRowsDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = offers.filter((o) => {
    const matchSearch = !search ||
      o.offerNumber?.toLowerCase().includes(search.toLowerCase()) ||
      o.candidateName?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / rowsPerPage) || 1;
  const safePage   = Math.min(currentPage, totalPages);

  const getPaginatedOffers = () => {
    const start = (safePage - 1) * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  };

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (safePage <= 3) {
      pages.push(1, 2, 3, '...', totalPages);
    } else if (safePage >= totalPages - 2) {
      pages.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, '...', safePage - 1, safePage, safePage + 1, '...', totalPages);
    }
    return pages;
  };

  const hasActiveFilters = search.trim() !== '' || statusFilter !== '';

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setCurrentPage(1);
  };

  
  const totalOffers    = offers.length;
  const draftCount     = offers.filter(o => (o.status || '').toLowerCase().includes('draft')).length;
  const approvedCount  = offers.filter(o => (o.status || '').toLowerCase().includes('approved')).length;
  const acceptedCount  = offers.filter(o => (o.status || '').toLowerCase().includes('accepted')).length;

  if (loading) {
    return (
      <div className="ol-loading">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="ol-page">

      <Breadcrumb items={[{ label: 'Offer Letters' }]} />

      {}
      <div className="ol-page-header">
        <div>
          <h4 className="ol-page-title">Offer Letters</h4>
          <p className="ol-page-subtitle">All offer letters in the system</p>
        </div>
        <button className="ol-btn-create" onClick={() => navigate('/sor/offers/new')}>
          <i className="bi bi-plus-circle"></i>
          New Offer
        </button>
      </div>

      {}
      <div className="ol-stats-grid">
        <div className="ol-stat-card ol-stat-total">
          <div className="ol-stat-icon">
            <i className="bi bi-file-earmark-text-fill"></i>
          </div>
          <div className="ol-stat-content">
            <div className="ol-stat-value">{totalOffers}</div>
            <div className="ol-stat-label">Total Offers</div>
          </div>
        </div>
        <div className="ol-stat-card ol-stat-draft">
          <div className="ol-stat-icon">
            <i className="bi bi-pencil-fill"></i>
          </div>
          <div className="ol-stat-content">
            <div className="ol-stat-value">{draftCount}</div>
            <div className="ol-stat-label">Draft</div>
          </div>
        </div>
        <div className="ol-stat-card ol-stat-approved">
          <div className="ol-stat-icon">
            <i className="bi bi-pencil-fill"></i>
          </div>
          <div className="ol-stat-content">
            <div className="ol-stat-value">{approvedCount}</div>
            <div className="ol-stat-label">Approved</div>
          </div>
        </div>
        <div className="ol-stat-card ol-stat-accepted">
          <div className="ol-stat-icon">
            <i className="bi bi-check-circle-fill"></i>
          </div>
          <div className="ol-stat-content">
            <div className="ol-stat-value">{acceptedCount}</div>
            <div className="ol-stat-label">Accepted</div>
          </div>
        </div>
      </div>

      {}
      <div className="ol-filter-bar">
        <div className="ol-search-wrapper">
          <span className="ol-search-icon">
            <i className="bi bi-search"></i>
          </span>
          <input
            className="ol-search-input"
            placeholder="Search by offer # or candidate..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          />
          {search && (
            <button
              className="ol-search-clear"
              onClick={() => { setSearch(''); setCurrentPage(1); }}
              title="Clear search"
            >
              <i className="bi bi-x-lg"></i>
            </button>
          )}
        </div>

        <div className="ol-status-wrapper">
          <select
            className="ol-status-select"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          >
            <option value="">All Statuses</option>
            {Object.entries(OFFER_STATUS_BADGE_CONFIG).map(([key, cfg]) => (
              <option key={key} value={key}>{cfg.label}</option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <button className="ol-btn-clear" onClick={clearFilters}>
            Clear Filters
          </button>
        )}

        <span className="ol-results-count">
          Showing {getPaginatedOffers().length} of {filtered.length} offers
        </span>
      </div>

      {}
      <div className="ol-table-card">

        {offers.length === 0 ? (
          <div className="ol-empty-state">
            <div className="ol-empty-content">
              <i className="bi bi-file-earmark-x"></i>
              <h4>No offers yet</h4>
              <p>Create your first offer letter to get started.</p>
              <button className="ol-btn-create" onClick={() => navigate('/sor/offers/new')}>
                <i className="bi bi-plus-circle"></i>
                New Offer
              </button>
            </div>
          </div>

        ) : filtered.length === 0 ? (
          <div className="ol-empty-state">
            <div className="ol-empty-content">
              <i className="bi bi-search"></i>
              <h4>No results found</h4>
              <p>No offers match your current filters. Try adjusting your search or status filter.</p>
              <button className="ol-btn-clear" onClick={clearFilters}>
                Clear Filters
              </button>
            </div>
          </div>

        ) : (
          <div className="ol-table-wrapper">
            <table className="ol-table">
              <thead>
                <tr>
                  <th>Offer #</th>
                  <th>Candidate</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Version</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {getPaginatedOffers().map((o) => (
                  <tr key={o.offerId}>
                    <td>
                      <span
                        className="ol-offer-link"
                        onClick={() => navigate(`/sor/offers/${o.offerId}`)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && navigate(`/sor/offers/${o.offerId}`)}
                      >
                        {o.offerNumber}
                      </span>
                    </td>
                    <td>
                      <div className="ol-candidate-info">
                        <div className="ol-candidate-avatar">
                          {getOfferInitials(o.candidateName)}
                        </div>
                        <span className="ol-candidate-name">{o.candidateName}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`ol-type-badge ${getTypeBadgeClass(o.offerType)}`}>
                        {o.offerType || '—'}
                      </span>
                    </td>
                    <td>
                      <span className={`ol-status-badge ${getStatusBadgeClass(o.status)}`}>
                        {OFFER_STATUS_BADGE_CONFIG[o.status]?.label ?? o.status ?? '—'}
                      </span>
                    </td>
                    <td>
                      <span className="ol-version-badge">v{o.version}</span>
                    </td>
                    <td className="ol-td-muted">{formatDate(o.createdAt)}</td>
                    <td>
                      <div className="ol-table-actions">

                        {}
                        <button
                          className="ol-action-view"
                          onClick={() => navigate(`/sor/offers/${o.offerId}`)}
                          title="View Offer"
                        >
                          <i className="bi bi-eye"></i>
                          View
                        </button>

                        {}
                        {canEditOffer(o.status) ? (
                          <button
                            className="ol-action-edit"
                            onClick={() => navigate(`/sor/offers/${o.offerId}/edit`)}
                            title="Edit Offer"
                          >
                            <i className="bi bi-pencil-square"></i>
                            Edit
                          </button>
                        ) : (
                          <button
                            className="ol-action-disabled"
                            disabled
                            title="Offer cannot be edited at this status"
                          >
                            <i className="bi bi-pencil-square"></i>
                            Edit
                          </button>
                        )}

                        {}
                        <button
                          className="ol-action-preview"
                          onClick={() => navigate(`/sor/offers/${o.offerId}/preview`)}
                          title="Preview Offer"
                        >
                          <i className="bi bi-file-earmark-richtext"></i>
                          Preview
                        </button>

                        {}
                        {canDownloadOffer(o.status, userRole) ? (
                          <button
                            className="ol-action-download"
                            onClick={() => downloadOffer(o.offerId, o.offerNumber)}
                            title="Download PDF"
                          >
                            <i className="bi bi-file-earmark-pdf"></i>
                            PDF
                          </button>
                        ) : (
                          <button
                            className="ol-action-disabled"
                            disabled
                            title="PDF download not available at this status or for your role"
                          >
                            <i className="bi bi-file-earmark-pdf"></i>
                            PDF
                          </button>
                        )}

                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {}
        <div className="ol-pagination">
          <div className="ol-pagination-info">
            <span>Show</span>
            <div ref={rowsDropdownRef} className="ol-rows-dropdown-wrapper">
              <button
                type="button"
                onClick={() => setShowRowsDropdown(!showRowsDropdown)}
                className="ol-rows-button"
              >
                <span>{rowsPerPage}</span>
                <i className={`bi bi-chevron-${showRowsDropdown ? 'up' : 'down'} ol-rows-chevron`}></i>
              </button>
              {showRowsDropdown && (
                <div className="ol-rows-dropdown">
                  {[5, 10, 25, 50].map((size) => (
                    <div
                      key={size}
                      onClick={() => { setRowsPerPage(size); setCurrentPage(1); setShowRowsDropdown(false); }}
                      className={`ol-rows-option ${rowsPerPage === size ? 'ol-rows-active' : ''}`}
                    >
                      {size}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <span>entries</span>
          </div>

          <div className="ol-pagination-status">
            {filtered.length === 0
              ? 'No entries'
              : `Showing ${(safePage - 1) * rowsPerPage + 1} to ${Math.min(safePage * rowsPerPage, filtered.length)} of ${filtered.length} entries`}
          </div>

          <nav className="ol-pagination-nav">
            <ul className="ol-pagination-list">
              <li className={`ol-page-item ${safePage === 1 ? 'disabled' : ''}`}>
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={safePage === 1}
                >
                  <i className="bi bi-chevron-left"></i>
                </button>
              </li>
              {getPageNumbers().map((page, index) => (
                <li
                  key={index}
                  className={`ol-page-item ${page === safePage ? 'active' : ''} ${typeof page !== 'number' ? 'disabled' : ''}`}
                >
                  <button
                    onClick={() => typeof page === 'number' && setCurrentPage(page)}
                    disabled={typeof page !== 'number'}
                  >
                    {page}
                  </button>
                </li>
              ))}
              <li className={`ol-page-item ${safePage === totalPages ? 'disabled' : ''}`}>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={safePage === totalPages}
                >
                  <i className="bi bi-chevron-right"></i>
                </button>
              </li>
            </ul>
          </nav>
        </div>

      </div>
    </div>
  );
};

export default OfferList;
