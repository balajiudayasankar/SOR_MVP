namespace Relevantz.SOR.Common.DTOs.Request.Approval;

public class RejectOfferRequestDto
{
    public int WorkflowStepId { get; set; }
    public string Comments { get; set; } = null!;
}
