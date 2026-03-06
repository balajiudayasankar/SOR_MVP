using Microsoft.EntityFrameworkCore;
using Relevantz.SOR.Common.Entities;
using Relevantz.SOR.Data.DBContexts;
using Relevantz.SOR.Data.IRepository;

namespace Relevantz.SOR.Data.Repository;

public class AuditLogRepository : IAuditLogRepository
{
    private readonly SORDbContext _context;

    public AuditLogRepository(SORDbContext context) => _context = context;

    public async Task AddAsync(AuditLog auditLog)
    {
        await _context.AuditLogs.AddAsync(auditLog);
        await _context.SaveChangesAsync();
    }

    public async Task<IEnumerable<AuditLog>> GetByOfferIdAsync(int offerId) =>
        await _context.AuditLogs.Where(a => a.OfferId == offerId)
            .OrderByDescending(a => a.PerformedAt).ToListAsync();

    public async Task<IEnumerable<AuditLog>> GetByUserIdAsync(int userId) =>
        await _context.AuditLogs.Where(a => a.PerformedByUserId == userId)
            .OrderByDescending(a => a.PerformedAt).ToListAsync();

    public async Task<IEnumerable<AuditLog>> GetByEntityTypeAsync(string entityType) =>
        await _context.AuditLogs.Where(a => a.EntityType == entityType)
            .OrderByDescending(a => a.PerformedAt).ToListAsync();

    public async Task<IEnumerable<AuditLog>> GetByDateRangeAsync(DateTime from, DateTime to) =>
        await _context.AuditLogs.Where(a => a.PerformedAt >= from && a.PerformedAt <= to)
            .OrderByDescending(a => a.PerformedAt).ToListAsync();

    public async Task<IEnumerable<AuditLog>> GetAllAsync(int pageNumber, int pageSize) =>
        await _context.AuditLogs
            .OrderByDescending(a => a.PerformedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
}
