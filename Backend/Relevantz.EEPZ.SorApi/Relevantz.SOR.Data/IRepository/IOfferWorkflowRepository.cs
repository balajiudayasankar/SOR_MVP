using Relevantz.SOR.Common.Entities;

namespace Relevantz.SOR.Data.IRepository;

public interface IOfferWorkflowRepository
{
    Task<OfferWorkflow?> GetByIdAsync(int workflowId);
    Task<OfferWorkflow?> GetByOfferIdAsync(int offerId);
    Task<OfferWorkflow?> GetWithStepsAsync(int workflowId);
    Task AddAsync(OfferWorkflow workflow);
    Task UpdateAsync(OfferWorkflow workflow);
    Task<List<OfferWorkflow>> GetActivePendingForUserAsync(int approverUserId);
}
