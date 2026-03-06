using System;
using Relevantz.SOR.Common.Enums;

namespace Relevantz.SOR.Common.Entities;

public partial class FullTimeDetails
{
    public int FullTimeDetailsId { get; set; }
    public int OfferId { get; set; }

    // Employment
    public EmploymentType EmploymentType { get; set; }

    // Compensation
    public decimal AnnualCtc { get; set; }
    public decimal BasicSalary { get; set; }
    public decimal Hra { get; set; }
    public decimal Allowances { get; set; }
    public decimal BonusOrVariablePay { get; set; }
    public decimal JoiningBonus { get; set; }
    public string? EsopDetails { get; set; }

    // Probation
    public string? ProbationPeriod { get; set; }
    public string? ConfirmationTerms { get; set; }

    // Benefits
    public bool PfEligibility { get; set; } = false;
    public bool GratuityEligibility { get; set; } = false;
    public string? InsurancePlan { get; set; }
    public string? LeaveEntitlement { get; set; }
    public string? OtherBenefits { get; set; }

    // Notice & Terms
    public string? NoticePeriod { get; set; }
    public bool BackgroundVerificationRequired { get; set; } = false;
    public bool NonCompeteEnabled { get; set; } = false;

    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public virtual Offer Offer { get; set; } = null!;
}
