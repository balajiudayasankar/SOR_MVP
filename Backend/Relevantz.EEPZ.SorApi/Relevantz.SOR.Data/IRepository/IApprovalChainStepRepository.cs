using Relevantz.SOR.Common.Entities;

namespace Relevantz.SOR.Data.IRepository;

public interface IApprovalChainStepRepository
{
    Task<IEnumerable<ApprovalChainStep>> GetByChainIdAsync(int chainId);
    Task AddRangeAsync(IEnumerable<ApprovalChainStep> steps);
    Task DeleteByChainIdAsync(int chainId);
}
