using Relevantz.SOR.Common.Entities;

namespace Relevantz.SOR.Data.IRepository;

public interface IFinanceBudgetRepository
{
    Task<FinanceBudget?> GetByDepartmentAndYearAsync(int departmentId, int fiscalYear);
    Task<IEnumerable<FinanceBudget>> GetByDepartmentAsync(int departmentId);
    Task AddAsync(FinanceBudget budget);
    Task UpdateAsync(FinanceBudget budget);
}
