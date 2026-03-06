import React, { useState, useRef, useEffect } from 'react';
import useOfferTemplates from '../../../hooks/sor/useOfferTemplates';
import OfferTypeBadge from '../../../components/sor/common/OfferTypeBadge';
import Breadcrumb from '../../../components/common/Breadcrumb';
import AddTemplateModal from '../../../components/sor/Modal/templates/AddTemplateModal';
import EditTemplateModal from '../../../components/sor/Modal/templates/EditTemplateModal';
import DeleteTemplateModal from '../../../components/sor/Modal/templates/DeleteTemplateModal';
import '../../../styles/sor/pages/OfferTemplateList.css';




const getStatusBadgeClass = (status) => {
  const s = (status || '').toLowerCase().trim();
  if (s === 'default')  return 'otl-badge--default';
  if (s === 'active')   return 'otl-badge--active';
  if (s === 'inactive') return 'otl-badge--inactive';
  if (s === 'draft')    return 'otl-badge--draft';
  return 'otl-badge--fallback';
};

const getTypeInitials = (offerType) => {
  if (!offerType) return '?';
  const t = offerType.toString().toLowerCase();
  if (t.includes('intern'))   return 'IN';
  if (t.includes('full'))     return 'FT';
  if (t.includes('contract')) return 'CT';
  if (t.includes('part'))     return 'PT';
  return offerType.toString().substring(0, 2).toUpperCase();
};

const getAvatarClass = (offerType) => {
  const t = (offerType || '').toString().toLowerCase();
  if (t.includes('intern'))   return 'otl-avatar--teal';
  if (t.includes('full'))     return 'otl-avatar--navy';
  if (t.includes('contract')) return 'otl-avatar--amber';
  if (t.includes('part'))     return 'otl-avatar--purple';
  return 'otl-avatar--default';
};




