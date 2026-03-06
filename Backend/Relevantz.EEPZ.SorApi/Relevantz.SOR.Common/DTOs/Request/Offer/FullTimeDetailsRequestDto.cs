using Relevantz.SOR.Common.Enums;

namespace Relevantz.SOR.Common.DTOs.Request.Offer;

public class FullTimeDetailsRequestDto
{
    public EmploymentType EmploymentType { get; set; }
    public decimal AnnualCtc { get; set; }
    public decimal BasicSalary { get; set; }
    public decimal Hra { get; set; }
    public decimal Allowances { get; set; }
    public decimal BonusOrVariablePay { get; set; }
    public decimal JoiningBonus { get; set; }
    public string? EsopDetails { get; set; }
    public string? ProbationPeriod { get; set; }
    public string? ConfirmationTerms { get; set; }
    public bool PfEligibility { get; set; }
    public bool GratuityEligibility { get; set; }
    public string? InsurancePlan { get; set; }
    public string? LeaveEntitlement { get; set; }
    public string? OtherBenefits { get; set; }
    public string? NoticePeriod { get; set; }
    public bool BackgroundVerificationRequired { get; set; }
    public bool NonCompeteEnabled { get; set; }
}
