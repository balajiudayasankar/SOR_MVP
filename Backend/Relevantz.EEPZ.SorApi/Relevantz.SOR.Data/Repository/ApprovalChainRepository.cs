using Microsoft.EntityFrameworkCore;
using Relevantz.SOR.Common.Entities;
using Relevantz.SOR.Data.DBContexts;
using Relevantz.SOR.Data.IRepository;

namespace Relevantz.SOR.Data.Repository;

public class ApprovalChainRepository : IApprovalChainRepository
{
    private readonly SORDbContext _context;

    public ApprovalChainRepository(SORDbContext context) => _context = context;

    public async Task<ApprovalChain?> GetByIdAsync(int chainId) =>
        await _context.ApprovalChains.FirstOrDefaultAsync(c => c.ApprovalChainId == chainId && c.IsActive);

    public async Task<ApprovalChain?> GetWithStepsAsync(int chainId) =>
        await _context.ApprovalChains
            .Include(c => c.Steps)
            .FirstOrDefaultAsync(c => c.ApprovalChainId == chainId && c.IsActive);

    public async Task<IEnumerable<ApprovalChain>> GetByDepartmentIdAsync(int departmentId) =>
        await _context.ApprovalChains
            .Include(c => c.Steps)
            .Where(c => c.DepartmentId == departmentId && c.IsActive)
            .ToListAsync();

    public async Task<ApprovalChain?> GetDefaultByDepartmentAsync(int departmentId) =>
        await _context.ApprovalChains
            .Include(c => c.Steps)
            .FirstOrDefaultAsync(c => c.DepartmentId == departmentId && c.IsDefault && c.IsActive);

    public async Task AddAsync(ApprovalChain chain)
    {
        chain.CreatedAt = DateTime.UtcNow;
        await _context.ApprovalChains.AddAsync(chain);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(ApprovalChain chain)
    {
        chain.UpdatedAt = DateTime.UtcNow;
        _context.ApprovalChains.Update(chain);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int chainId)
    {
        var chain = await _context.ApprovalChains.FindAsync(chainId);
        if (chain != null)
        {
            chain.IsActive = false;
            chain.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
    }
}
