using Relevantz.SOR.Common.Constants;
using Relevantz.SOR.Common.Entities;

namespace Relevantz.SOR.Common.Utils;

public static class AuditHelper
{
    public static AuditLog Build(string entityType, int entityId, string action,
        int performedByUserId, int? offerId = null,
        string? oldValues = null, string? newValues = null, string? ipAddress = null)
    {
        return new AuditLog
        {
            EntityType = entityType,
            EntityId = entityId,
            Action = action,
            PerformedByUserId = performedByUserId,
            PerformedAt = DateTime.UtcNow,
            OldValues = oldValues,
            NewValues = newValues,
            IpAddress = ipAddress,
            OfferId = offerId
        };
    }
}
