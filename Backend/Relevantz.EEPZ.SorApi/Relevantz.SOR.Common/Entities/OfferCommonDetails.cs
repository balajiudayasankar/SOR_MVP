using System;

namespace Relevantz.SOR.Common.Entities;

public partial class OfferCommonDetails
{
    public int OfferCommonDetailsId { get; set; }
    public int OfferId { get; set; }

    // Candidate Info
    public string CandidateName { get; set; } = null!;
    public string CandidateEmail { get; set; } = null!;
    public string CandidatePhone { get; set; } = null!;
    public string? CandidateAddress { get; set; }

    // Job Info
    public string Designation { get; set; } = null!;
    public string Department { get; set; } = null!;
    public string WorkLocation { get; set; } = null!;
    public string ReportingManager { get; set; } = null!;

    // Dates
    public DateOnly OfferIssueDate { get; set; }
    public DateOnly JoiningDate { get; set; }

    // Work Schedule
    public string WorkingDays { get; set; } = null!;
    public string WorkingHours { get; set; } = null!;
    public decimal WeeklyHours { get; set; }

    // Company / HR
    public string CompanyName { get; set; } = null!;
    public string HrContactName { get; set; } = null!;
    public string HrEmail { get; set; } = null!;
    public string HrPhone { get; set; } = null!;

    // Signatory
    public string SignatoryName { get; set; } = null!;
    public string SignatoryDesignation { get; set; } = null!;
    public string? SignatorySignatureImagePath { get; set; }

    // Legal
    public bool ConfidentialityClause { get; set; } = true;
    public string? CompanyPolicyText { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public virtual Offer Offer { get; set; } = null!;
}
