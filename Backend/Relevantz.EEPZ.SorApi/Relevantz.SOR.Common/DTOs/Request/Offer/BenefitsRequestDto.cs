namespace Relevantz.SOR.Common.DTOs.Request.Offer;

public class BenefitsRequestDto
{
    public bool InsuranceEnabled { get; set; }
    public decimal? InsuranceAmount { get; set; }
    public string? InsurancePlan { get; set; }
    public bool PfEligibility { get; set; }
    public bool GratuityEligibility { get; set; }
    public string? LeaveEntitlement { get; set; }
    public bool AccommodationAvailable { get; set; }
    public decimal? AccommodationCost { get; set; }
    public string? OtherBenefits { get; set; }
}
