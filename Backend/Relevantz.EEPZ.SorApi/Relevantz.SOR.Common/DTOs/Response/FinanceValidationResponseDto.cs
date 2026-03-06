namespace Relevantz.SOR.Common.DTOs.Response;

public class FinanceValidationResponseDto
{
    public int DepartmentId { get; set; }
    public string DepartmentName { get; set; } = null!;
    public decimal TotalBudget { get; set; }
    public decimal UsedBudget { get; set; }
    public decimal RemainingBudget { get; set; }
    public decimal OfferedCtc { get; set; }
    public decimal VariancePercentage { get; set; }
    public bool IsOverBudget { get; set; }
}
