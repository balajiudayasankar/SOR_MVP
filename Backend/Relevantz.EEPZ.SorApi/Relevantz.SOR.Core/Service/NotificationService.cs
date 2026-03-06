using Mapster;
using Relevantz.SOR.Common.Constants;
using Relevantz.SOR.Common.DTOs.Request.Notification;
using Relevantz.SOR.Common.DTOs.Response;
using Relevantz.SOR.Common.Enums;
using Relevantz.SOR.Common.Utils;
using Relevantz.SOR.Core.IService;
using Relevantz.SOR.Data.IRepository;

namespace Relevantz.SOR.Core.Service;

public class NotificationService : INotificationService
{
    private readonly INotificationRepository _notificationRepository;

    public NotificationService(INotificationRepository notificationRepository)
        => _notificationRepository = notificationRepository;

    public async Task<ApiResponseDto<IEnumerable<NotificationResponseDto>>> GetMyNotificationsAsync(int userId)
    {
        var notifications = await _notificationRepository.GetByRecipientAsync(
            userId, NotificationConstants.HistoryDays);
        return ApiResponseDto<IEnumerable<NotificationResponseDto>>.Ok(
            notifications.Adapt<IEnumerable<NotificationResponseDto>>());
    }

    public async Task<ApiResponseDto<int>> GetUnreadCountAsync(int userId)
    {
        var count = await _notificationRepository.GetUnreadCountAsync(userId);
        return ApiResponseDto<int>.Ok(count);
    }

    public async Task<ApiResponseDto<bool>> MarkAsReadAsync(MarkNotificationReadRequestDto dto, int userId)
    {
        if (dto.MarkAll)
        {
            await _notificationRepository.MarkAllAsReadAsync(userId);
        }
        else if (dto.NotificationIds != null)
        {
            foreach (var id in dto.NotificationIds)
                await _notificationRepository.MarkAsReadAsync(id);
        }

        return ApiResponseDto<bool>.Ok(true, NotificationMessages.MarkedRead);
    }

    public async Task SendAsync(int recipientUserId, string title, string message,
        NotificationType type, int? offerId = null)
    {
        var notification = NotificationHelper.Build(recipientUserId, title, message, type, offerId);
        await _notificationRepository.AddAsync(notification);
    }

    public async Task SendToMultipleAsync(IEnumerable<int> recipientUserIds, string title,
        string message, NotificationType type, int? offerId = null)
    {
        var notifications = recipientUserIds.Select(uid =>
            NotificationHelper.Build(uid, title, message, type, offerId));
        await _notificationRepository.AddRangeAsync(notifications);
    }
}
