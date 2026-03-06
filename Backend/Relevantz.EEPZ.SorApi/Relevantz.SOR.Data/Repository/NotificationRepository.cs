using Microsoft.EntityFrameworkCore;
using Relevantz.SOR.Common.Entities;
using Relevantz.SOR.Data.DBContexts;
using Relevantz.SOR.Data.IRepository;

namespace Relevantz.SOR.Data.Repository;

public class NotificationRepository : INotificationRepository
{
    private readonly SORDbContext _context;

    public NotificationRepository(SORDbContext context) => _context = context;

    public async Task AddAsync(Notification notification)
    {
        await _context.Notifications.AddAsync(notification);
        await _context.SaveChangesAsync();
    }

    public async Task AddRangeAsync(IEnumerable<Notification> notifications)
    {
        await _context.Notifications.AddRangeAsync(notifications);
        await _context.SaveChangesAsync();
    }

    public async Task<IEnumerable<Notification>> GetByRecipientAsync(int userId, int days = 30)
    {
        var cutoff = DateTime.UtcNow.AddDays(-days);
        return await _context.Notifications
            .Where(n => n.RecipientUserId == userId && n.CreatedAt >= cutoff)
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync();
    }

    public async Task<int> GetUnreadCountAsync(int userId) =>
        await _context.Notifications.CountAsync(n => n.RecipientUserId == userId && !n.IsRead);

    public async Task MarkAsReadAsync(int notificationId)
    {
        var notification = await _context.Notifications.FindAsync(notificationId);
        if (notification != null)
        {
            notification.IsRead = true;
            notification.ReadAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
    }

    public async Task MarkAllAsReadAsync(int userId)
    {
        var notifications = await _context.Notifications
            .Where(n => n.RecipientUserId == userId && !n.IsRead).ToListAsync();
        foreach (var n in notifications)
        {
            n.IsRead = true;
            n.ReadAt = DateTime.UtcNow;
        }
        await _context.SaveChangesAsync();
    }

    public async Task<Notification?> GetByIdAsync(int notificationId) =>
        await _context.Notifications.FindAsync(notificationId);
}
