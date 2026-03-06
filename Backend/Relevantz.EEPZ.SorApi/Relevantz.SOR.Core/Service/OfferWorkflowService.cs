using Mapster;
using Relevantz.SOR.Common.Constants;
using Relevantz.SOR.Common.DTOs.Response;
using Relevantz.SOR.Common.Enums;
using Relevantz.SOR.Common.Utils;
using Relevantz.SOR.Core.IService;
using Relevantz.SOR.Data.IRepository;

namespace Relevantz.SOR.Core.Service;

public class OfferWorkflowService : IOfferWorkflowService
{
    private readonly IOfferWorkflowRepository _workflowRepository;
    private readonly IOfferRepository         _offerRepository;

    public OfferWorkflowService(
        IOfferWorkflowRepository workflowRepository,
        IOfferRepository offerRepository)
    {
        _workflowRepository = workflowRepository;
        _offerRepository    = offerRepository;
    }

    public async Task<ApiResponseDto<OfferWorkflowResponseDto>> GetByOfferIdAsync(int offerId)
    {
        var workflow = await _workflowRepository.GetByOfferIdAsync(offerId);
        if (workflow == null)
            return ApiResponseDto<OfferWorkflowResponseDto>.Fail(WorkflowMessages.WorkflowNotFound);

        
        var wfWithSteps = await _workflowRepository.GetWithStepsAsync(workflow.OfferWorkflowId);
        if (wfWithSteps == null)
            return ApiResponseDto<OfferWorkflowResponseDto>.Fail(WorkflowMessages.WorkflowNotFound);

        return ApiResponseDto<OfferWorkflowResponseDto>.Ok(wfWithSteps.Adapt<OfferWorkflowResponseDto>());
    }

    public async Task<ApiResponseDto<WorkflowStatusResponseDto>> GetStatusAsync(int offerId)
    {
        var offer = await _offerRepository.GetWithDetailsAsync(offerId);
        if (offer == null)
            return ApiResponseDto<WorkflowStatusResponseDto>.Fail(OfferMessages.OfferNotFound);

        var workflow = offer.OfferWorkflow;
        if (workflow == null)
            return ApiResponseDto<WorkflowStatusResponseDto>.Fail(WorkflowMessages.WorkflowNotFound);

        var currentStep = WorkflowHelper.GetCurrentStep(workflow);

        var status = new WorkflowStatusResponseDto
        {
            OfferId             = offerId,
            OfferNumber         = offer.OfferNumber,
            CandidateName       = offer.Candidate?.CandidateName ?? string.Empty,
            OfferStatus         = offer.Status.ToString(),
            WorkflowStatus      = workflow.Status.ToString(),
            CurrentStep         = workflow.CurrentStepIndex,
            TotalSteps          = workflow.Steps.Count,
            CurrentApproverRole = currentStep?.Role.ToString() ?? "Completed",
            CurrentApproverName = string.Empty,
            HasBottleneck       = workflow.Status == WorkflowStatus.OnHold
        };

        return ApiResponseDto<WorkflowStatusResponseDto>.Ok(status);
    }

    public async Task<ApiResponseDto<IEnumerable<WorkflowStatusResponseDto>>> GetAllActiveWorkflowsAsync(
        string? department, string? status)
    {
        
        var offers = await _offerRepository.GetAllActiveWithWorkflowAsync();

        var filtered = offers.Where(o =>
            o.Status == OfferStatus.PendingApproval ||
            o.Status == OfferStatus.InReview        ||
            o.Status == OfferStatus.RevisionRequested);

        
        if (!string.IsNullOrWhiteSpace(status) &&
            Enum.TryParse<OfferStatus>(status, ignoreCase: true, out var parsedStatus))
        {
            filtered = filtered.Where(o => o.Status == parsedStatus);
        }

        
        if (!string.IsNullOrWhiteSpace(department))
        {
            filtered = filtered.Where(o =>
                o.OfferCommonDetails != null &&
                o.OfferCommonDetails.Department
                    .Contains(department, StringComparison.OrdinalIgnoreCase));
        }

        var result = filtered.Select(o => new WorkflowStatusResponseDto
        {
            OfferId             = o.OfferId,
            OfferNumber         = o.OfferNumber,
            CandidateName       = o.Candidate?.CandidateName          ?? string.Empty,
            OfferStatus         = o.Status.ToString(),
            WorkflowStatus      = o.OfferWorkflow?.Status.ToString()   ?? string.Empty,
            CurrentStep         = o.OfferWorkflow?.CurrentStepIndex    ?? 0,
            TotalSteps          = o.OfferWorkflow?.Steps?.Count        ?? 0,
            CurrentApproverRole = string.Empty,
            CurrentApproverName = string.Empty,
            HasBottleneck       = o.OfferWorkflow?.Status == WorkflowStatus.OnHold
        });

        return ApiResponseDto<IEnumerable<WorkflowStatusResponseDto>>.Ok(result);
    }
}
