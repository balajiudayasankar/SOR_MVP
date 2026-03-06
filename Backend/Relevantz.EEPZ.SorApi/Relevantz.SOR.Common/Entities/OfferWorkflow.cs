using System;
using Relevantz.SOR.Common.Enums;

namespace Relevantz.SOR.Common.Entities;

public partial class OfferWorkflow
{
    public int OfferWorkflowId { get; set; }
    public string WorkflowNumber { get; set; } = null!;
    public int OfferId { get; set; }
    public int CurrentStepIndex { get; set; } = 0;
    public WorkflowStatus Status { get; set; }
    public bool IsLocked { get; set; } = false;
    public DateTime CreatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public int CreatedByUserId { get; set; }

    public virtual Offer Offer { get; set; } = null!;
    public virtual ICollection<OfferWorkflowStep> Steps { get; set; } = new List<OfferWorkflowStep>();
}
