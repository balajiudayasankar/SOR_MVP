using System;
using Relevantz.SOR.Common.Enums;

namespace Relevantz.SOR.Common.Entities;

public partial class OfferWorkflowStep
{
    public int OfferWorkflowStepId { get; set; }
    public int OfferWorkflowId { get; set; }
    public int StepOrder { get; set; }
    public WorkflowRole Role { get; set; }
    public int ApproverUserId { get; set; }
    public ApprovalStepStatus Status { get; set; }
    public string? Comments { get; set; }
    public bool IsSkipped { get; set; } = false;
    public string? SkipJustification { get; set; }
    public DateTime? ActionDate { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public virtual OfferWorkflow OfferWorkflow { get; set; } = null!;
}
