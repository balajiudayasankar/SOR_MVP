import React, { useState, useEffect } from 'react';
import { OFFER_TYPE_OPTIONS } from '../../../../constants/sor/offerTypes';

const EditTemplateModal = ({ show, onClose, template, onUpdate }) => {
  const [form, setForm]       = useState({
    templateName: '',
    offerType:    1,
    htmlContent:  '',
    isDefault:    false,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (template) {
      setForm({
        
        templateName: template.offerNumber   || template.templateName || '',
        offerType:    template.offerType === 'Internship' ? 1
                    : template.offerType === 'FullTime'   ? 2
                    : Number(template.offerType)          || 1,
        htmlContent:  template.htmlContent   || '',
        isDefault:    template.isDefault     ?? false,
      });
    }
  }, [template]);

  const handle = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const payload = {
      templateName: form.templateName,
      offerType:    Number(form.offerType),
      htmlContent:  form.htmlContent,
      isDefault:    form.isDefault,
    };
    const ok = await onUpdate(template.offerId ?? template.offerTemplateId, payload);
    setLoading(false);
    if (ok) onClose();
  };

  if (!show || !template) return null;

  return (
    <>
      <div className="modal-backdrop fade show" />
      <div className="modal fade show d-block" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Edit Template</h5>
              <button type="button" className="btn-close" onClick={onClose} />
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">

                {}
                <div className="mb-3">
                  <label className="form-label">
                    Template Name <span className="text-danger">*</span>
                  </label>
                  <input
                    className="form-control"
                    name="templateName"
                    value={form.templateName}
                    onChange={handle}
                    required
                  />
                </div>

                {}
                <div className="mb-3">
                  <label className="form-label">Offer Type</label>
                  <select
                    className="form-select"
                    name="offerType"
                    value={form.offerType}
                    onChange={handle}>
                    {OFFER_TYPE_OPTIONS.map((o) => (
                      
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>

                {}
                <div className="mb-3">
                  <label className="form-label">
                    HTML Content <span className="text-danger">*</span>
                  </label>
                  <textarea
                    className="form-control font-monospace"
                    name="htmlContent"
                    value={form.htmlContent}
                    onChange={handle}
                    required
                    rows={10}
                    style={{ fontSize: '12px' }}
                  />
                  <div className="form-text">
                    Use placeholders like <code>{'{{CandidateName}}'}</code>,{' '}
                    <code>{'{{Designation}}'}</code>, <code>{'{{JoiningDate}}'}</code> etc.
                  </div>
                </div>

                {}
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="isDefaultEdit"
                    name="isDefault"
                    checked={form.isDefault}
                    onChange={handle}
                  />
                  <label className="form-check-label" htmlFor="isDefaultEdit">
                    Set as Default Template for this Offer Type
                  </label>
                </div>

              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}>
                  {loading && <span className="spinner-border spinner-border-sm me-2" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditTemplateModal;
