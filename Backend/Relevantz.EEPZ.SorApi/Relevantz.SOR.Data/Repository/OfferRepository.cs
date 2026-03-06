using Microsoft.EntityFrameworkCore;
using Relevantz.SOR.Common.Entities;
using Relevantz.SOR.Common.Enums;
using Relevantz.SOR.Data.DBContexts;
using Relevantz.SOR.Data.IRepository;

namespace Relevantz.SOR.Data.Repository;

public class OfferRepository : IOfferRepository
{
    private readonly SORDbContext _context;

    public OfferRepository(SORDbContext context) => _context = context;

    public async Task<Offer?> GetByIdAsync(int offerId) =>
        await _context.Offers.FirstOrDefaultAsync(o => o.OfferId == offerId && o.IsActive);

    public async Task<Offer?> GetWithDetailsAsync(int offerId) =>
        await _context.Offers
            .Include(o => o.Candidate)
            .Include(o => o.OfferCommonDetails)
            .Include(o => o.InternshipDetails)
            .Include(o => o.FullTimeDetails)
            .Include(o => o.OfferWorkflow).ThenInclude(w => w!.Steps)
            .FirstOrDefaultAsync(o => o.OfferId == offerId && o.IsActive);

    public async Task<IEnumerable<Offer>> GetByCandidateIdAsync(int candidateId) =>
        await _context.Offers
            .Where(o => o.CandidateId == candidateId && o.IsActive)
            .ToListAsync();

    public async Task<IEnumerable<Offer>> GetByStatusAsync(OfferStatus status) =>
        await _context.Offers
            .Include(o => o.Candidate)
            .Where(o => o.Status == status && o.IsActive)
            .ToListAsync();

    public async Task<IEnumerable<Offer>> GetAllActiveAsync() =>
        await _context.Offers
            .Include(o => o.Candidate)
            .Where(o => o.IsActive)
            .ToListAsync();
    public async Task<IEnumerable<Offer>> GetAllActiveWithWorkflowAsync() =>
        await _context.Offers
            .Include(o => o.Candidate)
            .Include(o => o.OfferCommonDetails)
            .Include(o => o.OfferWorkflow).ThenInclude(w => w!.Steps)
            .Where(o => o.IsActive)
            .ToListAsync();

    public async Task AddAsync(Offer offer)
    {
        offer.CreatedAt = DateTime.UtcNow;
        await _context.Offers.AddAsync(offer);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Offer offer)
    {
        offer.UpdatedAt = DateTime.UtcNow;
        _context.Offers.Update(offer);
        await _context.SaveChangesAsync();
    }

    public async Task<bool> ExistsAsync(int offerId) =>
        await _context.Offers.AnyAsync(o => o.OfferId == offerId && o.IsActive);

    public async Task<bool> HasActiveOfferOfTypeAsync(int candidateId, OfferType offerType) =>
        await _context.Offers.AnyAsync(o =>
            o.CandidateId == candidateId &&
            o.OfferType == offerType &&
            o.IsActive);
}
