using System;

namespace Relevantz.SOR.Common.Entities;

public partial class AuditLog
{
    public int AuditLogId { get; set; }
    public string EntityType { get; set; } = null!;
    public int EntityId { get; set; }
    public string Action { get; set; } = null!;
    public int PerformedByUserId { get; set; }
    public DateTime PerformedAt { get; set; }
    public string? OldValues { get; set; }
    public string? NewValues { get; set; }
    public string? IpAddress { get; set; }
    public int? OfferId { get; set; }

    public virtual Offer? Offer { get; set; }
}
