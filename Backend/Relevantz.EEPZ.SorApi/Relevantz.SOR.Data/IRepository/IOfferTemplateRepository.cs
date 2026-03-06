using Relevantz.SOR.Common.Entities;
using Relevantz.SOR.Common.Enums;

namespace Relevantz.SOR.Data.IRepository;

public interface IOfferTemplateRepository
{
    Task<OfferTemplate?> GetByIdAsync(int templateId);
    Task<OfferTemplate?> GetDefaultByTypeAsync(OfferType offerType);
    Task<IEnumerable<OfferTemplate>> GetAllActiveAsync();
    Task AddAsync(OfferTemplate template);
    Task UpdateAsync(OfferTemplate template);
    Task DeleteAsync(int templateId);
}
