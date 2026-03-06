using System;
using Relevantz.SOR.Common.Enums;

namespace Relevantz.SOR.Common.Entities;

public partial class Notification
{
    public int NotificationId { get; set; }
    public int RecipientUserId { get; set; }
    public string Title { get; set; } = null!;
    public string Message { get; set; } = null!;
    public NotificationType NotificationType { get; set; }
    public bool IsRead { get; set; } = false;
    public int? OfferId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ReadAt { get; set; }
}
