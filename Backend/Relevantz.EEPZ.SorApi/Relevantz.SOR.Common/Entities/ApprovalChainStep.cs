using Relevantz.SOR.Common.Enums;

namespace Relevantz.SOR.Common.Entities;

public partial class ApprovalChainStep
{
    public int ApprovalChainStepId { get; set; }
    public int ApprovalChainId { get; set; }
    public int StepOrder { get; set; }
    public WorkflowRole Role { get; set; }
    public int AssignedUserId { get; set; }
    public bool IsMandatory { get; set; } = true;

    public virtual ApprovalChain ApprovalChain { get; set; } = null!;
}
