using Relevantz.SOR.Common.DTOs.Response;

namespace Relevantz.SOR.Core.IService;

public interface IOfferWorkflowService
{
    Task<ApiResponseDto<OfferWorkflowResponseDto>> GetByOfferIdAsync(int offerId);
    Task<ApiResponseDto<WorkflowStatusResponseDto>> GetStatusAsync(int offerId);
    Task<ApiResponseDto<IEnumerable<WorkflowStatusResponseDto>>> GetAllActiveWorkflowsAsync(string? department, string? status);
}
