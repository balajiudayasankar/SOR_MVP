using Relevantz.SOR.Common.Entities;
using Relevantz.SOR.Common.Enums;

namespace Relevantz.SOR.Common.Utils;

public static class NotificationHelper
{
    public static Notification Build(int recipientUserId, string title, string message,
        NotificationType type, int? offerId = null)
    {
        return new Notification
        {
            RecipientUserId = recipientUserId,
            Title = title,
            Message = message,
            NotificationType = type,
            IsRead = false,
            OfferId = offerId,
            CreatedAt = DateTime.UtcNow
        };
    }
}
