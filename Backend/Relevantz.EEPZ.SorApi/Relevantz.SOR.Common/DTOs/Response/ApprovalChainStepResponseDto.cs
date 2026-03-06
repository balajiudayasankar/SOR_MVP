namespace Relevantz.SOR.Common.DTOs.Response;

public class ApprovalChainStepResponseDto
{
    public int ApprovalChainStepId { get; set; }
    public int StepOrder { get; set; }
    public string Role { get; set; } = null!;
    public int AssignedUserId { get; set; }
    public string AssignedUserName { get; set; } = null!;
    public bool IsMandatory { get; set; }
}
