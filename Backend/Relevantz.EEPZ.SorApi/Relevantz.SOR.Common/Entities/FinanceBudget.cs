using System;

namespace Relevantz.SOR.Common.Entities;

public partial class FinanceBudget
{
    public int FinanceBudgetId { get; set; }
    public int DepartmentId { get; set; }
    public int FiscalYear { get; set; }
    public decimal TotalBudget { get; set; }
    public decimal UsedBudget { get; set; }
    public decimal RemainingBudget => TotalBudget - UsedBudget;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public int CreatedByUserId { get; set; }
}
