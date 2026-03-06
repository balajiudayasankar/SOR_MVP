import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import offerService from '../../../services/sor/offerService';
import CommonDetailsForm from '../../../components/sor/forms/CommonDetailsForm';
import InternshipDetailsForm from '../../../components/sor/forms/InternshipDetailsForm';
import FullTimeDetailsForm from '../../../components/sor/forms/FullTimeDetailsForm';
import SubmitForApprovalModal from '../../../components/sor/Modal/offers/SubmitForApprovalModal';
import OfferStatusBadge from '../../../components/sor/common/OfferStatusBadge';
import OfferTypeBadge from '../../../components/sor/common/OfferTypeBadge';
import { canEditOffer } from '../../../utils/sor/offerHelpers';
import useOffers from '../../../hooks/sor/useOffers';
import '../../../styles/sor/pages/OfferDetailsForm.css';



const emptyCommon = {
  candidateName: '', candidateEmail: '', candidatePhone: '', candidateAddress: '',
  designation: '', department: '', workLocation: '', reportingManager: '',
  offerIssueDate: '', joiningDate: '', workingDays: 'Monday to Friday',
  workingHours: '9:00 AM - 6:00 PM', weeklyHours: 40,
  companyName: 'Relevantz Technology Services', hrContactName: '', hrEmail: '',
  hrPhone: '', signatoryName: '', signatoryDesignation: '',
  signatorySignatureImagePath: '', confidentialityClause: true, companyPolicyText: '',
};

const emptyInternship = {
  internshipStartDate: '', internshipEndDate: '', durationMonths: 3,
  stipendAmount: 0, payFrequency: 1, paymentTiming: 'Last working day of every month',
  trainingLocation: '', trainingInstitution: 'Relevantz Technology Services',
  trainingDuration: '', trainingWorkingDays: 'Monday to Friday',
  requiredDocuments: '', insuranceEnabled: false, insuranceAmount: 0,
  otherBenefits: '', fullTimeSalaryAfterInternship: 0,
  joiningBonus: 0, retentionBonus: 0, serviceAgreementDurationMonths: 0,
  serviceAgreementPeriod: 'N/A', certificateRetentionTerms: '',
  breakageCharges: 0, accommodationAvailable: false, accommodationCost: 0,
};

const emptyFullTime = {
  employmentType: 1, annualCtc: 0, basicSalary: 0, hra: 0,
  allowances: 0, bonusOrVariablePay: 0, joiningBonus: 0, esopDetails: '',
  probationPeriod: '90 days from date of joining',
  confirmationTerms: '', pfEligibility: true, gratuityEligibility: true,
  insurancePlan: '', leaveEntitlement: '', otherBenefits: '',
  noticePeriod: '', backgroundVerificationRequired: true, nonCompeteEnabled: false,
};


const sanitizeInternship = (d) => ({
  ...d,
  payFrequency:                   Number(d.payFrequency                   ?? 1),
  durationMonths:                 Number(d.durationMonths                 ?? 0),
  stipendAmount:                  Number(d.stipendAmount                  ?? 0),
  joiningBonus:                   Number(d.joiningBonus                   ?? 0),
  retentionBonus:                 Number(d.retentionBonus                 ?? 0),
  fullTimeSalaryAfterInternship:  Number(d.fullTimeSalaryAfterInternship  ?? 0),
  insuranceAmount:                Number(d.insuranceAmount                ?? 0),
  serviceAgreementDurationMonths: Number(d.serviceAgreementDurationMonths ?? 0),
  breakageCharges:                Number(d.breakageCharges                ?? 0),
  accommodationCost:              Number(d.accommodationCost              ?? 0),
});

const sanitizeFullTime = (d) => ({
  ...d,
  employmentType:     Number(d.employmentType     ?? 1),
  annualCtc:          Number(d.annualCtc           ?? 0),
  basicSalary:        Number(d.basicSalary         ?? 0),
  hra:                Number(d.hra                 ?? 0),
  allowances:         Number(d.allowances          ?? 0),
  bonusOrVariablePay: Number(d.bonusOrVariablePay  ?? 0),
  joiningBonus:       Number(d.joiningBonus        ?? 0),
});

const getErrMsg = (e) =>
  e?.response?.data?.message ||
  e?.response?.data?.title   ||
  e?.message                 ||
  'An unexpected error occurred.';



