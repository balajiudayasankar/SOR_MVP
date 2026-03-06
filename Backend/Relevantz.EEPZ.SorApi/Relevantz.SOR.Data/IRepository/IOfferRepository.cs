using Relevantz.SOR.Common.Entities;
using Relevantz.SOR.Common.Enums;

namespace Relevantz.SOR.Data.IRepository;

public interface IOfferRepository
{
    Task<Offer?> GetByIdAsync(int offerId);
    Task<Offer?> GetWithDetailsAsync(int offerId);
    Task<IEnumerable<Offer>> GetByCandidateIdAsync(int candidateId);
    Task<IEnumerable<Offer>> GetByStatusAsync(OfferStatus status);
    Task<IEnumerable<Offer>> GetAllActiveAsync();
    Task<IEnumerable<Offer>> GetAllActiveWithWorkflowAsync(); // ✅ NEW
    Task AddAsync(Offer offer);
    Task UpdateAsync(Offer offer);
    Task<bool> ExistsAsync(int offerId);
    Task<bool> HasActiveOfferOfTypeAsync(int candidateId, OfferType offerType);
}
