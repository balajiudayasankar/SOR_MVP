using Relevantz.SOR.Common.DTOs.Request.Notification;
using Relevantz.SOR.Common.DTOs.Response;
using Relevantz.SOR.Common.Enums;

namespace Relevantz.SOR.Core.IService;

public interface INotificationService
{
    Task<ApiResponseDto<IEnumerable<NotificationResponseDto>>> GetMyNotificationsAsync(int userId);
    Task<ApiResponseDto<int>> GetUnreadCountAsync(int userId);
    Task<ApiResponseDto<bool>> MarkAsReadAsync(MarkNotificationReadRequestDto dto, int userId);
    Task SendAsync(int recipientUserId, string title, string message, NotificationType type, int? offerId = null);
    Task SendToMultipleAsync(IEnumerable<int> recipientUserIds, string title, string message, NotificationType type, int? offerId = null);
}
