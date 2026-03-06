using System;

namespace Relevantz.SOR.Common.Entities;

// Reference entity — maps to Relevantz.EEPZ UserId (Userauthentication.UserId)
// Used for CreatedBy, ApproverUserId, RecipientUserId references
public partial class User
{
    public int UserId { get; set; }
    public int EmployeeId { get; set; }
    public string Email { get; set; } = null!;
    public string FullName { get; set; } = null!;
    public string RoleName { get; set; } = null!;
    public int DepartmentId { get; set; }
    public bool IsActive { get; set; }
}
