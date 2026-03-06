namespace Relevantz.SOR.Common.DTOs.Request.Offer;

public class RegenerateOfferRequestDto
{
    public int OfferId { get; set; }
    public string RegenerateReason { get; set; } = null!;
    public int ApprovalChainId { get; set; }
}
