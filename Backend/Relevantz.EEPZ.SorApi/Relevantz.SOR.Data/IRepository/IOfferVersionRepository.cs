using Relevantz.SOR.Common.Entities;

namespace Relevantz.SOR.Data.IRepository;

public interface IOfferVersionRepository
{
    Task AddAsync(OfferVersion version);
    Task<IEnumerable<OfferVersion>> GetByOfferIdAsync(int offerId);
    Task<OfferVersion?> GetByIdAsync(int versionId);
}
