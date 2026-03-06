import React, { useState } from 'react';

const DeleteTemplateModal = ({ show, onClose, template, onDelete }) => {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    const ok = await onDelete(template.offerId);
    setLoading(false);
    if (ok) onClose();
  };

  if (!show || !template) return null;

  return (
    <>
      <div className="modal-backdrop fade show" />
      <div className="modal fade show d-block" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered modal-sm">
          <div className="modal-content">
            <div className="modal-header border-0">
              <h5 className="modal-title text-danger">🗑️ Delete Template</h5>
              <button type="button" className="btn-close" onClick={onClose} />
            </div>
            <div className="modal-body text-center">
              <p>Delete <strong>{template.offerNumber}</strong>?</p>
              <p className="text-danger small">This cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>Cancel</button>
              <button type="button" className="btn btn-danger btn-sm" onClick={handleConfirm} disabled={loading}>
                {loading && <span className="spinner-border spinner-border-sm me-1" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DeleteTemplateModal;
