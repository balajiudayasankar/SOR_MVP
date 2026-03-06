using Mapster;
using Microsoft.Extensions.Logging;
using Relevantz.SOR.Common.Constants;
using Relevantz.SOR.Common.DTOs.Response;
using Relevantz.SOR.Common.Entities;
using Relevantz.SOR.Common.Utils;
using Relevantz.SOR.Core.IService;
using Relevantz.SOR.Data.IRepository;

namespace Relevantz.SOR.Core.Service;

public class AuditService : IAuditService
{
    private readonly IAuditLogRepository _auditLogRepository;
    private readonly IUserRepository _userRepository;
    private readonly ILogger<AuditService> _logger;

    public AuditService(
        IAuditLogRepository auditLogRepository,
        IUserRepository userRepository,
        ILogger<AuditService> logger)
    {
        _auditLogRepository = auditLogRepository;
        _userRepository     = userRepository;
        _logger             = logger;
    }

    public async Task LogAsync(
        string entityType, int entityId, string action,
        int performedByUserId, int? offerId = null,
        string? oldValues = null, string? newValues = null, string? ipAddress = null)
    {
        var log = AuditHelper.Build(
            entityType, entityId, action,
            performedByUserId, offerId,
            oldValues, newValues, ipAddress);

        await _auditLogRepository.AddAsync(log);

        SORServiceLog.LogInfo(_logger,
            "Audit logged — Entity: {EntityType} | Id: {EntityId} | Action: {Action} | By: {UserId}",
            entityType, entityId, action, performedByUserId);
    }

    public async Task<ApiResponseDto<IEnumerable<AuditLogResponseDto>>> GetByOfferIdAsync(int offerId)
    {
        var logs = await _auditLogRepository.GetByOfferIdAsync(offerId);
        var result = await EnrichWithUserNamesAsync(logs);
        return ApiResponseDto<IEnumerable<AuditLogResponseDto>>.Ok(result);
    }

    public async Task<ApiResponseDto<IEnumerable<AuditLogResponseDto>>> GetByUserIdAsync(int userId)
    {
        var logs = await _auditLogRepository.GetByUserIdAsync(userId);
        var result = await EnrichWithUserNamesAsync(logs);
        return ApiResponseDto<IEnumerable<AuditLogResponseDto>>.Ok(result);
    }

    public async Task<ApiResponseDto<IEnumerable<AuditLogResponseDto>>> GetByDateRangeAsync(
        DateTime from, DateTime to)
    {
        var logs = await _auditLogRepository.GetByDateRangeAsync(from, to);
        var result = await EnrichWithUserNamesAsync(logs);
        return ApiResponseDto<IEnumerable<AuditLogResponseDto>>.Ok(result);
    }

    public async Task<ApiResponseDto<PagedResponseDto<AuditLogResponseDto>>> GetAllAsync(
        int pageNumber, int pageSize)
    {
        var logs = await _auditLogRepository.GetAllAsync(pageNumber, pageSize);
        var enriched = await EnrichWithUserNamesAsync(logs);

        var result = new PagedResponseDto<AuditLogResponseDto>
        {
            Data       = enriched.ToList(),
            PageNumber = pageNumber,
            PageSize   = pageSize
        };

        return ApiResponseDto<PagedResponseDto<AuditLogResponseDto>>.Ok(result);
    }

    private async Task<IEnumerable<AuditLogResponseDto>> EnrichWithUserNamesAsync(
        IEnumerable<AuditLog> logs)
    {
        var dtoList   = new List<AuditLogResponseDto>();
        var userCache = new Dictionary<int, string>();

        foreach (var log in logs)
        {
            if (!userCache.TryGetValue(log.PerformedByUserId, out var fullName))
            {
                var user = await _userRepository.GetByUserIdAsync(log.PerformedByUserId);
                fullName = user?.FullName ?? $"User#{log.PerformedByUserId}";
                userCache[log.PerformedByUserId] = fullName;
            }

            var dto = log.Adapt<AuditLogResponseDto>();
            dto.PerformedByUserName = fullName;
            dtoList.Add(dto);
        }

        return dtoList;
    }
}
