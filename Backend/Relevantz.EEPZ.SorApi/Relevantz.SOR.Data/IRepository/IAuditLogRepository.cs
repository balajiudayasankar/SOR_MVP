using Relevantz.SOR.Common.Entities;

namespace Relevantz.SOR.Data.IRepository;

public interface IAuditLogRepository
{
    Task AddAsync(AuditLog auditLog);
    Task<IEnumerable<AuditLog>> GetByOfferIdAsync(int offerId);
    Task<IEnumerable<AuditLog>> GetByUserIdAsync(int userId);
    Task<IEnumerable<AuditLog>> GetByEntityTypeAsync(string entityType);
    Task<IEnumerable<AuditLog>> GetByDateRangeAsync(DateTime from, DateTime to);
    Task<IEnumerable<AuditLog>> GetAllAsync(int pageNumber, int pageSize);
}
