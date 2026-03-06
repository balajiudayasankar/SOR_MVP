using System.Security.Claims;
using Relevantz.SOR.Common.Constants;
using Relevantz.SOR.Core.IService;

namespace Relevantz.SOR.Core.Service;

public class TokenService : ITokenService
{
    public int GetUserIdFromClaims(ClaimsPrincipal user)
    {
        
        
        var claim = user.FindFirst(ClaimTypes.NameIdentifier)
                 ?? user.FindFirst(TokenConstants.UserIdClaim)
                 ?? user.FindFirst("sub");

        return claim != null && int.TryParse(claim.Value, out var id) ? id : 0;
    }

    public string GetRoleFromClaims(ClaimsPrincipal user)
    {
        
        var claim = user.FindFirst(ClaimTypes.Role)
                 ?? user.FindFirst(TokenConstants.RoleClaim);

        return claim?.Value ?? string.Empty;
    }

    public int GetDepartmentIdFromClaims(ClaimsPrincipal user)
    {
        var claim = user.FindFirst(TokenConstants.DepartmentIdClaim);
        return claim != null && int.TryParse(claim.Value, out var id) ? id : 0;
    }

    public int GetEmpMasterIdFromClaims(ClaimsPrincipal user)
    {
        var claim = user.FindFirst(TokenConstants.EmpMasterIdClaim);
        return claim != null && int.TryParse(claim.Value, out var id) ? id : 0;
    }
}
