using Microsoft.EntityFrameworkCore;
using Relevantz.SOR.Common.Entities;
using Relevantz.SOR.Common.Enums;
using Relevantz.SOR.Data.DBContexts;
using Relevantz.SOR.Data.IRepository;

namespace Relevantz.SOR.Data.Repository;

public class OfferWorkflowRepository : IOfferWorkflowRepository
{
    private readonly SORDbContext _context;

    public OfferWorkflowRepository(SORDbContext context) => _context = context;

    public async Task<OfferWorkflow?> GetByIdAsync(int workflowId) =>
        await _context.OfferWorkflows
            .FirstOrDefaultAsync(w => w.OfferWorkflowId == workflowId);

    public async Task<OfferWorkflow?> GetByOfferIdAsync(int offerId) =>
        await _context.OfferWorkflows
            .FirstOrDefaultAsync(w => w.OfferId == offerId);

    public async Task<OfferWorkflow?> GetWithStepsAsync(int workflowId) =>
        await _context.OfferWorkflows
            .Include(w => w.Steps)
            .FirstOrDefaultAsync(w => w.OfferWorkflowId == workflowId);

    public async Task AddAsync(OfferWorkflow workflow)
    {
        workflow.CreatedAt = DateTime.UtcNow;
        await _context.OfferWorkflows.AddAsync(workflow);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(OfferWorkflow workflow)
    {
        _context.OfferWorkflows.Update(workflow);
        await _context.SaveChangesAsync();
    }

    public async Task<List<OfferWorkflow>> GetActivePendingForUserAsync(int approverUserId)
    {
        var workflows = await _context.OfferWorkflows
            .Include(w => w.Steps)
            .Include(w => w.Offer)
                .ThenInclude(o => o.Candidate)
            .Where(w =>
                w.Status == WorkflowStatus.InProgress &&
                w.Steps.Any(s =>
                    s.ApproverUserId == approverUserId &&
                    s.Status == ApprovalStepStatus.Pending &&
                    !s.IsSkipped))
            .OrderBy(w => w.CreatedAt)
            .ToListAsync();

        return workflows
            .Where(wf =>
            {
                var firstActive = wf.Steps
                    .Where(s => s.Status == ApprovalStepStatus.Pending && !s.IsSkipped)
                    .OrderBy(s => s.StepOrder)
                    .FirstOrDefault();

                return firstActive?.ApproverUserId == approverUserId;
            })
            .ToList();
    }
}
