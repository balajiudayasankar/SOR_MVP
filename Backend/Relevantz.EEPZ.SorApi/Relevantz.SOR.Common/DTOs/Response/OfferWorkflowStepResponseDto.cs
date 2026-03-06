namespace Relevantz.SOR.Common.DTOs.Response;

public class OfferWorkflowStepResponseDto
{
    public int OfferWorkflowStepId { get; set; }
    public int StepOrder { get; set; }
    public string Role { get; set; } = null!;
    public int ApproverUserId { get; set; }
    public string ApproverName { get; set; } = null!;
    public string Status { get; set; } = null!;
    public string? Comments { get; set; }
    public bool IsSkipped { get; set; }
    public string? SkipJustification { get; set; }
    public DateTime? ActionDate { get; set; }
}
