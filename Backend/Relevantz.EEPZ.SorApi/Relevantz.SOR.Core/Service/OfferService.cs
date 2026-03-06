using System.Text.Json;
using Mapster;
using Microsoft.Extensions.Logging;
using Relevantz.SOR.Common.Constants;
using Relevantz.SOR.Common.DTOs.Request.Offer;
using Relevantz.SOR.Common.DTOs.Response;
using Relevantz.SOR.Common.Entities;
using Relevantz.SOR.Common.Enums;
using Relevantz.SOR.Common.Utils;
using Relevantz.SOR.Core.IService;
using Relevantz.SOR.Data.IRepository;

namespace Relevantz.SOR.Core.Service;

public class OfferService : IOfferService
{
    private readonly IOfferRepository _offerRepository;
    private readonly ICandidateRepository _candidateRepository;
    private readonly IOfferVersionRepository _offerVersionRepository;
    private readonly IOfferTemplateRepository _offerTemplateRepository;
    private readonly IApprovalChainRepository _approvalChainRepository;
    private readonly IOfferWorkflowRepository _offerWorkflowRepository;
    private readonly IOfferWorkflowStepRepository _offerWorkflowStepRepository;
    private readonly INotificationService _notificationService;
    private readonly IAuditService _auditService;
    private readonly IPdfService _pdfService;
    private readonly ILogger<OfferService> _logger;

    public OfferService(
        IOfferRepository offerRepository,
        ICandidateRepository candidateRepository,
        IOfferVersionRepository offerVersionRepository,
        IOfferTemplateRepository offerTemplateRepository,
        IApprovalChainRepository approvalChainRepository,
        IOfferWorkflowRepository offerWorkflowRepository,
        IOfferWorkflowStepRepository offerWorkflowStepRepository,
        INotificationService notificationService,
        IAuditService auditService,
        IPdfService pdfService,
        ILogger<OfferService> logger)
    {
        _offerRepository = offerRepository;
        _candidateRepository = candidateRepository;
        _offerVersionRepository = offerVersionRepository;
        _offerTemplateRepository = offerTemplateRepository;
        _approvalChainRepository = approvalChainRepository;
        _offerWorkflowRepository = offerWorkflowRepository;
        _offerWorkflowStepRepository = offerWorkflowStepRepository;
        _notificationService = notificationService;
        _auditService = auditService;
        _pdfService = pdfService;
        _logger = logger;
    }

    public async Task<ApiResponseDto<OfferResponseDto>> CreateAsync(
        CreateOfferRequestDto dto, int createdByUserId)
    {
        var candidate = await _candidateRepository.GetByIdAsync(dto.CandidateId);
        if (candidate == null)
            return ApiResponseDto<OfferResponseDto>.Fail(CandidateMessages.CandidateNotFound);

        if (candidate.CurrentStage != CandidateStage.OfferStage)
            return ApiResponseDto<OfferResponseDto>.Fail(OfferMessages.CandidateNotInOfferStage);

        var alreadyExists = await _offerRepository.HasActiveOfferOfTypeAsync(dto.CandidateId, dto.OfferType);
        if (alreadyExists)
            return ApiResponseDto<OfferResponseDto>.Fail(
                dto.OfferType == OfferType.FullTime
                    ? OfferMessages.FullTimeOfferAlreadyExists
                    : OfferMessages.InternshipOfferAlreadyExists);

        var offer = new Offer
        {
            OfferNumber = OfferNumberGenerator.Generate(),
            CandidateId = dto.CandidateId,
            OfferType = dto.OfferType,
            Status = OfferStatus.Draft,
            Version = 1,
            IsActive = true,
            CreatedByUserId = createdByUserId
        };

        await _offerRepository.AddAsync(offer);
        await _auditService.LogAsync(OfferConstants.EntityType, offer.OfferId,
            AuditConstants.ActionCreate, createdByUserId, offer.OfferId);

        SORBusinessLog.LogInfo(_logger, "Offer {OfferNumber} created for candidate {CandidateId}",
            offer.OfferNumber, dto.CandidateId);

        return ApiResponseDto<OfferResponseDto>.Ok(
            offer.Adapt<OfferResponseDto>(), OfferMessages.OfferCreated);
    }

    public async Task<ApiResponseDto<OfferDetailResponseDto>> GetByIdAsync(int offerId)
    {
        var offer = await _offerRepository.GetWithDetailsAsync(offerId);
        if (offer == null)
            return ApiResponseDto<OfferDetailResponseDto>.Fail(OfferMessages.OfferNotFound);

        return ApiResponseDto<OfferDetailResponseDto>.Ok(offer.Adapt<OfferDetailResponseDto>());
    }

