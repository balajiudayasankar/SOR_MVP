import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useCandidates from '../../../hooks/sor/useCandidates';
import useOffers from '../../../hooks/sor/useOffers';
import Breadcrumb from '../../../components/common/Breadcrumb';
import AddCandidateModal from '../../../components/sor/Modal/candidates/AddCandidateModal';
import EditCandidateModal from '../../../components/sor/Modal/candidates/EditCandidateModal';
import MoveToOfferStageModal from '../../../components/sor/Modal/candidates/MoveToOfferStageModal';
import CreateOfferModal from '../../../components/sor/Modal/offers/CreateOfferModal';
import { CANDIDATE_STAGE_OPTIONS } from '../../../constants/sor/candidateStages';
import { canMoveToOfferStage, canCreateOffer } from '../../../utils/sor/candidateHelpers';
import '../../../styles/sor/pages/CandidateList.css';

const getStageBadgeClass = (stage) => {
  const s = (stage || '').toLowerCase();
  if (s.includes('offer'))     return 'cl-badge-offer';
  if (s.includes('interview')) return 'cl-badge-interview';
  if (s.includes('hired'))     return 'cl-badge-hired';
  if (s.includes('reject'))    return 'cl-badge-rejected';
  if (s.includes('screen'))    return 'cl-badge-screening';
  return 'cl-badge-applied';
};

