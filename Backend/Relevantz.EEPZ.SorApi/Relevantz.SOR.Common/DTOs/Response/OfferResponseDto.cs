using Relevantz.SOR.Common.Enums;

namespace Relevantz.SOR.Common.DTOs.Response;

public class OfferResponseDto
{
    public int OfferId { get; set; }
    public string OfferNumber { get; set; } = null!;
    public int CandidateId { get; set; }
    public string CandidateName { get; set; } = null!;
    public string OfferType { get; set; } = null!;
    public string Status { get; set; } = null!;
    public int Version { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
