using Relevantz.SOR.Common.Entities;
using Relevantz.SOR.Common.Enums;

namespace Relevantz.SOR.Data.IRepository;

public interface ICandidateRepository
{
    Task<Candidate?> GetByIdAsync(int candidateId);
    Task<IEnumerable<Candidate>> GetAllAsync();
    Task<IEnumerable<Candidate>> GetByStageAsync(CandidateStage stage);
    Task<Candidate?> GetByEmailAsync(string email);
    Task AddAsync(Candidate candidate);
    Task UpdateAsync(Candidate candidate);
    Task<bool> ExistsAsync(int candidateId);
}