const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const CandidateList = () => {
  const navigate = useNavigate();
  const {
    candidates, loading, selectedStage, setSelectedStage,
    createCandidate, updateCandidate, moveToOfferStage,
  } = useCandidates();
  const { createOffer } = useOffers();

  const [search, setSearch]                     = useState('');
  const [showAdd, setShowAdd]                   = useState(false);
  const [editTarget, setEditTarget]             = useState(null);
  const [moveTarget, setMoveTarget]             = useState(null);
  const [offerTarget, setOfferTarget]           = useState(null);
  const [isCreatingOffer, setIsCreatingOffer]   = useState(false);
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

  const filtered = candidates.filter((c) =>
    c.candidateName?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / rowsPerPage) || 1;
  const safePage   = Math.min(currentPage, totalPages);

  const getPaginatedCandidates = () => {
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

  const hasActiveFilters = search.trim() !== '' || selectedStage !== '';

  const clearFilters = () => {
    setSearch('');
    setSelectedStage('');
    setCurrentPage(1);
  };

  const handleCreateOffer = async (data) => {
    if (isCreatingOffer) return false;
    setIsCreatingOffer(true);
    try {
      const offer = await createOffer(data);
      if (offer) {
        navigate(`/sor/offers/${offer.offerId}/edit`);
        return true;
      }
      return false;
    } finally {
      setIsCreatingOffer(false);
    }
  };

  
  const totalCandidates = candidates.length;
  const offerStageCount = candidates.filter(c => (c.currentStage || '').toLowerCase().includes('offer')).length;
  const interviewCount  = candidates.filter(c => (c.currentStage || '').toLowerCase().includes('interview')).length;
  const newCount        = candidates.filter(c => {
    if (!c.createdAt) return false;
    const ago = new Date();
    ago.setDate(ago.getDate() - 30);
    return new Date(c.createdAt) > ago;
  }).length;

  if (loading) {
    return (
      <div className="cl-loading">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="cl-page">

      <Breadcrumb items={[{ label: 'Candidates' }]} />

      {}
      <div className="cl-page-header">
        <div>
          <h4 className="cl-page-title">Candidates</h4>
          <p className="cl-page-subtitle">Manage hiring pipeline candidates</p>
        </div>
        <button className="cl-btn-create" onClick={() => setShowAdd(true)}>
          <i className="bi bi-plus-circle"></i>
          Add Candidate
        </button>
      </div>

      {}
      <div className="cl-stats-grid">
        <div className="cl-stat-card cl-stat-total">
          <div className="cl-stat-icon">
            <i className="bi bi-people-fill"></i>
          </div>
          <div className="cl-stat-content">
            <div className="cl-stat-value">{totalCandidates}</div>
            <div className="cl-stat-label">Total Candidates</div>
          </div>
        </div>
        <div className="cl-stat-card cl-stat-offer">
          <div className="cl-stat-icon">
            <i className="bi bi-file-earmark-check-fill"></i>
          </div>
          <div className="cl-stat-content">
            <div className="cl-stat-value">{offerStageCount}</div>
            <div className="cl-stat-label">Offer Stage</div>
          </div>
        </div>
        <div className="cl-stat-card cl-stat-interview">
          <div className="cl-stat-icon">
            <i className="bi bi-camera-video-fill"></i>
          </div>
          <div className="cl-stat-content">
            <div className="cl-stat-value">{interviewCount}</div>
            <div className="cl-stat-label">In Interview</div>
          </div>
        </div>
        <div className="cl-stat-card cl-stat-new">
          <div className="cl-stat-icon">
            <i className="bi bi-person-plus-fill"></i>
          </div>
          <div className="cl-stat-content">
            <div className="cl-stat-value">{newCount}</div>
            <div className="cl-stat-label">New (Last 30 Days)</div>
          </div>
        </div>
      </div>

      {}
      <div className="cl-filter-bar">
        <div className="cl-search-wrapper">
          <span className="cl-search-icon">
            <i className="bi bi-search"></i>
          </span>
          <input
            className="cl-search-input"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          />
          {search && (
            <button
              className="cl-search-clear"
              onClick={() => { setSearch(''); setCurrentPage(1); }}
              title="Clear search"
            >
              <i className="bi bi-x-lg"></i>
            </button>
          )}
        </div>

        <div className="cl-stage-wrapper">
          <select
            className="cl-stage-select"
            value={selectedStage}
            onChange={(e) => { setSelectedStage(e.target.value); setCurrentPage(1); }}
          >
            {CANDIDATE_STAGE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <button className="cl-btn-clear" onClick={clearFilters}>
            Clear Filters
          </button>
        )}

        <span className="cl-results-count">
          Showing {getPaginatedCandidates().length} of {filtered.length} candidates
        </span>
      </div>

      {}
      <div className="cl-table-card">

        {candidates.length === 0 ? (
          <div className="cl-empty-state">
            <div className="cl-empty-content">
              <i className="bi bi-person-x"></i>
              <h4>No candidates yet</h4>
              <p>Start building your hiring pipeline by adding the first candidate.</p>
              <button className="cl-btn-create" onClick={() => setShowAdd(true)}>
                <i className="bi bi-plus-circle"></i>
                Add First Candidate
              </button>
            </div>
          </div>

        ) : filtered.length === 0 ? (
          <div className="cl-empty-state">
            <div className="cl-empty-content">
              <i className="bi bi-search"></i>
              <h4>No results found</h4>
              <p>No candidates match your current filters. Try adjusting your search or stage filter.</p>
              <button className="cl-btn-clear" onClick={clearFilters}>
                Clear Filters
              </button>
            </div>
          </div>

        ) : (
          <div className="cl-table-wrapper">
            <table className="cl-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Stage</th>
                  <th>Added</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {getPaginatedCandidates().map((c, idx) => (
                  <tr key={c.candidateId}>
                    <td className="cl-td-muted">{(safePage - 1) * rowsPerPage + idx + 1}</td>
                    <td>
                      <div className="cl-candidate-info">
                        <div className="cl-candidate-avatar">
                          {getInitials(c.candidateName)}
                        </div>
                        <span
                          className="cl-candidate-link"
                          onClick={() => navigate(`/sor/candidates/${c.candidateId}`)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => e.key === 'Enter' && navigate(`/sor/candidates/${c.candidateId}`)}
                        >
                          {c.candidateName}
                        </span>
                      </div>
                    </td>
                    <td className="cl-td-muted">{c.email}</td>
                    <td className="cl-td-muted">{c.phone || '—'}</td>
                    <td>
                      <span className={`cl-stage-badge ${getStageBadgeClass(c.currentStage)}`}>
                        {c.currentStage || 'Unknown'}
                      </span>
                    </td>
                    <td className="cl-td-muted">
                      {c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-IN') : '—'}
                    </td>
                    <td>
                      <div className="cl-table-actions">

                        {}
                        <button
                          className="cl-action-edit"
                          onClick={() => setEditTarget(c)}
                          title="Edit Candidate"
                        >
                          <i className="bi bi-pencil-square"></i>
                        </button>

                        {}
                        {canMoveToOfferStage(c.currentStage) ? (
                          <button
                            className="cl-action-move"
                            onClick={() => setMoveTarget(c)}
                            title="Move to Offer Stage"
                          >
                            <i className="bi bi-arrow-right-circle"></i>
                            Move
                          </button>
                        ) : (
                          <button
                            className="cl-action-disabled"
                            disabled
                            title="Not eligible to move to Offer Stage at current stage"
                          >
                            <i className="bi bi-arrow-right-circle"></i>
                            Move
                          </button>
                        )}

                        {}
                        {canCreateOffer(c.currentStage) ? (
                          <button
                            className="cl-action-offer"
                            onClick={() => setOfferTarget(c)}
                            disabled={isCreatingOffer}
                            title="Create Offer"
                          >
                            <i className="bi bi-file-earmark-text"></i>
                            Offer
                          </button>
                        ) : (
                          <button
                            className="cl-action-disabled"
                            disabled
                            title="Candidate must reach Offer Stage before creating an offer"
                          >
                            <i className="bi bi-file-earmark-text"></i>
                            Offer
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
        <div className="cl-pagination">
          <div className="cl-pagination-info">
            <span>Show</span>
            <div ref={rowsDropdownRef} className="cl-rows-dropdown-wrapper">
              <button
                type="button"
                onClick={() => setShowRowsDropdown(!showRowsDropdown)}
                className="cl-rows-button"
              >
                <span>{rowsPerPage}</span>
                <i className={`bi bi-chevron-${showRowsDropdown ? 'up' : 'down'} cl-rows-chevron`}></i>
              </button>
              {showRowsDropdown && (
                <div className="cl-rows-dropdown">
                  {[5, 10, 25, 50].map((size) => (
                    <div
                      key={size}
                      onClick={() => { setRowsPerPage(size); setCurrentPage(1); setShowRowsDropdown(false); }}
                      className={`cl-rows-option ${rowsPerPage === size ? 'cl-rows-active' : ''}`}
                    >
                      {size}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <span>entries</span>
          </div>

          <div className="cl-pagination-status">
            {filtered.length === 0
              ? 'No entries'
              : `Showing ${(safePage - 1) * rowsPerPage + 1} to ${Math.min(safePage * rowsPerPage, filtered.length)} of ${filtered.length} entries`}
          </div>

          <nav className="cl-pagination-nav">
            <ul className="cl-pagination-list">
              <li className={`cl-page-item ${safePage === 1 ? 'disabled' : ''}`}>
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
                  className={`cl-page-item ${page === safePage ? 'active' : ''} ${typeof page !== 'number' ? 'disabled' : ''}`}
                >
                  <button
                    onClick={() => typeof page === 'number' && setCurrentPage(page)}
                    disabled={typeof page !== 'number'}
                  >
                    {page}
                  </button>
                </li>
              ))}
              <li className={`cl-page-item ${safePage === totalPages ? 'disabled' : ''}`}>
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

      {}
      <AddCandidateModal
        show={showAdd}
        onClose={() => setShowAdd(false)}
        onCreate={createCandidate}
      />
      <EditCandidateModal
        show={!!editTarget}
        onClose={() => setEditTarget(null)}
        candidate={editTarget}
        onUpdate={updateCandidate}
      />
      <MoveToOfferStageModal
        show={!!moveTarget}
        onClose={() => setMoveTarget(null)}
        candidate={moveTarget}
        onMove={moveToOfferStage}
      />
      <CreateOfferModal
        show={!!offerTarget}
        onClose={() => setOfferTarget(null)}
        candidate={offerTarget}
        onCreateOffer={handleCreateOffer}
      />
    </div>
  );
};

export default CandidateList;
