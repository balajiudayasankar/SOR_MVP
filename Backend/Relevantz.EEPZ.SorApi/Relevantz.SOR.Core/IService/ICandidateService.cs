using Relevantz.SOR.Common.DTOs.Request.Candidate;
using Relevantz.SOR.Common.DTOs.Response;
using Relevantz.SOR.Common.Enums;

namespace Relevantz.SOR.Core.IService;

public interface ICandidateService
{
    Task<ApiResponseDto<CandidateResponseDto>> GetByIdAsync(int candidateId);
    Task<ApiResponseDto<IEnumerable<CandidateResponseDto>>> GetAllAsync();
    Task<ApiResponseDto<IEnumerable<CandidateResponseDto>>> GetByStageAsync(CandidateStage stage);
    Task<ApiResponseDto<CandidateResponseDto>> CreateAsync(CreateCandidateRequestDto dto, int createdByUserId);
    Task<ApiResponseDto<CandidateResponseDto>> UpdateAsync(int candidateId, UpdateCandidateRequestDto dto, int updatedByUserId);
    Task<ApiResponseDto<CandidateResponseDto>> MoveToOfferStageAsync(int candidateId, int performedByUserId);
}
