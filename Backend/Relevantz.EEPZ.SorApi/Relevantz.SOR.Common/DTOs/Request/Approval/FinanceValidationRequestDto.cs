namespace Relevantz.SOR.Common.DTOs.Request.Approval;

public class FinanceValidationRequestDto
{
    public int WorkflowStepId { get; set; }
    public string? BudgetNotes { get; set; }
    public bool IsApproved { get; set; }
    public string? Comments { get; set; }
}