const OfferTemplateList = () => {
  const { templates, loading, createTemplate, updateTemplate, deleteTemplate } = useOfferTemplates();

  const [showAdd,       setShowAdd]       = useState(false);
  const [editTarget,    setEditTarget]    = useState(null);
  const [deleteTarget,  setDeleteTarget]  = useState(null);
  const [search,        setSearch]        = useState('');
  const [statusFilter,  setStatusFilter]  = useState('');
  const [rowsPerPage,   setRowsPerPage]   = useState(10);
  const [currentPage,   setCurrentPage]   = useState(1);
  const [showRowsDrop,  setShowRowsDrop]  = useState(false);

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

  
  const filtered = templates.filter((t) => {
    const matchSearch = !search ||
      t.offerNumber?.toLowerCase().includes(search.toLowerCase()) ||
      t.offerType?.toString().toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || (t.status || '') === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / rowsPerPage) || 1;
  const safePage   = Math.min(currentPage, totalPages);

  const getPaginated = () => {
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

  
  const totalCount    = templates.length;
  const defaultCount  = templates.filter(t => (t.status || '').toLowerCase() === 'default').length;
  const activeCount   = templates.filter(t => (t.status || '').toLowerCase() === 'active').length;
  const internCount   = templates.filter(t =>
    (t.offerType || '').toString().toLowerCase().includes('intern')
  ).length;

  
  const handleEditClick = (t) => {
    if ((t.status || '').toLowerCase() === 'default') return;
    setEditTarget(t);
  };

  const handleDeleteClick = (t) => {
    if ((t.status || '').toLowerCase() === 'default') return;
    setDeleteTarget(t);
  };

  
  if (loading) {
    return (
      <div className="otl-loading-screen">
        <div className="otl-loading-spinner" role="status" aria-label="Loading" />
        <p className="otl-loading-text">Loading templates...</p>
      </div>
    );
  }

  return (
    <div className="otl-page">

      <Breadcrumb items={[{ label: 'Offer Templates' }]} />

      {}
      <div className="otl-page-header">
        <div>
          <h4 className="otl-page-title">Offer Templates</h4>
          <p className="otl-page-subtitle">Reusable offer letter templates</p>
        </div>
        <button className="otl-btn-create" onClick={() => setShowAdd(true)}>
          <i className="bi bi-plus-circle"></i>
          New Template
        </button>
      </div>

      {}
      <div className="otl-stats-grid">
        <div className="otl-stat-card otl-stat-total">
          <div className="otl-stat-icon">
            <i className="bi bi-file-earmark-ruled-fill"></i>
          </div>
          <div className="otl-stat-content">
            <div className="otl-stat-value">{totalCount}</div>
            <div className="otl-stat-label">Total Templates</div>
          </div>
        </div>

        <div className="otl-stat-card otl-stat-default">
          <div className="otl-stat-icon">
            <i className="bi bi-shield-fill-check"></i>
          </div>
          <div className="otl-stat-content">
            <div className="otl-stat-value">{defaultCount}</div>
            <div className="otl-stat-label">System Default</div>
          </div>
        </div>

        <div className="otl-stat-card otl-stat-active">
          <div className="otl-stat-icon">
            <i className="bi bi-check-circle-fill"></i>
          </div>
          <div className="otl-stat-content">
            <div className="otl-stat-value">{activeCount}</div>
            <div className="otl-stat-label">Active</div>
          </div>
        </div>

        <div className="otl-stat-card otl-stat-intern">
          <div className="otl-stat-icon">
            <i className="bi bi-mortarboard-fill"></i>
          </div>
          <div className="otl-stat-content">
            <div className="otl-stat-value">{internCount}</div>
            <div className="otl-stat-label">Internship</div>
          </div>
        </div>
      </div>

      {}
      <div className="otl-filter-bar">
        <div className="otl-search-wrapper">
          <span className="otl-search-icon">
            <i className="bi bi-search"></i>
          </span>
          <input
            className="otl-search-input"
            placeholder="Search by template name or type..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          />
          {search && (
            <button
              className="otl-search-clear"
              onClick={() => { setSearch(''); setCurrentPage(1); }}
              title="Clear search"
            >
              <i className="bi bi-x-lg"></i>
            </button>
          )}
        </div>

        <div className="otl-status-wrapper">
          <select
            className="otl-status-select"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          >
            <option value="">All Statuses</option>
            <option value="Default">Default</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Draft">Draft</option>
          </select>
        </div>

        {hasActiveFilters && (
          <button className="otl-btn-clear" onClick={clearFilters}>
            Clear Filters
          </button>
        )}

        <span className="otl-results-count">
          Showing {getPaginated().length} of {filtered.length} templates
        </span>
      </div>

      {}
      <div className="otl-table-card">

        {templates.length === 0 ? (
          <div className="otl-empty-state">
            <div className="otl-empty-content">
              <i className="bi bi-file-earmark-x"></i>
              <h4>No templates yet</h4>
              <p>Create your first offer template to get started.</p>
              <button className="otl-btn-create" onClick={() => setShowAdd(true)}>
                <i className="bi bi-plus-circle"></i>
                New Template
              </button>
            </div>
          </div>

        ) : filtered.length === 0 ? (
          <div className="otl-empty-state">
            <div className="otl-empty-content">
              <i className="bi bi-search"></i>
              <h4>No results found</h4>
              <p>No templates match your current filters. Try adjusting your search.</p>
              <button className="otl-btn-clear" onClick={clearFilters}>
                Clear Filters
              </button>
            </div>
          </div>

        ) : (
          <div className="otl-table-wrapper">
            <table className="otl-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Template Name</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Version</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {getPaginated().map((t, idx) => {
                  const isDefault  = (t.status || '').toLowerCase() === 'default';
                  const rowIndex   = (safePage - 1) * rowsPerPage + idx + 1;

                  return (
                    <tr key={t.offerId ?? t.templateId ?? idx}>
                      <td className="otl-td-muted otl-td-index">{rowIndex}</td>

                      <td>
                        <div className="otl-template-info">
                          <div className={`otl-avatar ${getAvatarClass(t.offerType)}`}>
                            {getTypeInitials(t.offerType)}
                          </div>
                          <div className="otl-template-meta">
                            <span className="otl-template-name">{t.offerNumber || t.templateName || '—'}</span>
                            {isDefault && (
                              <span className="otl-system-tag">
                                <i className="bi bi-lock-fill"></i>
                                System
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td>
                        <OfferTypeBadge offerType={t.offerType} />
                      </td>

                      <td>
                        <span className={`otl-status-badge ${getStatusBadgeClass(t.status)}`}>
                          {t.status || '—'}
                        </span>
                      </td>

                      <td>
                        <span className="otl-version-badge">v{t.version ?? 1}</span>
                      </td>

                      <td>
                        <div className="otl-table-actions">
                          {}
                          {!isDefault ? (
                            <button
                              className="otl-action-edit"
                              onClick={() => handleEditClick(t)}
                              title="Edit Template"
                            >
                              <i className="bi bi-pencil-square"></i>
                              Edit
                            </button>
                          ) : (
                            <button
                              className="otl-action-disabled"
                              disabled
                              title="System default templates cannot be edited"
                            >
                              <i className="bi bi-pencil-square"></i>
                              Edit
                            </button>
                          )}

                          {}
                          {!isDefault ? (
                            <button
                              className="otl-action-delete"
                              onClick={() => handleDeleteClick(t)}
                              title="Delete Template"
                            >
                              <i className="bi bi-trash3"></i>
                              Delete
                            </button>
                          ) : (
                            <button
                              className="otl-action-disabled"
                              disabled
                              title="System default templates cannot be deleted"
                            >
                              <i className="bi bi-trash3"></i>
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {}
        <div className="otl-pagination">
          <div className="otl-pagination-info">
            <span>Show</span>
            <div ref={rowsDropRef} className="otl-rows-dropdown-wrapper">
              <button
                type="button"
                className="otl-rows-button"
                onClick={() => setShowRowsDrop(!showRowsDrop)}
              >
                <span>{rowsPerPage}</span>
                <i className={`bi bi-chevron-${showRowsDrop ? 'up' : 'down'} otl-rows-chevron`}></i>
              </button>
              {showRowsDrop && (
                <div className="otl-rows-dropdown">
                  {[5, 10, 25, 50].map((size) => (
                    <div
                      key={size}
                      className={`otl-rows-option ${rowsPerPage === size ? 'otl-rows-active' : ''}`}
                      onClick={() => {
                        setRowsPerPage(size);
                        setCurrentPage(1);
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

          <div className="otl-pagination-status">
            {filtered.length === 0
              ? 'No entries'
              : `Showing ${(safePage - 1) * rowsPerPage + 1} to ${Math.min(safePage * rowsPerPage, filtered.length)} of ${filtered.length} entries`}
          </div>

          <nav className="otl-pagination-nav">
            <ul className="otl-pagination-list">
              <li className={`otl-page-item ${safePage === 1 ? 'disabled' : ''}`}>
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={safePage === 1}
                >
                  <i className="bi bi-chevron-left"></i>
                </button>
              </li>
              {getPageNumbers().map((page, index) => (
                <li
                  key={index}
                  className={`otl-page-item ${page === safePage ? 'active' : ''} ${typeof page !== 'number' ? 'disabled' : ''}`}
                >
                  <button
                    onClick={() => typeof page === 'number' && setCurrentPage(page)}
                    disabled={typeof page !== 'number'}
                  >
                    {page}
                  </button>
                </li>
              ))}
              <li className={`otl-page-item ${safePage === totalPages ? 'disabled' : ''}`}>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={safePage === totalPages}
                >
                  <i className="bi bi-chevron-right"></i>
                </button>
              </li>
            </ul>
          </nav>
        </div>

        {}
        {templates.some(t => (t.status || '').toLowerCase() === 'default') && (
          <div className="otl-footer-note">
            <i className="bi bi-info-circle"></i>
            System default templates cannot be edited or deleted.
          </div>
        )}

      </div>

      {}
      <AddTemplateModal
        show={showAdd}
        onClose={() => setShowAdd(false)}
        onCreate={createTemplate}
      />
      <EditTemplateModal
        show={!!editTarget}
        onClose={() => setEditTarget(null)}
        template={editTarget}
        onUpdate={updateTemplate}
      />
      <DeleteTemplateModal
        show={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        template={deleteTarget}
        onDelete={deleteTemplate}
      />

    </div>
  );
};

export default OfferTemplateList;
