using Relevantz.SOR.Common.DTOs.Response;

namespace Relevantz.SOR.Core.IService;

public interface IFinanceService
{
    Task<ApiResponseDto<FinanceValidationResponseDto>> ValidateBudgetAsync(int offerId, int departmentId, int fiscalYear);
}
