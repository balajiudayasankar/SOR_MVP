using System;
using System.Collections.Generic;

namespace Relevantz.SOR.Common.Entities;

// Reference entity — maps to Relevantz.EEPZ Role table (read-only)
public partial class Role
{
    public int RoleId { get; set; }
    public string RoleName { get; set; } = null!;
    public string RoleCode { get; set; } = null!;
    public string? Description { get; set; }
    public bool? IsSystemRole { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
