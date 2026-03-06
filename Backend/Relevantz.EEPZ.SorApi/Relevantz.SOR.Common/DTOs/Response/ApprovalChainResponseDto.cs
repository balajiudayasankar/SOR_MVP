using System.Collections.Generic;

namespace Relevantz.SOR.Common.DTOs.Response;

public class ApprovalChainResponseDto
{
    public int ApprovalChainId { get; set; }
    public string ChainName { get; set; } = null!;
    public int DepartmentId { get; set; }
    public bool IsDefault { get; set; }
    public bool IsActive { get; set; }
    public List<ApprovalChainStepResponseDto> Steps { get; set; } = new();
    public DateTime CreatedAt { get; set; }
}
