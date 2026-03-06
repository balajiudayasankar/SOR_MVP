using System;
using Relevantz.SOR.Common.Enums;

namespace Relevantz.SOR.Common.Entities;

public partial class Candidate
{
    public int CandidateId { get; set; }
    public string CandidateName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string Phone { get; set; } = null!;
    public string? Address { get; set; }
    public CandidateStage CurrentStage { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public int CreatedByUserId { get; set; }
    public int? UpdatedByUserId { get; set; }

    public virtual ICollection<Offer> Offers { get; set; } = new List<Offer>();
}
