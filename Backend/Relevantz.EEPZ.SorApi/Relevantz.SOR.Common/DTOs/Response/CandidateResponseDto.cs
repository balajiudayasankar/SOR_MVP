using Relevantz.SOR.Common.Enums;

namespace Relevantz.SOR.Common.DTOs.Response;

public class CandidateResponseDto
{
    public int CandidateId { get; set; }
    public string CandidateName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string Phone { get; set; } = null!;
    public string? Address { get; set; }
    public string CurrentStage { get; set; } = null!;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}
