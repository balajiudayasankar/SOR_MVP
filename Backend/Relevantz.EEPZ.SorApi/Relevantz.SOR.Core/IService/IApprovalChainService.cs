using Relevantz.SOR.Common.DTOs.Request.ApprovalChain;
using Relevantz.SOR.Common.DTOs.Response;

namespace Relevantz.SOR.Core.IService;

public interface IApprovalChainService
{
    Task<ApiResponseDto<ApprovalChainResponseDto>> GetByIdAsync(int chainId);
    Task<ApiResponseDto<IEnumerable<ApprovalChainResponseDto>>> GetByDepartmentAsync(int departmentId);
    Task<ApiResponseDto<ApprovalChainResponseDto>> CreateAsync(CreateApprovalChainRequestDto dto, int createdByUserId);
    Task<ApiResponseDto<ApprovalChainResponseDto>> UpdateAsync(int chainId, UpdateApprovalChainRequestDto dto);
    Task<ApiResponseDto<bool>> DeleteAsync(int chainId);
    Task<ApiResponseDto<bool>> TestAsync(TestApprovalChainRequestDto dto);
    Task<ApiResponseDto<bool>> SetDefaultAsync(int chainId, int departmentId);
}
