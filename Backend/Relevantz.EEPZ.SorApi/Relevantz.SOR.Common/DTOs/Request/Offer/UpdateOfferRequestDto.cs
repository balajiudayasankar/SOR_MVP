using Relevantz.SOR.Common.Enums;

namespace Relevantz.SOR.Common.DTOs.Request.Offer;

public class UpdateOfferRequestDto
{
    public OfferCommonDetailsRequestDto CommonDetails { get; set; } = null!;
    public InternshipDetailsRequestDto? InternshipDetails { get; set; }
    public FullTimeDetailsRequestDto? FullTimeDetails { get; set; }
}
