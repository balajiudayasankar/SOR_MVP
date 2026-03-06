using Relevantz.SOR.Common.Enums;

namespace Relevantz.SOR.Common.DTOs.Request.Offer;

public class CreateOfferRequestDto
{
    public int CandidateId { get; set; }
    public OfferType OfferType { get; set; }
}
