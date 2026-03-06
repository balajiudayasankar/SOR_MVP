using Mapster;
using Microsoft.Extensions.Logging;
using Relevantz.SOR.Common.Constants;
using Relevantz.SOR.Common.DTOs.Request.Approval;
using Relevantz.SOR.Common.DTOs.Response;
using Relevantz.SOR.Common.Enums;
using Relevantz.SOR.Common.Utils;
using Relevantz.SOR.Core.IService;
using Relevantz.SOR.Data.IRepository;
using Relevantz.SOR.Common.Entities;

namespace Relevantz.SOR.Core.Service;

public class OfferApprovalService : IOfferApprovalService
{
    private readonly IOfferWorkflowRepository     _workflowRepository;
    private readonly IOfferWorkflowStepRepository _stepRepository;
    private readonly IOfferRepository             _offerRepository;
    private readonly IFinanceBudgetRepository     _financeBudgetRepository;
    private readonly INotificationService         _notificationService;
    private readonly IAuditService                _auditService;
    private readonly ILogger<OfferApprovalService> _logger;

    public OfferApprovalService(
        IOfferWorkflowRepository workflowRepository,
        IOfferWorkflowStepRepository stepRepository,
        IOfferRepository offerRepository,
        IFinanceBudgetRepository financeBudgetRepository,
        INotificationService notificationService,
        IAuditService auditService,
        ILogger<OfferApprovalService> logger)
    {
        _workflowRepository      = workflowRepository;
        _stepRepository          = stepRepository;
        _offerRepository         = offerRepository;
        _financeBudgetRepository = financeBudgetRepository;
        _notificationService     = notificationService;
        _auditService            = auditService;
        _logger                  = logger;
    }

    public async Task<ApiResponseDto<List<OfferWorkflowResponseDto>>> GetMyPendingApprovalsAsync(int approverUserId)
    {
        _logger.LogWarning("GetMyPendingApprovals called with approverUserId = {UserId}", approverUserId);

        var workflows = await _workflowRepository.GetActivePendingForUserAsync(approverUserId);

        if (!workflows.Any())
            return ApiResponseDto<List<OfferWorkflowResponseDto>>.Ok(
                new List<OfferWorkflowResponseDto>(), "No pending approvals.");

        var result = workflows.Select(wf =>
        {
            var dto = wf.Adapt<OfferWorkflowResponseDto>();
            dto.CandidateName = wf.Offer?.Candidate?.CandidateName ?? string.Empty;
            dto.OfferNumber   = wf.Offer?.OfferNumber               ?? string.Empty;
            dto.OfferType     = wf.Offer?.OfferType.ToString()      ?? string.Empty;
            return dto;
        }).ToList();

        return ApiResponseDto<List<OfferWorkflowResponseDto>>.Ok(result);
    }

    public async Task<ApiResponseDto<OfferWorkflowResponseDto>> ApproveAsync(
        ApproveOfferRequestDto dto, int approverUserId)
    {
        var step = await _stepRepository.GetByIdAsync(dto.WorkflowStepId);
        if (step == null)
            return ApiResponseDto<OfferWorkflowResponseDto>.Fail(WorkflowMessages.StepNotFound);

        if (step.ApproverUserId != approverUserId)
            return ApiResponseDto<OfferWorkflowResponseDto>.Fail(WorkflowMessages.UnauthorizedApprover);

        step.Status     = ApprovalStepStatus.Approved;
        step.Comments   = dto.Comments;
        step.ActionDate = DateTime.UtcNow;
        await _stepRepository.UpdateAsync(step);

        var workflow = await _workflowRepository.GetWithStepsAsync(step.OfferWorkflowId);
        if (workflow == null)
            return ApiResponseDto<OfferWorkflowResponseDto>.Fail(WorkflowMessages.WorkflowNotFound);

        await _auditService.LogAsync(WorkflowConstants.StepEntityType, step.OfferWorkflowStepId,
            AuditConstants.ActionApprove, approverUserId, workflow.OfferId);

        if (WorkflowHelper.IsAllStepsCompleted(workflow))
        {
            workflow.Status      = WorkflowStatus.Completed;
            workflow.CompletedAt = DateTime.UtcNow;
            await _workflowRepository.UpdateAsync(workflow);

            var offer = await _offerRepository.GetByIdAsync(workflow.OfferId);
            if (offer != null)
            {
                offer.Status = OfferStatus.InternallyApproved;
                await _offerRepository.UpdateAsync(offer);
                await _notificationService.SendAsync(offer.CreatedByUserId,
                    "Offer Internally Approved",
                    $"Offer {offer.OfferNumber} has been internally approved.",
                    NotificationType.OfferInternallyApproved, offer.OfferId);
            }

            SORBusinessLog.LogInfo(_logger,
                "Workflow {WorkflowId} completed. Offer internally approved.",
                workflow.OfferWorkflowId);
        }
        else
        {
            var nextStep = workflow.Steps
                .OrderBy(s => s.StepOrder)
                .FirstOrDefault(s => s.Status == ApprovalStepStatus.NotStarted && !s.IsSkipped);

            if (nextStep != null)
            {
                nextStep.Status = ApprovalStepStatus.Pending; 
                await _stepRepository.UpdateAsync(nextStep);

                workflow.CurrentStepIndex = nextStep.StepOrder;
                await _workflowRepository.UpdateAsync(workflow);

                await _notificationService.SendAsync(nextStep.ApproverUserId,
                    "Offer Awaiting Your Approval",
                    "An offer is now pending your approval.",
                    NotificationType.WorkflowAdvanced, workflow.OfferId);
            }
        }

        return ApiResponseDto<OfferWorkflowResponseDto>.Ok(
            workflow.Adapt<OfferWorkflowResponseDto>(), WorkflowMessages.WorkflowApproved);
    }

