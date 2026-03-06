using System;
using Relevantz.SOR.Common.Enums;

namespace Relevantz.SOR.Common.DTOs.Request.Offer;

public class InternshipDetailsRequestDto
{
    public DateOnly InternshipStartDate { get; set; }
    public DateOnly InternshipEndDate { get; set; }
    public int DurationMonths { get; set; }
    public decimal StipendAmount { get; set; }
    public PayFrequency PayFrequency { get; set; }
    public string? PaymentTiming { get; set; }
    public string? TrainingLocation { get; set; }
    public string? TrainingInstitution { get; set; }
    public string? TrainingDuration { get; set; }
    public string? TrainingWorkingDays { get; set; }
    public string? RequiredDocuments { get; set; }
    public bool InsuranceEnabled { get; set; }
    public decimal? InsuranceAmount { get; set; }
    public string? OtherBenefits { get; set; }
    public decimal? FullTimeSalaryAfterInternship { get; set; }
    public decimal? JoiningBonus { get; set; }
    public decimal? RetentionBonus { get; set; }
    public int? ServiceAgreementDurationMonths { get; set; }
    public string? ServiceAgreementPeriod { get; set; }
    public string? CertificateRetentionTerms { get; set; }
    public decimal? BreakageCharges { get; set; }
    public bool AccommodationAvailable { get; set; }
    public decimal? AccommodationCost { get; set; }
}
