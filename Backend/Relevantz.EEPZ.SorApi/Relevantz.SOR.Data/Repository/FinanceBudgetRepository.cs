using Microsoft.EntityFrameworkCore;
using Relevantz.SOR.Common.Entities;
using Relevantz.SOR.Data.DBContexts;
using Relevantz.SOR.Data.IRepository;

namespace Relevantz.SOR.Data.Repository;

public class FinanceBudgetRepository : IFinanceBudgetRepository
{
    private readonly SORDbContext _context;

    public FinanceBudgetRepository(SORDbContext context) => _context = context;

    public async Task<FinanceBudget?> GetByDepartmentAndYearAsync(int departmentId, int fiscalYear) =>
        await _context.FinanceBudgets
            .FirstOrDefaultAsync(b => b.DepartmentId == departmentId && b.FiscalYear == fiscalYear);

    public async Task<IEnumerable<FinanceBudget>> GetByDepartmentAsync(int departmentId) =>
        await _context.FinanceBudgets.Where(b => b.DepartmentId == departmentId).ToListAsync();

    public async Task AddAsync(FinanceBudget budget)
    {
        budget.CreatedAt = DateTime.UtcNow;
        await _context.FinanceBudgets.AddAsync(budget);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(FinanceBudget budget)
    {
        budget.UpdatedAt = DateTime.UtcNow;
        _context.FinanceBudgets.Update(budget);
        await _context.SaveChangesAsync();
    }
}
