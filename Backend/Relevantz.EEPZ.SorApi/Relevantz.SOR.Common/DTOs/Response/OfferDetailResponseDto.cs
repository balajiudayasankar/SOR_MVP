using Relevantz.SOR.Common.Enums;

namespace Relevantz.SOR.Common.DTOs.Response;

public class OfferDetailResponseDto
{
    public int OfferId { get; set; }
    public string OfferNumber { get; set; } = null!;
    public int CandidateId { get; set; }
    public string CandidateName { get; set; } = null!;
    public string OfferType { get; set; } = null!;
    public string Status { get; set; } = null!;
    public int Version { get; set; }
    public OfferCommonDetailsResponseDto? CommonDetails { get; set; }
    public InternshipDetailsResponseDto? InternshipDetails { get; set; }
    public FullTimeDetailsResponseDto? FullTimeDetails { get; set; }
    public OfferWorkflowResponseDto? Workflow { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class OfferCommonDetailsResponseDto
{
    public string CandidateName { get; set; } = null!;
    public string CandidateEmail { get; set; } = null!;
    public string CandidatePhone { get; set; } = null!;
    public string? CandidateAddress { get; set; }
    public string Designation { get; set; } = null!;
    public string Department { get; set; } = null!;
    public string WorkLocation { get; set; } = null!;
    public string ReportingManager { get; set; } = null!;
    public DateOnly OfferIssueDate { get; set; }
    public DateOnly JoiningDate { get; set; }
    public string WorkingDays { get; set; } = null!;
    public string WorkingHours { get; set; } = null!;
    public decimal WeeklyHours { get; set; }
    public string CompanyName { get; set; } = null!;
    public string HrContactName { get; set; } = null!;
    public string HrEmail { get; set; } = null!;
    public string HrPhone { get; set; } = null!;
    public string SignatoryName { get; set; } = null!;
    public string SignatoryDesignation { get; set; } = null!;
    public string? SignatorySignatureImagePath { get; set; }
    public bool ConfidentialityClause { get; set; }
    public string? CompanyPolicyText { get; set; }
}

public class InternshipDetailsResponseDto
{
    public DateOnly InternshipStartDate { get; set; }
    public DateOnly InternshipEndDate { get; set; }
    public int DurationMonths { get; set; }
    public decimal StipendAmount { get; set; }
    public string PayFrequency { get; set; } = null!;
    public string? PaymentTiming { get; set; }
    public string? TrainingLocation { get; set; }
    public string? TrainingInstitution { get; set; }
    public bool InsuranceEnabled { get; set; }
    public decimal? InsuranceAmount { get; set; }
    public string? OtherBenefits { get; set; }
    public bool AccommodationAvailable { get; set; }
    public decimal? AccommodationCost { get; set; }
}

public class FullTimeDetailsResponseDto
{
    public string EmploymentType { get; set; } = null!;
    public decimal AnnualCtc { get; set; }
    public decimal BasicSalary { get; set; }
    public decimal Hra { get; set; }
    public decimal Allowances { get; set; }
    public decimal BonusOrVariablePay { get; set; }
    public decimal JoiningBonus { get; set; }
    public string? EsopDetails { get; set; }
    public string? ProbationPeriod { get; set; }
    public bool PfEligibility { get; set; }
    public bool GratuityEligibility { get; set; }
    public string? InsurancePlan { get; set; }
    public string? LeaveEntitlement { get; set; }
    public string? NoticePeriod { get; set; }
    public bool BackgroundVerificationRequired { get; set; }
    public bool NonCompeteEnabled { get; set; }
}
