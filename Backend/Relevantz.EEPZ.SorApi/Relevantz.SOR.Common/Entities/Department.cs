using System;
using System.Collections.Generic;

namespace Relevantz.SOR.Common.Entities;

// Reference entity — maps to Relevantz.EEPZ Department table (read-only)
public partial class Department
{
    public int DepartmentId { get; set; }
    public string DepartmentName { get; set; } = null!;
    public string DepartmentCode { get; set; } = null!;
    public string? Description { get; set; }
    public string Status { get; set; } = null!;
    public int? ParentDepartmentId { get; set; }
    public int? HodEmployeeId { get; set; }
    public decimal? BudgetAllocated { get; set; }
    public string? CostCenter { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
