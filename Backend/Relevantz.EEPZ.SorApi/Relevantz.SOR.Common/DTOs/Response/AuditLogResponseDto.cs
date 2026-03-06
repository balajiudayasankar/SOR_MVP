namespace Relevantz.SOR.Common.DTOs.Response;

public class AuditLogResponseDto
{
    public int AuditLogId { get; set; }
    public string EntityType { get; set; } = null!;
    public int EntityId { get; set; }
    public string Action { get; set; } = null!;
    public int PerformedByUserId { get; set; }
    public string PerformedByUserName { get; set; } = null!;
    public DateTime PerformedAt { get; set; }
    public string? OldValues { get; set; }
    public string? NewValues { get; set; }
    public int? OfferId { get; set; }
}
