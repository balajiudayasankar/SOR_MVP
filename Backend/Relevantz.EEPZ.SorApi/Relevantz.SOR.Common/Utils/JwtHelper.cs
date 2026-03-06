using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using Relevantz.SOR.Common.Constants;

namespace Relevantz.SOR.Common.Utils;

public static class JwtHelper
{
    public static int GetUserIdFromClaims(ClaimsPrincipal user)
    {
        var claim = user.FindFirst(TokenConstants.UserIdClaim);
        return claim != null ? int.Parse(claim.Value) : 0;
    }

    public static string GetRoleFromClaims(ClaimsPrincipal user)
    {
        return user.FindFirst(TokenConstants.RoleClaim)?.Value ?? string.Empty;
    }

    public static int GetDepartmentIdFromClaims(ClaimsPrincipal user)
    {
        var claim = user.FindFirst(TokenConstants.DepartmentIdClaim);
        return claim != null ? int.Parse(claim.Value) : 0;
    }
}
