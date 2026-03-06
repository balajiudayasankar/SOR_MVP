using Relevantz.SOR.Common.DTOs.Request.Approval;
using Relevantz.SOR.Common.DTOs.Response;

namespace Relevantz.SOR.Core.IService;

public interface IOfferApprovalService
{
    Task<ApiResponseDto<List<OfferWorkflowResponseDto>>> GetMyPendingApprovalsAsync(int approverUserId);
    Task<ApiResponseDto<OfferWorkflowResponseDto>> ApproveAsync(ApproveOfferRequestDto dto, int approverUserId);
    Task<ApiResponseDto<OfferWorkflowResponseDto>> RejectAsync(RejectOfferRequestDto dto, int approverUserId);
    Task<ApiResponseDto<OfferWorkflowResponseDto>> RequestRevisionAsync(RequestRevisionDto dto, int approverUserId);
    Task<ApiResponseDto<OfferWorkflowResponseDto>> ExpediteAsync(ExpediteOfferRequestDto dto, int hrHeadUserId);
    Task<ApiResponseDto<FinanceValidationResponseDto>> GetFinanceSummaryAsync(int offerId, int departmentId);
    Task<ApiResponseDto<OfferWorkflowResponseDto>> SubmitFinanceValidationAsync(FinanceValidationRequestDto dto, int financeUserId);
}
