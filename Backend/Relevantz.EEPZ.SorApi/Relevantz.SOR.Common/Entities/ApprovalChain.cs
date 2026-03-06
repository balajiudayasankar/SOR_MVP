using System;

namespace Relevantz.SOR.Common.Entities;

public partial class ApprovalChain
{
    public int ApprovalChainId { get; set; }
    public string ChainName { get; set; } = null!;
    public int DepartmentId { get; set; }
    public bool IsDefault { get; set; } = false;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public int CreatedByUserId { get; set; }

    public virtual ICollection<ApprovalChainStep> Steps { get; set; } = new List<ApprovalChainStep>();
}
