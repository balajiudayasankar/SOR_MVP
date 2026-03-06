using Relevantz.SOR.Common.Enums;

namespace Relevantz.SOR.Common.DTOs.Request.ApprovalChain;

public class ApprovalChainStepRequestDto
{
    public int StepOrder { get; set; }
    public WorkflowRole Role { get; set; }
    public int AssignedUserId { get; set; }
    public bool IsMandatory { get; set; } = true;
}
