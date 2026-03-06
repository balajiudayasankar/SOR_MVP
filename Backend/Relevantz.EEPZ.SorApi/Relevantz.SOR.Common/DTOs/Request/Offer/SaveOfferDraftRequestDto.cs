using Relevantz.SOR.Common.Enums;

namespace Relevantz.SOR.Common.DTOs.Request.Offer;

public class SaveOfferDraftRequestDto
{
    public OfferCommonDetailsRequestDto? CommonDetails { get; set; }
    public InternshipDetailsRequestDto? InternshipDetails { get; set; }
    public FullTimeDetailsRequestDto? FullTimeDetails { get; set; }
}
