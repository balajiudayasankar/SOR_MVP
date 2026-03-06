using Relevantz.SOR.Common.Entities;

namespace Relevantz.SOR.Data.IRepository;

public interface INotificationRepository
{
    Task AddAsync(Notification notification);
    Task AddRangeAsync(IEnumerable<Notification> notifications);
    Task<IEnumerable<Notification>> GetByRecipientAsync(int userId, int days = 30);
    Task<int> GetUnreadCountAsync(int userId);
    Task MarkAsReadAsync(int notificationId);
    Task MarkAllAsReadAsync(int userId);
    Task<Notification?> GetByIdAsync(int notificationId);
}