    public async Task<ApiResponseDto<OfferWorkflowResponseDto>> RejectAsync(
        RejectOfferRequestDto dto, int approverUserId)
    {
        var step = await _stepRepository.GetByIdAsync(dto.WorkflowStepId);
        if (step == null)
            return ApiResponseDto<OfferWorkflowResponseDto>.Fail(WorkflowMessages.StepNotFound);

        if (step.ApproverUserId != approverUserId)
            return ApiResponseDto<OfferWorkflowResponseDto>.Fail(WorkflowMessages.UnauthorizedApprover);

        step.Status     = ApprovalStepStatus.Rejected;
        step.Comments   = dto.Comments;
        step.ActionDate = DateTime.UtcNow;
        await _stepRepository.UpdateAsync(step);

        var workflow = await _workflowRepository.GetWithStepsAsync(step.OfferWorkflowId);

        
        if (workflow == null)
            return ApiResponseDto<OfferWorkflowResponseDto>.Fail(WorkflowMessages.WorkflowNotFound);

        workflow.Status = WorkflowStatus.Rejected;
        await _workflowRepository.UpdateAsync(workflow);

        var offer = await _offerRepository.GetByIdAsync(workflow.OfferId);
        if (offer != null)
        {
            offer.Status = OfferStatus.Rejected;
            await _offerRepository.UpdateAsync(offer);
            await _notificationService.SendAsync(offer.CreatedByUserId,
                "Offer Rejected",
                $"Offer {offer.OfferNumber} was rejected. Reason: {dto.Comments}",
                NotificationType.OfferRejected, offer.OfferId);
        }

        await _auditService.LogAsync(WorkflowConstants.StepEntityType, step.OfferWorkflowStepId,
            AuditConstants.ActionReject, approverUserId, workflow.OfferId,
            newValues: dto.Comments);

        SORBusinessLog.LogInfo(_logger,
            "Offer {OfferId} rejected at step {StepId}",
            workflow.OfferId, step.OfferWorkflowStepId);

        return ApiResponseDto<OfferWorkflowResponseDto>.Ok(
            workflow.Adapt<OfferWorkflowResponseDto>(), WorkflowMessages.WorkflowRejected);
    }

    public async Task<ApiResponseDto<OfferWorkflowResponseDto>> RequestRevisionAsync(
        RequestRevisionDto dto, int approverUserId)
    {
        var step = await _stepRepository.GetByIdAsync(dto.WorkflowStepId);
        if (step == null)
            return ApiResponseDto<OfferWorkflowResponseDto>.Fail(WorkflowMessages.StepNotFound);

        if (step.ApproverUserId != approverUserId)
            return ApiResponseDto<OfferWorkflowResponseDto>.Fail(WorkflowMessages.UnauthorizedApprover);

        step.Status     = ApprovalStepStatus.RevisionRequested;
        step.Comments   = dto.RevisionReason;
        step.ActionDate = DateTime.UtcNow;
        await _stepRepository.UpdateAsync(step);

        var workflow = await _workflowRepository.GetWithStepsAsync(step.OfferWorkflowId);

        
        if (workflow == null)
            return ApiResponseDto<OfferWorkflowResponseDto>.Fail(WorkflowMessages.WorkflowNotFound);

        workflow.Status   = WorkflowStatus.OnHold;
        workflow.IsLocked = false;
        await _workflowRepository.UpdateAsync(workflow);

        var offer = await _offerRepository.GetByIdAsync(workflow.OfferId);
        if (offer != null)
        {
            offer.Status = OfferStatus.RevisionRequested;
            await _offerRepository.UpdateAsync(offer);
            await _notificationService.SendAsync(offer.CreatedByUserId,
                "Offer Revision Requested",
                $"Revision needed for Offer {offer.OfferNumber}. Fields: {dto.HighlightedFields}. Reason: {dto.RevisionReason}",
                NotificationType.RevisionRequested, offer.OfferId);
        }

        await _auditService.LogAsync(WorkflowConstants.StepEntityType, step.OfferWorkflowStepId,
            AuditConstants.ActionRevision, approverUserId, workflow.OfferId,
            newValues: dto.RevisionReason);

        return ApiResponseDto<OfferWorkflowResponseDto>.Ok(
            workflow.Adapt<OfferWorkflowResponseDto>(), WorkflowMessages.WorkflowRevisionRequested);
    }

