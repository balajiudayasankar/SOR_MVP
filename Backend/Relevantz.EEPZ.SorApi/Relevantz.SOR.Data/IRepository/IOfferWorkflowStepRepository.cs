using Relevantz.SOR.Common.Entities;

namespace Relevantz.SOR.Data.IRepository;

public interface IOfferWorkflowStepRepository
{
    Task<OfferWorkflowStep?> GetByIdAsync(int stepId);
    Task<IEnumerable<OfferWorkflowStep>> GetByWorkflowIdAsync(int workflowId);
    Task<IEnumerable<OfferWorkflowStep>> GetPendingByApproverAsync(int approverUserId);
    Task AddAsync(OfferWorkflowStep step);
    Task AddRangeAsync(IEnumerable<OfferWorkflowStep> steps);
    Task UpdateAsync(OfferWorkflowStep step);
}
