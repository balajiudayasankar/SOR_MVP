using Relevantz.SOR.Common.DTOs.Response;
using Relevantz.SOR.Common.Enums;
using Relevantz.SOR.Core.IService;
using Relevantz.SOR.Data.IRepository;

namespace Relevantz.SOR.Core.Service;

public class DashboardService : IDashboardService
{
    private readonly IOfferRepository _offerRepository;
    private readonly IOfferWorkflowStepRepository _stepRepository;

    public DashboardService(IOfferRepository offerRepository,
        IOfferWorkflowStepRepository stepRepository)
    {
        _offerRepository = offerRepository;
        _stepRepository = stepRepository;
    }

    public async Task<ApiResponseDto<DashboardSummaryResponseDto>> GetHrDashboardAsync(int hrUserId)
    {
        var allOffers = (await _offerRepository.GetAllActiveAsync()).ToList();

        var activeWorkflows = allOffers
            .Where(o => o.OfferWorkflow != null &&
                        o.Status is OfferStatus.PendingApproval or OfferStatus.InReview or OfferStatus.RevisionRequested)
            .Select(o => new WorkflowStatusResponseDto
            {
                OfferId = o.OfferId,
                OfferNumber = o.OfferNumber,
                CandidateName = o.Candidate?.CandidateName ?? string.Empty,
                OfferStatus = o.Status.ToString(),
                WorkflowStatus = o.OfferWorkflow?.Status.ToString() ?? string.Empty,
                CurrentStep = o.OfferWorkflow?.CurrentStepIndex ?? 0,
                TotalSteps = o.OfferWorkflow?.Steps.Count ?? 0,
                CurrentApproverRole = string.Empty,
                CurrentApproverName = string.Empty,
                HasBottleneck = o.OfferWorkflow?.Status == WorkflowStatus.OnHold
            }).ToList();

        var summary = new DashboardSummaryResponseDto
        {
            TotalOffers = allOffers.Count,
            DraftOffers = allOffers.Count(o => o.Status == OfferStatus.Draft),
            PendingApprovalOffers = allOffers.Count(o => o.Status == OfferStatus.PendingApproval),
            ApprovedOffers = allOffers.Count(o => o.Status == OfferStatus.InternallyApproved),
            RejectedOffers = allOffers.Count(o => o.Status == OfferStatus.Rejected),
            RevisionsRequested = allOffers.Count(o => o.Status == OfferStatus.RevisionRequested),
            ActiveWorkflows = activeWorkflows
        };

        return ApiResponseDto<DashboardSummaryResponseDto>.Ok(summary);
    }

    public async Task<ApiResponseDto<IEnumerable<WorkflowStatusResponseDto>>> GetManagerPendingOffersAsync(
        int managerUserId)
    {
        var pendingSteps = await _stepRepository.GetPendingByApproverAsync(managerUserId);
        var result = new List<WorkflowStatusResponseDto>();

        foreach (var step in pendingSteps)
        {
            result.Add(new WorkflowStatusResponseDto
            {
                OfferId = 0,
                OfferNumber = string.Empty,
                CandidateName = string.Empty,
                OfferStatus = string.Empty,
                WorkflowStatus = step.Status.ToString(),
                CurrentStep = step.StepOrder,
                TotalSteps = 0,
                CurrentApproverRole = step.Role.ToString(),
                CurrentApproverName = string.Empty,
                HasBottleneck = false
            });
        }

        return ApiResponseDto<IEnumerable<WorkflowStatusResponseDto>>.Ok(result);
    }
}