    public async Task<ApiResponseDto<IEnumerable<OfferResponseDto>>> GetAllActiveAsync()
    {
        var offers = await _offerRepository.GetAllActiveAsync();
        return ApiResponseDto<IEnumerable<OfferResponseDto>>.Ok(
            offers.Adapt<IEnumerable<OfferResponseDto>>());
    }

    public async Task<ApiResponseDto<OfferDetailResponseDto>> UpdateDetailsAsync(
        int offerId, UpdateOfferRequestDto dto, int updatedByUserId)
    {
        var offer = await _offerRepository.GetWithDetailsAsync(offerId);
        if (offer == null)
            return ApiResponseDto<OfferDetailResponseDto>.Fail(OfferMessages.OfferNotFound);

        if (offer.Status != OfferStatus.Draft && offer.Status != OfferStatus.RevisionRequested)
            return ApiResponseDto<OfferDetailResponseDto>.Fail(OfferMessages.OfferAlreadySubmitted);

        MapCommonDetails(offer, dto.CommonDetails);

        if (offer.OfferType == OfferType.Internship && dto.InternshipDetails != null)
            MapInternshipDetails(offer, dto.InternshipDetails);

        if (offer.OfferType == OfferType.FullTime && dto.FullTimeDetails != null)
            MapFullTimeDetails(offer, dto.FullTimeDetails);

        offer.UpdatedByUserId = updatedByUserId;
        await _offerRepository.UpdateAsync(offer);
        await _auditService.LogAsync(OfferConstants.EntityType, offerId,
            AuditConstants.ActionUpdate, updatedByUserId, offerId);

        return ApiResponseDto<OfferDetailResponseDto>.Ok(
            offer.Adapt<OfferDetailResponseDto>(), OfferMessages.OfferUpdated);
    }

    public async Task<ApiResponseDto<OfferDetailResponseDto>> SaveDraftAsync(
        int offerId, SaveOfferDraftRequestDto dto, int updatedByUserId)
    {
        var offer = await _offerRepository.GetWithDetailsAsync(offerId);
        if (offer == null)
            return ApiResponseDto<OfferDetailResponseDto>.Fail(OfferMessages.OfferNotFound);

        if (offer.Status != OfferStatus.Draft && offer.Status != OfferStatus.RevisionRequested)
            return ApiResponseDto<OfferDetailResponseDto>.Fail(OfferMessages.OfferAlreadySubmitted);

        if (dto.CommonDetails != null) MapCommonDetails(offer, dto.CommonDetails);
        if (offer.OfferType == OfferType.Internship && dto.InternshipDetails != null)
            MapInternshipDetails(offer, dto.InternshipDetails);
        if (offer.OfferType == OfferType.FullTime && dto.FullTimeDetails != null)
            MapFullTimeDetails(offer, dto.FullTimeDetails);

        offer.UpdatedByUserId = updatedByUserId;
        await _offerRepository.UpdateAsync(offer);

        return ApiResponseDto<OfferDetailResponseDto>.Ok(
            offer.Adapt<OfferDetailResponseDto>(), OfferMessages.OfferDraftSaved);
    }

    public async Task<ApiResponseDto<OfferPreviewResponseDto>> GetPreviewAsync(int offerId)
    {
        var offer = await _offerRepository.GetWithDetailsAsync(offerId);
        if (offer == null)
            return ApiResponseDto<OfferPreviewResponseDto>.Fail(OfferMessages.OfferNotFound);

        var template = await _offerTemplateRepository.GetDefaultByTypeAsync(offer.OfferType);
        if (template == null)
            return ApiResponseDto<OfferPreviewResponseDto>.Fail(OfferTemplateMessages.TemplateNotFound);

        var placeholders = TemplateRendererHelper.BuildPlaceholders(offer);
        var html = TemplateRendererHelper.Render(template.HtmlContent, placeholders);

        var preview = new OfferPreviewResponseDto
        {
            OfferId = offerId,
            OfferNumber = offer.OfferNumber,
            HtmlContent = html
        };

        return ApiResponseDto<OfferPreviewResponseDto>.Ok(preview);
    }

