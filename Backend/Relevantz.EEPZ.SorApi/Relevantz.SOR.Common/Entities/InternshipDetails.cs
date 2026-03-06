using System;
using Relevantz.SOR.Common.Enums;

namespace Relevantz.SOR.Common.Entities;

public partial class InternshipDetails
{
    public int InternshipDetailsId { get; set; }
    public int OfferId { get; set; }

    // Duration
    public DateOnly InternshipStartDate { get; set; }
    public DateOnly InternshipEndDate { get; set; }
    public int DurationMonths { get; set; }

    // Stipend
    public decimal StipendAmount { get; set; }
    public PayFrequency PayFrequency { get; set; }
    public string? PaymentTiming { get; set; }

    // Training
    public string? TrainingLocation { get; set; }
    public string? TrainingInstitution { get; set; }
    public string? TrainingDuration { get; set; }
    public string? TrainingWorkingDays { get; set; }

    // Documents
    public string? RequiredDocuments { get; set; }

    // Benefits
    public bool InsuranceEnabled { get; set; } = false;
    public decimal? InsuranceAmount { get; set; }
    public string? OtherBenefits { get; set; }

    // Post-Internship
    public decimal? FullTimeSalaryAfterInternship { get; set; }
    public decimal? JoiningBonus { get; set; }
    public decimal? RetentionBonus { get; set; }
    public int? ServiceAgreementDurationMonths { get; set; }

    // Agreement
    public string? ServiceAgreementPeriod { get; set; }
    public string? CertificateRetentionTerms { get; set; }
    public decimal? BreakageCharges { get; set; }

    // Accommodation
    public bool AccommodationAvailable { get; set; } = false;
    public decimal? AccommodationCost { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public virtual Offer Offer { get; set; } = null!;
}
