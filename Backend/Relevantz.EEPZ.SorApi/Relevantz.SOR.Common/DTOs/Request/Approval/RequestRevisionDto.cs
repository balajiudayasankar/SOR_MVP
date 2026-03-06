namespace Relevantz.SOR.Common.DTOs.Request.Approval;

public class RequestRevisionDto
{
    public int WorkflowStepId { get; set; }
    public string RevisionReason { get; set; } = null!;
    public string? HighlightedFields { get; set; }
}
