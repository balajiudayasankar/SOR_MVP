using System.Collections.Generic;

namespace Relevantz.SOR.Common.DTOs.Request.Notification;

public class MarkNotificationReadRequestDto
{
    public List<int>? NotificationIds { get; set; }
    public bool MarkAll { get; set; } = false;
}