    public async Task<ApiResponseDto<OfferResponseDto>> SubmitForApprovalAsync(
        SubmitOfferForApprovalRequestDto dto, int submittedByUserId)
    {
        var offer = await _offerRepository.GetWithDetailsAsync(dto.OfferId);
        if (offer == null)
            return ApiResponseDto<OfferResponseDto>.Fail(OfferMessages.OfferNotFound);

        if (offer.Status != OfferStatus.Draft && offer.Status != OfferStatus.RevisionRequested)
            return ApiResponseDto<OfferResponseDto>.Fail(OfferMessages.OfferAlreadySubmitted);

        var chain = await _approvalChainRepository.GetWithStepsAsync(dto.ApprovalChainId);
        if (chain == null)
            return ApiResponseDto<OfferResponseDto>.Fail(ApprovalChainMessages.ChainNotFound);

        var workflow = new OfferWorkflow
        {
            WorkflowNumber = WorkflowNumberGenerator.Generate(),
            OfferId = dto.OfferId,
            CurrentStepIndex = 0,
            Status = WorkflowStatus.InProgress,
            IsLocked = true,
            CreatedByUserId = submittedByUserId
        };

        await _offerWorkflowRepository.AddAsync(workflow);

        var steps = chain.Steps.OrderBy(s => s.StepOrder).Select(s => new OfferWorkflowStep
        {
            OfferWorkflowId = workflow.OfferWorkflowId,
            StepOrder = s.StepOrder,
            Role = s.Role,
            ApproverUserId = s.AssignedUserId,
            Status = s.StepOrder == 1 ? ApprovalStepStatus.Pending : ApprovalStepStatus.NotStarted
        }).ToList();

        await _offerWorkflowStepRepository.AddRangeAsync(steps);

        offer.Status = OfferStatus.PendingApproval;
        offer.UpdatedByUserId = submittedByUserId;
        await _offerRepository.UpdateAsync(offer);

        await _auditService.LogAsync(OfferConstants.EntityType, dto.OfferId,
            AuditConstants.ActionSubmitApproval, submittedByUserId, dto.OfferId);

        var firstStep = steps.First();
        await _notificationService.SendAsync(
            firstStep.ApproverUserId,
            "New Offer Pending Your Approval",
            $"Offer {offer.OfferNumber} is awaiting your approval.",
            NotificationType.OfferAssigned,
            dto.OfferId);

        SORBusinessLog.LogInfo(_logger,
            "Offer {OfferNumber} submitted for approval. Workflow {WorkflowNumber} started.",
            offer.OfferNumber, workflow.WorkflowNumber);

        return ApiResponseDto<OfferResponseDto>.Ok(
            offer.Adapt<OfferResponseDto>(), OfferMessages.OfferSubmitted);
    }

    public async Task<ApiResponseDto<OfferResponseDto>> RegenerateAsync(
        RegenerateOfferRequestDto dto, int performedByUserId)
    {
        var offer = await _offerRepository.GetWithDetailsAsync(dto.OfferId);
        if (offer == null)
            return ApiResponseDto<OfferResponseDto>.Fail(OfferMessages.OfferNotFound);

        var snapshot = JsonSerializer.Serialize(offer);
        var version = new OfferVersion
        {
            OfferId = offer.OfferId,
            VersionNumber = offer.Version,
            SnapshotJson = snapshot,
            StatusAtVersion = offer.Status,
            ArchivedByUserId = performedByUserId
        };
        await _offerVersionRepository.AddAsync(version);

        offer.Version += 1;
        offer.Status = OfferStatus.Draft;
        offer.UpdatedByUserId = performedByUserId;
        await _offerRepository.UpdateAsync(offer);

        await _auditService.LogAsync(OfferConstants.EntityType, dto.OfferId,
            AuditConstants.ActionRegenerate, performedByUserId, dto.OfferId,
            newValues: $"Regenerated: {dto.RegenerateReason}");

        SORBusinessLog.LogInfo(_logger, "Offer {OfferId} regenerated to version {Version}",
            dto.OfferId, offer.Version);

        return ApiResponseDto<OfferResponseDto>.Ok(
            offer.Adapt<OfferResponseDto>(), OfferMessages.OfferRegenerated);
    }

    public async Task<ApiResponseDto<IEnumerable<OfferVersionHistoryResponseDto>>> GetVersionHistoryAsync(int offerId)
    {
        var versions = await _offerVersionRepository.GetByOfferIdAsync(offerId);
        return ApiResponseDto<IEnumerable<OfferVersionHistoryResponseDto>>.Ok(
            versions.Adapt<IEnumerable<OfferVersionHistoryResponseDto>>());
    }

    public async Task<ApiResponseDto<byte[]>> DownloadApprovedOfferAsync(int offerId, int requestedByUserId)
    {
        var offer = await _offerRepository.GetByIdAsync(offerId);
        if (offer == null)
            return ApiResponseDto<byte[]>.Fail(OfferMessages.OfferNotFound);

        if (offer.Status != OfferStatus.InternallyApproved)
            return ApiResponseDto<byte[]>.Fail("Offer is not yet internally approved for download.");

        var pdfBytes = await _pdfService.GenerateAsync(offerId);
        await _auditService.LogAsync(OfferConstants.EntityType, offerId,
            AuditConstants.ActionDownload, requestedByUserId, offerId);

        return ApiResponseDto<byte[]>.Ok(pdfBytes, "Offer PDF generated successfully.");
    }

    // ─── Private Helpers ────────────────────────────────────────────────────────

