using Relevantz.SOR.Common.DTOs.Response;

namespace Relevantz.SOR.Core.IService;

public interface IAuditService
{
    Task LogAsync(string entityType, int entityId, string action, int performedByUserId,
        int? offerId = null, string? oldValues = null, string? newValues = null, string? ipAddress = null);
    Task<ApiResponseDto<IEnumerable<AuditLogResponseDto>>> GetByOfferIdAsync(int offerId);
    Task<ApiResponseDto<IEnumerable<AuditLogResponseDto>>> GetByUserIdAsync(int userId);
    Task<ApiResponseDto<IEnumerable<AuditLogResponseDto>>> GetByDateRangeAsync(DateTime from, DateTime to);
    Task<ApiResponseDto<PagedResponseDto<AuditLogResponseDto>>> GetAllAsync(int pageNumber, int pageSize);
}
