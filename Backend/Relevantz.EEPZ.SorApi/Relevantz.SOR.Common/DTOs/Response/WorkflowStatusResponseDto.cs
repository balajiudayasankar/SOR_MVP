namespace Relevantz.SOR.Common.DTOs.Response;

public class WorkflowStatusResponseDto
{
    public int OfferId { get; set; }
    public string OfferNumber { get; set; } = null!;
    public string CandidateName { get; set; } = null!;
    public string OfferStatus { get; set; } = null!;
    public string WorkflowStatus { get; set; } = null!;
    public int CurrentStep { get; set; }
    public int TotalSteps { get; set; }
    public string CurrentApproverRole { get; set; } = null!;
    public string CurrentApproverName { get; set; } = null!;
    public bool HasBottleneck { get; set; }
}
