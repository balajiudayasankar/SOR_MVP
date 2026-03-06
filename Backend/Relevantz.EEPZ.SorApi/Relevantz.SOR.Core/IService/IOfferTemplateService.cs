using Relevantz.SOR.Common.DTOs.Request.OfferTemplate;
using Relevantz.SOR.Common.DTOs.Response;

namespace Relevantz.SOR.Core.IService;

public interface IOfferTemplateService
{
    Task<ApiResponseDto<IEnumerable<OfferTemplateResponseDto>>> GetAllActiveAsync();
    Task<ApiResponseDto<OfferTemplateResponseDto>> CreateAsync(CreateOfferTemplateRequestDto dto, int createdByUserId);
    Task<ApiResponseDto<OfferTemplateResponseDto>> UpdateAsync(int templateId, UpdateOfferTemplateRequestDto dto, int updatedByUserId); // ✅ BUG #4 FIX — userId added
    Task<ApiResponseDto<bool>> DeleteAsync(int templateId);
}
