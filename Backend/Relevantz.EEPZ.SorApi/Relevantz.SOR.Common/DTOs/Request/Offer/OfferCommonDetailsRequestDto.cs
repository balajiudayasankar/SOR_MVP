using System;

namespace Relevantz.SOR.Common.DTOs.Request.Offer;

public class OfferCommonDetailsRequestDto
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
    public bool ConfidentialityClause { get; set; } = true;
    public string? CompanyPolicyText { get; set; }
}
