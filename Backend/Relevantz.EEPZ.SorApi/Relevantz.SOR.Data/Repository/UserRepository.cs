using Microsoft.EntityFrameworkCore;
using Relevantz.EEPZ.Data.DBContexts;        // ← EEPZ project's namespace
using Relevantz.SOR.Common.Entities;
using Relevantz.SOR.Data.IRepository;

namespace Relevantz.SOR.Data.Repository;

public class UserRepository : IUserRepository
{
    private readonly EEPZDbContext _eepzContext;   

    public UserRepository(EEPZDbContext eepzContext)
        => _eepzContext = eepzContext;

    public async Task<User?> GetByUserIdAsync(int userId)
    {
        var auth = await _eepzContext.Userauthentications
            .Include(u => u.Employee)
                .ThenInclude(e => e.Userprofile)
            .Include(u => u.Employee)
                .ThenInclude(e => e.Employeedetailsmasters)
                    .ThenInclude(edm => edm.Role)
            .Include(u => u.Employee)
                .ThenInclude(e => e.Employeedetailsmasters)
                    .ThenInclude(edm => edm.Department)
            .FirstOrDefaultAsync(u => u.UserId == userId);

        if (auth == null) return null;

        var master = auth.Employee.Employeedetailsmasters.FirstOrDefault();

        return new User
        {
            UserId       = auth.UserId,
            EmployeeId   = auth.EmployeeId,
            Email        = auth.Email,
            FullName     = $"{auth.Employee.Userprofile?.FirstName} {auth.Employee.Userprofile?.LastName}".Trim(),
            RoleName     = master?.Role?.RoleName ?? string.Empty,
            DepartmentId = master?.DepartmentId ?? 0,
            IsActive     = auth.Employee.IsActive ?? false
        };
    }

    public async Task<User?> GetByEmployeeMasterIdAsync(int employeeMasterId)
    {
        var master = await _eepzContext.Employeedetailsmasters
            .Include(edm => edm.Employee)
                .ThenInclude(e => e.Userprofile)
            .Include(edm => edm.Employee)
                .ThenInclude(e => e.Userauthentication)
            .Include(edm => edm.Role)
            .Include(edm => edm.Department)
            .FirstOrDefaultAsync(edm => edm.EmployeeMasterId == employeeMasterId);

        if (master == null) return null;

        return new User
        {
            UserId       = master.Employee.Userauthentication?.UserId ?? 0,
            EmployeeId   = master.EmployeeId,
            Email        = master.Employee.Userauthentication?.Email ?? string.Empty,
            FullName     = $"{master.Employee.Userprofile?.FirstName} {master.Employee.Userprofile?.LastName}".Trim(),
            RoleName     = master.Role?.RoleName ?? string.Empty,
            DepartmentId = master.DepartmentId,
            IsActive     = master.Employee.IsActive ?? false
        };
    }

    public async Task<User?> GetByEmployeeIdAsync(int employeeId)
    {
        var employee = await _eepzContext.Employees
            .Include(e => e.Userprofile)
            .Include(e => e.Userauthentication)
            .Include(e => e.Employeedetailsmasters)
                .ThenInclude(edm => edm.Role)
            .Include(e => e.Employeedetailsmasters)
                .ThenInclude(edm => edm.Department)
            .FirstOrDefaultAsync(e => e.EmployeeId == employeeId);

        if (employee == null) return null;

        var master = employee.Employeedetailsmasters.FirstOrDefault();

        return new User
        {
            UserId       = employee.Userauthentication?.UserId ?? 0,
            EmployeeId   = employee.EmployeeId,
            Email        = employee.Userauthentication?.Email ?? string.Empty,
            FullName     = $"{employee.Userprofile?.FirstName} {employee.Userprofile?.LastName}".Trim(),
            RoleName     = master?.Role?.RoleName ?? string.Empty,
            DepartmentId = master?.DepartmentId ?? 0,
            IsActive     = employee.IsActive ?? false
        };
    }

    public async Task<IEnumerable<User>> GetByRoleAsync(string roleName)
    {
        var masters = await _eepzContext.Employeedetailsmasters
            .Include(edm => edm.Employee)
                .ThenInclude(e => e.Userprofile)
            .Include(edm => edm.Employee)
                .ThenInclude(e => e.Userauthentication)
            .Include(edm => edm.Role)
            .Include(edm => edm.Department)
            .Where(edm => edm.Role.RoleName == roleName &&
                          (edm.Employee.IsActive ?? false))
            .ToListAsync();

        return masters.Select(master => new User
        {
            UserId       = master.Employee.Userauthentication?.UserId ?? 0,
            EmployeeId   = master.EmployeeId,
            Email        = master.Employee.Userauthentication?.Email ?? string.Empty,
            FullName     = $"{master.Employee.Userprofile?.FirstName} {master.Employee.Userprofile?.LastName}".Trim(),
            RoleName     = master.Role?.RoleName ?? string.Empty,
            DepartmentId = master.DepartmentId,
            IsActive     = master.Employee.IsActive ?? false
        });
    }

    public async Task<string> GetFullNameAsync(int userId)
    {
        var user = await GetByUserIdAsync(userId);
        return user?.FullName ?? $"User#{userId}";
    }
}
