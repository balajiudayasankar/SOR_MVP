using Relevantz.SOR.Common.DTOs.Response;

namespace Relevantz.SOR.Core.IService;

public interface IDashboardService
{
    Task<ApiResponseDto<DashboardSummaryResponseDto>> GetHrDashboardAsync(int hrUserId);
    Task<ApiResponseDto<IEnumerable<WorkflowStatusResponseDto>>> GetManagerPendingOffersAsync(int managerUserId);
}
