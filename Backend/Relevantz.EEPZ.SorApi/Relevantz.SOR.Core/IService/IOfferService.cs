using Relevantz.SOR.Common.DTOs.Request.Offer;
using Relevantz.SOR.Common.DTOs.Response;

namespace Relevantz.SOR.Core.IService;

public interface IOfferService
{
    Task<ApiResponseDto<OfferResponseDto>> CreateAsync(CreateOfferRequestDto dto, int createdByUserId);
    Task<ApiResponseDto<OfferDetailResponseDto>> GetByIdAsync(int offerId);
    Task<ApiResponseDto<IEnumerable<OfferResponseDto>>> GetAllActiveAsync();
    Task<ApiResponseDto<OfferDetailResponseDto>> UpdateDetailsAsync(int offerId, UpdateOfferRequestDto dto, int updatedByUserId);
    Task<ApiResponseDto<OfferDetailResponseDto>> SaveDraftAsync(int offerId, SaveOfferDraftRequestDto dto, int updatedByUserId);
    Task<ApiResponseDto<OfferPreviewResponseDto>> GetPreviewAsync(int offerId);
    Task<ApiResponseDto<OfferResponseDto>> SubmitForApprovalAsync(SubmitOfferForApprovalRequestDto dto, int submittedByUserId);
    Task<ApiResponseDto<OfferResponseDto>> RegenerateAsync(RegenerateOfferRequestDto dto, int performedByUserId);
    Task<ApiResponseDto<IEnumerable<OfferVersionHistoryResponseDto>>> GetVersionHistoryAsync(int offerId);
    Task<ApiResponseDto<byte[]>> DownloadApprovedOfferAsync(int offerId, int requestedByUserId);
}
