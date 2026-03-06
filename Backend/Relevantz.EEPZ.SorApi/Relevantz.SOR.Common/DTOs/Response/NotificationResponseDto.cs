namespace Relevantz.SOR.Common.DTOs.Response;

public class NotificationResponseDto
{
    public int NotificationId { get; set; }
    public string Title { get; set; } = null!;
    public string Message { get; set; } = null!;
    public string NotificationType { get; set; } = null!;
    public bool IsRead { get; set; }
    public int? OfferId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ReadAt { get; set; }
}
