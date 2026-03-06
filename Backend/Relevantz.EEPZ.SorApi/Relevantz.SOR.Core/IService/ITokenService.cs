using System.Security.Claims;

namespace Relevantz.SOR.Core.IService;

public interface ITokenService
{
    int GetUserIdFromClaims(ClaimsPrincipal user);
    string GetRoleFromClaims(ClaimsPrincipal user);
    int GetDepartmentIdFromClaims(ClaimsPrincipal user);
}
