using Microsoft.EntityFrameworkCore;
using Relevantz.SOR.Common.Entities;
using Relevantz.SOR.Common.Enums;
using Relevantz.SOR.Data.DBContexts;
using Relevantz.SOR.Data.IRepository;

namespace Relevantz.SOR.Data.Repository;

public class OfferWorkflowStepRepository : IOfferWorkflowStepRepository
{
    private readonly SORDbContext _context;

    public OfferWorkflowStepRepository(SORDbContext context) => _context = context;

    public async Task<OfferWorkflowStep?> GetByIdAsync(int stepId) =>
        await _context.OfferWorkflowSteps.FirstOrDefaultAsync(s => s.OfferWorkflowStepId == stepId);

    public async Task<IEnumerable<OfferWorkflowStep>> GetByWorkflowIdAsync(int workflowId) =>
        await _context.OfferWorkflowSteps
            .Where(s => s.OfferWorkflowId == workflowId)
            .OrderBy(s => s.StepOrder)
            .ToListAsync();

    public async Task<IEnumerable<OfferWorkflowStep>> GetPendingByApproverAsync(int approverUserId) =>
        await _context.OfferWorkflowSteps
            .Where(s => s.ApproverUserId == approverUserId && s.Status == ApprovalStepStatus.Pending)
            .ToListAsync();

    public async Task AddAsync(OfferWorkflowStep step)
    {
        step.CreatedAt = DateTime.UtcNow;
        await _context.OfferWorkflowSteps.AddAsync(step);
        await _context.SaveChangesAsync();
    }

    public async Task AddRangeAsync(IEnumerable<OfferWorkflowStep> steps)
    {
        var now = DateTime.UtcNow;
        foreach (var s in steps) s.CreatedAt = now;
        await _context.OfferWorkflowSteps.AddRangeAsync(steps);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(OfferWorkflowStep step)
    {
        step.UpdatedAt = DateTime.UtcNow;
        _context.OfferWorkflowSteps.Update(step);
        await _context.SaveChangesAsync();
    }
}
