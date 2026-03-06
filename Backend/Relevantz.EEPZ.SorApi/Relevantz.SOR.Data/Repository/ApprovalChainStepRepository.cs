using Microsoft.EntityFrameworkCore;
using Relevantz.SOR.Common.Entities;
using Relevantz.SOR.Data.DBContexts;
using Relevantz.SOR.Data.IRepository;

namespace Relevantz.SOR.Data.Repository;

public class ApprovalChainStepRepository : IApprovalChainStepRepository
{
    private readonly SORDbContext _context;

    public ApprovalChainStepRepository(SORDbContext context) => _context = context;

    public async Task<IEnumerable<ApprovalChainStep>> GetByChainIdAsync(int chainId) =>
        await _context.ApprovalChainSteps
            .Where(s => s.ApprovalChainId == chainId)
            .OrderBy(s => s.StepOrder)
            .ToListAsync();

    public async Task AddRangeAsync(IEnumerable<ApprovalChainStep> steps)
    {
        await _context.ApprovalChainSteps.AddRangeAsync(steps);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteByChainIdAsync(int chainId)
    {
        var steps = _context.ApprovalChainSteps.Where(s => s.ApprovalChainId == chainId);
        _context.ApprovalChainSteps.RemoveRange(steps);
        await _context.SaveChangesAsync();
    }
}