    private static void MapCommonDetails(Offer offer, OfferCommonDetailsRequestDto dto)
    {
        if (offer.OfferCommonDetails == null)
            offer.OfferCommonDetails = new OfferCommonDetails { OfferId = offer.OfferId };

        var d = offer.OfferCommonDetails;
        d.CandidateName = dto.CandidateName;
        d.CandidateEmail = dto.CandidateEmail;
        d.CandidatePhone = dto.CandidatePhone;
        d.CandidateAddress = dto.CandidateAddress;
        d.Designation = dto.Designation;
        d.Department = dto.Department;
        d.WorkLocation = dto.WorkLocation;
        d.ReportingManager = dto.ReportingManager;
        d.OfferIssueDate = dto.OfferIssueDate;
        d.JoiningDate = dto.JoiningDate;
        d.WorkingDays = dto.WorkingDays;
        d.WorkingHours = dto.WorkingHours;
        d.WeeklyHours = dto.WeeklyHours;
        d.CompanyName = dto.CompanyName;
        d.HrContactName = dto.HrContactName;
        d.HrEmail = dto.HrEmail;
        d.HrPhone = dto.HrPhone;
        d.SignatoryName = dto.SignatoryName;
        d.SignatoryDesignation = dto.SignatoryDesignation;
        d.SignatorySignatureImagePath = dto.SignatorySignatureImagePath;
        d.ConfidentialityClause = dto.ConfidentialityClause;
        d.CompanyPolicyText = dto.CompanyPolicyText;
        d.UpdatedAt = DateTime.UtcNow;
    }

    private static void MapInternshipDetails(Offer offer, InternshipDetailsRequestDto dto)
    {
        if (offer.InternshipDetails == null)
            offer.InternshipDetails = new InternshipDetails { OfferId = offer.OfferId };

        var d = offer.InternshipDetails;
        d.InternshipStartDate = dto.InternshipStartDate;
        d.InternshipEndDate = dto.InternshipEndDate;
        d.DurationMonths = dto.DurationMonths;
        d.StipendAmount = dto.StipendAmount;
        d.PayFrequency = dto.PayFrequency;
        d.PaymentTiming = dto.PaymentTiming;
        d.TrainingLocation = dto.TrainingLocation;
        d.TrainingInstitution = dto.TrainingInstitution;
        d.TrainingDuration = dto.TrainingDuration;
        d.TrainingWorkingDays = dto.TrainingWorkingDays;
        d.RequiredDocuments = dto.RequiredDocuments;
        d.InsuranceEnabled = dto.InsuranceEnabled;
        d.InsuranceAmount = dto.InsuranceAmount;
        d.OtherBenefits = dto.OtherBenefits;
        d.FullTimeSalaryAfterInternship = dto.FullTimeSalaryAfterInternship;
        d.JoiningBonus = dto.JoiningBonus;
        d.RetentionBonus = dto.RetentionBonus;
        d.ServiceAgreementDurationMonths = dto.ServiceAgreementDurationMonths;
        d.ServiceAgreementPeriod = dto.ServiceAgreementPeriod;
        d.CertificateRetentionTerms = dto.CertificateRetentionTerms;
        d.BreakageCharges = dto.BreakageCharges;
        d.AccommodationAvailable = dto.AccommodationAvailable;
        d.AccommodationCost = dto.AccommodationCost;
        d.UpdatedAt = DateTime.UtcNow;
    }

    private static void MapFullTimeDetails(Offer offer, FullTimeDetailsRequestDto dto)
    {
        if (offer.FullTimeDetails == null)
            offer.FullTimeDetails = new FullTimeDetails { OfferId = offer.OfferId };

        var d = offer.FullTimeDetails;
        d.EmploymentType = dto.EmploymentType;
        d.AnnualCtc = dto.AnnualCtc;
        d.BasicSalary = dto.BasicSalary;
        d.Hra = dto.Hra;
        d.Allowances = dto.Allowances;
        d.BonusOrVariablePay = dto.BonusOrVariablePay;
        d.JoiningBonus = dto.JoiningBonus;
        d.EsopDetails = dto.EsopDetails;
        d.ProbationPeriod = dto.ProbationPeriod;
        d.ConfirmationTerms = dto.ConfirmationTerms;
        d.PfEligibility = dto.PfEligibility;
        d.GratuityEligibility = dto.GratuityEligibility;
        d.InsurancePlan = dto.InsurancePlan;
        d.LeaveEntitlement = dto.LeaveEntitlement;
        d.OtherBenefits = dto.OtherBenefits;
        d.NoticePeriod = dto.NoticePeriod;
        d.BackgroundVerificationRequired = dto.BackgroundVerificationRequired;
        d.NonCompeteEnabled = dto.NonCompeteEnabled;
        d.UpdatedAt = DateTime.UtcNow;
    }
}
