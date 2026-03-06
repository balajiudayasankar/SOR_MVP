namespace Relevantz.SOR.Common.DTOs.Request.Candidate;

public class CreateCandidateRequestDto
{
    public string CandidateName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string Phone { get; set; } = null!;
    public string? Address { get; set; }
}
