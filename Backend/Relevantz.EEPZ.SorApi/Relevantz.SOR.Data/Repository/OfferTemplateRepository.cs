using Microsoft.EntityFrameworkCore;
using Relevantz.SOR.Common.Entities;
using Relevantz.SOR.Common.Enums;
using Relevantz.SOR.Data.DBContexts;
using Relevantz.SOR.Data.IRepository;

namespace Relevantz.SOR.Data.Repository;

public class OfferTemplateRepository : IOfferTemplateRepository
{
    private readonly SORDbContext _context;

    public OfferTemplateRepository(SORDbContext context) => _context = context;

    public async Task<OfferTemplate?> GetByIdAsync(int templateId) =>
        await _context.OfferTemplates.FirstOrDefaultAsync(t => t.OfferTemplateId == templateId && t.IsActive);

    public async Task<OfferTemplate?> GetDefaultByTypeAsync(OfferType offerType) =>
        await _context.OfferTemplates.FirstOrDefaultAsync(t => t.OfferType == offerType && t.IsDefault && t.IsActive);

    public async Task<IEnumerable<OfferTemplate>> GetAllActiveAsync() =>
        await _context.OfferTemplates.Where(t => t.IsActive).ToListAsync();

    public async Task AddAsync(OfferTemplate template)
    {
        template.CreatedAt = DateTime.UtcNow;
        await _context.OfferTemplates.AddAsync(template);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(OfferTemplate template)
    {
        template.UpdatedAt = DateTime.UtcNow;
        _context.OfferTemplates.Update(template);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int templateId)
    {
        var template = await _context.OfferTemplates.FindAsync(templateId);
        if (template != null)
        {
            template.IsActive = false;
            template.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
    }
}
