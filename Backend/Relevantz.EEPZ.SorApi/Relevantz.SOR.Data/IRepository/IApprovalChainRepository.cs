using Relevantz.SOR.Common.Entities;

namespace Relevantz.SOR.Data.IRepository;

public interface IApprovalChainRepository
{
    Task<ApprovalChain?> GetByIdAsync(int chainId);
    Task<ApprovalChain?> GetWithStepsAsync(int chainId);
    Task<IEnumerable<ApprovalChain>> GetByDepartmentIdAsync(int departmentId);
    Task<ApprovalChain?> GetDefaultByDepartmentAsync(int departmentId);
    Task AddAsync(ApprovalChain chain);
    Task UpdateAsync(ApprovalChain chain);
    Task DeleteAsync(int chainId);
}