    public async Task<ApiResponseDto<OfferWorkflowResponseDto>> ExpediteAsync(
        ExpediteOfferRequestDto dto, int hrHeadUserId)
    {
        var offer = await _offerRepository.GetByIdAsync(dto.OfferId);
        if (offer == null)
            return ApiResponseDto<OfferWorkflowResponseDto>.Fail(OfferMessages.OfferNotFound);

        
        var existingWorkflow = await _workflowRepository.GetByOfferIdAsync(dto.OfferId);
        if (existingWorkflow == null)
            return ApiResponseDto<OfferWorkflowResponseDto>.Fail(WorkflowMessages.WorkflowNotFound);

        var workflow = await _workflowRepository.GetWithStepsAsync(existingWorkflow.OfferWorkflowId);
        if (workflow == null)
            return ApiResponseDto<OfferWorkflowResponseDto>.Fail(WorkflowMessages.WorkflowNotFound);

        var skippedUserIds = new List<int>();

        
        foreach (var step in workflow.Steps
                     .Where(s => (s.Status == ApprovalStepStatus.Pending ||
                                  s.Status == ApprovalStepStatus.NotStarted)
                                 && !s.IsSkipped))
        {
            skippedUserIds.Add(step.ApproverUserId);
            step.IsSkipped         = true;
            step.SkipJustification = dto.Justification;
            step.Status            = ApprovalStepStatus.Skipped;
            step.ActionDate        = DateTime.UtcNow;
            await _stepRepository.UpdateAsync(step);
        }

        workflow.Status      = WorkflowStatus.FastTracked;
        workflow.CompletedAt = DateTime.UtcNow;
        await _workflowRepository.UpdateAsync(workflow);

        offer.Status = OfferStatus.InternallyApproved;
        await _offerRepository.UpdateAsync(offer);

        await _auditService.LogAsync(OfferConstants.EntityType, dto.OfferId,
            AuditConstants.ActionExpedite, hrHeadUserId, dto.OfferId,
            newValues: $"Expedited by HR Head. Justification: {dto.Justification}");

        await _notificationService.SendToMultipleAsync(skippedUserIds,
            "Offer Expedited",
            $"Offer {offer.OfferNumber} was fast-tracked by HR Head. Justification: {dto.Justification}",
            NotificationType.FastTracked, dto.OfferId);

        SORBusinessLog.LogInfo(_logger,
            "Offer {OfferId} expedited by HRHead {UserId}",
            dto.OfferId, hrHeadUserId);

        return ApiResponseDto<OfferWorkflowResponseDto>.Ok(
            workflow.Adapt<OfferWorkflowResponseDto>(), WorkflowMessages.WorkflowExpedited);
    }

    public async Task<ApiResponseDto<FinanceValidationResponseDto>> GetFinanceSummaryAsync(
        int offerId, int departmentId)
    {
        var offer = await _offerRepository.GetWithDetailsAsync(offerId);
        if (offer == null)
            return ApiResponseDto<FinanceValidationResponseDto>.Fail(OfferMessages.OfferNotFound);

        var budget = await _financeBudgetRepository.GetByDepartmentAndYearAsync(
            departmentId, DateTime.UtcNow.Year);

        var offeredCtc = offer.FullTimeDetails?.AnnualCtc
                      ?? offer.InternshipDetails?.StipendAmount * 12
                      ?? 0;

        var variance = budget != null && budget.RemainingBudget > 0
            ? Math.Round((offeredCtc - budget.RemainingBudget) / budget.RemainingBudget * 100, 2)
            : 0;

        var result = new FinanceValidationResponseDto
        {
            DepartmentId       = departmentId,
            DepartmentName     = "Department",
            TotalBudget        = budget?.TotalBudget     ?? 0,
            UsedBudget         = budget?.UsedBudget      ?? 0,
            RemainingBudget    = budget?.RemainingBudget ?? 0,
            OfferedCtc         = offeredCtc,
            VariancePercentage = variance,
            IsOverBudget       = offeredCtc > (budget?.RemainingBudget ?? 0)
        };

        return ApiResponseDto<FinanceValidationResponseDto>.Ok(result);
    }

    public async Task<ApiResponseDto<OfferWorkflowResponseDto>> SubmitFinanceValidationAsync(
        FinanceValidationRequestDto dto, int financeUserId)
    {
        if (dto.IsApproved)
        {
            return await ApproveAsync(new ApproveOfferRequestDto
            {
                WorkflowStepId = dto.WorkflowStepId,
                Comments       = dto.BudgetNotes ?? dto.Comments
            }, financeUserId);
        }

        return await RejectAsync(new RejectOfferRequestDto
        {
            WorkflowStepId = dto.WorkflowStepId,
            Comments       = dto.Comments ?? dto.BudgetNotes ?? "Rejected by Finance"
        }, financeUserId);
    }
}
