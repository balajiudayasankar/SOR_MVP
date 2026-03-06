using Microsoft.EntityFrameworkCore;
using Relevantz.SOR.Common.Entities;
using Relevantz.SOR.Data.DBContexts;
using Relevantz.SOR.Data.IRepository;

namespace Relevantz.SOR.Data.Repository;

public class OfferVersionRepository : IOfferVersionRepository
{
    private readonly SORDbContext _context;

    public OfferVersionRepository(SORDbContext context) => _context = context;

    public async Task AddAsync(OfferVersion version)
    {
        version.ArchivedAt = DateTime.UtcNow;
        await _context.OfferVersions.AddAsync(version);
        await _context.SaveChangesAsync();
    }

    public async Task<IEnumerable<OfferVersion>> GetByOfferIdAsync(int offerId) =>
        await _context.OfferVersions
            .Where(v => v.OfferId == offerId)
            .OrderByDescending(v => v.VersionNumber)
            .ToListAsync();

    public async Task<OfferVersion?> GetByIdAsync(int versionId) =>
        await _context.OfferVersions.FindAsync(versionId);
}
