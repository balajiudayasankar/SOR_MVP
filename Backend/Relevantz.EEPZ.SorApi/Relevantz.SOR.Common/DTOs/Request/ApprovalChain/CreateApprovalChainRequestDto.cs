using System.Collections.Generic;

namespace Relevantz.SOR.Common.DTOs.Request.ApprovalChain;

public class CreateApprovalChainRequestDto
{
    public string ChainName { get; set; } = null!;
    public int DepartmentId { get; set; }
    public bool IsDefault { get; set; }
    public List<ApprovalChainStepRequestDto> Steps { get; set; } = new();
}
