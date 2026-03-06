using Relevantz.SOR.Common.Entities;

namespace Relevantz.SOR.Data.IRepository;

public interface IUserRepository
{
    Task<User?> GetByUserIdAsync(int userId);
    Task<User?> GetByEmployeeMasterIdAsync(int employeeMasterId);
    Task<User?> GetByEmployeeIdAsync(int employeeId);
    Task<IEnumerable<User>> GetByRoleAsync(string roleName);
    Task<string> GetFullNameAsync(int userId);
}
