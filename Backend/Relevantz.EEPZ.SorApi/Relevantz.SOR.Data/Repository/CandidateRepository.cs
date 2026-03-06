using Microsoft.EntityFrameworkCore;
using Relevantz.SOR.Common.Entities;
using Relevantz.SOR.Common.Enums;
using Relevantz.SOR.Data.DBContexts;
using Relevantz.SOR.Data.IRepository;

namespace Relevantz.SOR.Data.Repository;

public class CandidateRepository : ICandidateRepository
{
    private readonly SORDbContext _context;

    public CandidateRepository(SORDbContext context) => _context = context;

    public async Task<Candidate?> GetByIdAsync(int candidateId) =>
        await _context.Candidates.FirstOrDefaultAsync(c => c.CandidateId == candidateId && c.IsActive);

    public async Task<IEnumerable<Candidate>> GetAllAsync() =>
        await _context.Candidates.Where(c => c.IsActive).ToListAsync();

    public async Task<IEnumerable<Candidate>> GetByStageAsync(CandidateStage stage) =>
        await _context.Candidates.Where(c => c.CurrentStage == stage && c.IsActive).ToListAsync();

    public async Task<Candidate?> GetByEmailAsync(string email) =>
        await _context.Candidates.FirstOrDefaultAsync(c => c.Email == email);

    public async Task AddAsync(Candidate candidate)
    {
        candidate.CreatedAt = DateTime.UtcNow;
        await _context.Candidates.AddAsync(candidate);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Candidate candidate)
    {
        candidate.UpdatedAt = DateTime.UtcNow;
        _context.Candidates.Update(candidate);
        await _context.SaveChangesAsync();
    }

    public async Task<bool> ExistsAsync(int candidateId) =>
        await _context.Candidates.AnyAsync(c => c.CandidateId == candidateId);
}