const OfferDetailsForm = () => {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { submitForApproval, saveAsDraft } = useOffers();

  const [offer,         setOffer]         = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [saving,        setSaving]        = useState(false);
  const [submitting,    setSubmitting]    = useState(false);
  const [commonDetails, setCommonDetails] = useState(emptyCommon);
  const [typeDetails,   setTypeDetails]   = useState(null);
  const [showSubmit,    setShowSubmit]    = useState(false);
  const [activeTab,     setActiveTab]     = useState('common');
  const [isDirty,       setIsDirty]       = useState(false);

  const originalCommon = useRef(null);
  const originalType   = useRef(null);

  const fetchOffer = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await offerService.getOfferById(id);
      const data = res.data;
      setOffer(data);

      const common = data.commonDetails
        ? { ...emptyCommon, ...data.commonDetails }
        : { ...emptyCommon };
      setCommonDetails(common);
      originalCommon.current = common;

      let type;
      if (data.internshipDetails) {
        type = { ...emptyInternship, ...data.internshipDetails, payFrequency: data.internshipDetails.payFrequency ?? 1 };
      } else if (data.fullTimeDetails) {
        type = { ...emptyFullTime, ...data.fullTimeDetails, employmentType: data.fullTimeDetails.employmentType ?? 1 };
      } else {
        const isIntern = data.offerType === 'Internship' || data.offerType === 1;
        type = isIntern ? { ...emptyInternship } : { ...emptyFullTime };
      }
      setTypeDetails(type);
      originalType.current = type;
      setIsDirty(false);
    } catch (e) {
      toast.error(getErrMsg(e));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchOffer(); }, [fetchOffer]);

  const handleCommonChange = useCallback((data) => { setCommonDetails(data); setIsDirty(true); }, []);
  const handleTypeChange   = useCallback((data) => { setTypeDetails(data);   setIsDirty(true); }, []);

  const isInternship = offer?.offerType === 'Internship' || offer?.offerType === 1;

  const buildPayload = () => {
    const internship = isInternship && typeDetails ? sanitizeInternship(typeDetails) : null;
    const fullTime   = !isInternship && typeDetails ? sanitizeFullTime(typeDetails)   : null;
    return { commonDetails, internshipDetails: internship, fullTimeDetails: fullTime };
  };

  const validateCommon = () => {
    const required = [
      ['candidateName',  'Candidate Name'],
      ['candidateEmail', 'Candidate Email'],
      ['designation',    'Designation'],
      ['department',     'Department'],
      ['offerIssueDate', 'Offer Issue Date'],
      ['joiningDate',    'Joining Date'],
    ];
    const missing = required
      .filter(([k]) => !commonDetails[k]?.toString().trim())
      .map(([, label]) => label);

    if (missing.length > 0) {
      toast.error(`Please fill required fields: ${missing.join(', ')}`);
      setActiveTab('common');
      return false;
    }
    return true;
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      await offerService.updateOfferDetails(id, buildPayload());
      await saveAsDraft(id);
      setIsDirty(false);
      toast.success('Draft saved successfully!');
    } catch (e) {
      toast.error(getErrMsg(e));
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndPreview = async () => {
    if (!validateCommon()) return;
    setSaving(true);
    try {
      await offerService.updateOfferDetails(id, buildPayload());
      setIsDirty(false);
      toast.success('Details saved!');
      navigate(`/sor/offers/${id}/preview`);
    } catch (e) {
      toast.error(getErrMsg(e));
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (submitData) => {
    if (!validateCommon()) return false;
    setSubmitting(true);
    try {
      await offerService.updateOfferDetails(id, buildPayload());
      const ok = await submitForApproval(submitData);
      if (ok) {
        setIsDirty(false);
        navigate(`/sor/offers/${id}`);
        return true;
      }
      return false;
    } catch (e) {
      toast.error(getErrMsg(e));
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    if (isDirty) {
      if (!window.confirm('You have unsaved changes. Leave without saving?')) return;
    }
    navigate(`/sor/offers/${id}`);
  };

  const isBusy     = saving || submitting;
  const isEditable = canEditOffer(offer?.status);

  const tabs = [
    {
      key:   'common',
      label: 'Common Details',
      icon:  'bi-person-lines-fill',
      desc:  'Candidate & company info',
      step:  1,
    },
    {
      key:   'type',
      label: isInternship ? 'Internship Details' : 'Full-Time Details',
      icon:  isInternship ? 'bi-mortarboard-fill' : 'bi-briefcase-fill',
      desc:  isInternship ? 'Stipend, duration & terms' : 'CTC, benefits & terms',
      step:  2,
    },
  ];

  const activeTabMeta = tabs.find((t) => t.key === activeTab);

  
  if (loading) {
    return (
      <div className="odf-loading-screen">
        <div className="odf-loading-spinner" role="status" aria-label="Loading" />
        <p className="odf-loading-text">Loading offer details...</p>
      </div>
    );
  }

  
  if (!offer) {
    return (
      <div className="odf-not-found">
        <div className="odf-not-found__icon">
          <i className="bi bi-exclamation-triangle"></i>
        </div>
        <h5 className="odf-not-found__title">Offer Not Found</h5>
        <p className="odf-not-found__desc">
          This offer does not exist or you do not have access.
        </p>
        <button className="odf-btn odf-btn--outline" onClick={() => navigate('/sor/offers')}>
          <i className="bi bi-arrow-left"></i>
          Back to Offers
        </button>
      </div>
    );
  }

  return (
    <div className="odf-root">

      {}
      <div className="odf-header-card">
        <div className="odf-header-card__left">
          <button className="odf-btn-back" onClick={handleBack} aria-label="Back">
            <i className="bi bi-arrow-left"></i>
            <span>Back</span>
          </button>

          <div className="odf-header-v-divider" />

          <div className="odf-header-title-block">
            <h4 className="odf-offer-number">{offer.offerNumber}</h4>
            <div className="odf-badge-row">
              <OfferTypeBadge offerType={offer.offerType} />
              <OfferStatusBadge status={offer.status} />
              <span className="odf-version-pill">v{offer.version}</span>
              {isDirty && (
                <span className="odf-unsaved-pill">
                  <span className="odf-unsaved-dot" />
                  Unsaved changes
                </span>
              )}
            </div>
          </div>
        </div>

        {isEditable && (
          <div className="odf-header-card__actions">
            <button
              className="odf-btn odf-btn--ghost"
              onClick={handleSaveDraft}
              disabled={isBusy}
            >
              {saving ? (
                <><span className="odf-btn-spinner" />Saving...</>
              ) : (
                <><i className="bi bi-floppy"></i>Save Draft</>
              )}
            </button>

            <button
              className="odf-btn odf-btn--teal"
              onClick={handleSaveAndPreview}
              disabled={isBusy}
            >
              <i className="bi bi-eye"></i>
              Preview
            </button>

            <button
              className="odf-btn odf-btn--primary"
              onClick={() => setShowSubmit(true)}
              disabled={isBusy}
            >
              {submitting ? (
                <><span className="odf-btn-spinner" />Submitting...</>
              ) : (
                <><i className="bi bi-send-check"></i>Submit for Approval</>
              )}
            </button>
          </div>
        )}
      </div>

      {}
      {!isEditable && (
        <div className="odf-readonly-banner" role="alert">
          <i className="bi bi-lock-fill"></i>
          <span>
            This offer is <strong>{offer.status}</strong> and is currently read-only.
          </span>
        </div>
      )}

      {}
      <div className="odf-layout">

        {}
        <aside className="odf-sidebar">
          <div className="odf-sidebar__heading">Form Sections</div>

          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                className={`odf-sidenav-item ${isActive ? 'odf-sidenav-item--active' : ''}`}
                onClick={() => setActiveTab(tab.key)}
              >
                <div className={`odf-sidenav-step ${isActive ? 'odf-sidenav-step--active' : ''}`}>
                  {tab.step}
                </div>
                <div className="odf-sidenav-body">
                  <div className="odf-sidenav-icon-row">
                    <i className={`bi ${tab.icon} odf-sidenav-icon`}></i>
                    <span className="odf-sidenav-label">{tab.label}</span>
                  </div>
                  <span className="odf-sidenav-desc">{tab.desc}</span>
                </div>
                {isActive && (
                  <i className="bi bi-chevron-right odf-sidenav-arrow"></i>
                )}
              </button>
            );
          })}

          <div className="odf-sidebar-info-card">
            <i className="bi bi-info-circle odf-sidebar-info-card__icon"></i>
            <span>Fill both sections before submitting for approval.</span>
          </div>
        </aside>

        {}
        <main className="odf-content-panel">

          {}
          <div className="odf-content-header">
            <div className="odf-content-header__left">
              <div className="odf-content-header__icon">
                <i className={`bi ${activeTabMeta?.icon}`}></i>
              </div>
              <div>
                <h5 className="odf-content-header__title">{activeTabMeta?.label}</h5>
                <span className="odf-content-header__desc">{activeTabMeta?.desc}</span>
              </div>
            </div>
            <div className="odf-content-header__step">
              Step {activeTabMeta?.step} of {tabs.length}
            </div>
          </div>

          {}
          <div className="odf-form-body">
            {activeTab === 'common' && (
              <CommonDetailsForm
                data={commonDetails}
                onChange={handleCommonChange}
                disabled={!isEditable}
              />
            )}

            {activeTab === 'type' && typeDetails && (
              isInternship
                ? (
                  <InternshipDetailsForm
                    data={typeDetails}
                    onChange={handleTypeChange}
                    disabled={!isEditable}
                  />
                )
                : (
                  <FullTimeDetailsForm
                    data={typeDetails}
                    onChange={handleTypeChange}
                    disabled={!isEditable}
                  />
                )
            )}
          </div>

          {}
          {isEditable && (
            <div className="odf-content-nav">
              <button
                className="odf-btn odf-btn--ghost"
                disabled={activeTab === 'common'}
                onClick={() => setActiveTab('common')}
              >
                <i className="bi bi-arrow-left"></i>
                Previous
              </button>
              <button
                className="odf-btn odf-btn--outline"
                disabled={activeTab === 'type'}
                onClick={() => setActiveTab('type')}
              >
                Next
                <i className="bi bi-arrow-right"></i>
              </button>
            </div>
          )}

        </main>
      </div>

      {}
      

      {}
      <SubmitForApprovalModal
        show={showSubmit}
        onClose={() => setShowSubmit(false)}
        offer={offer}
        onSubmit={handleSubmit}
      />

    </div>
  );
};

export default OfferDetailsForm;
