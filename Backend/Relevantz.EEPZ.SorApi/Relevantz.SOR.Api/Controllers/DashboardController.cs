using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Relevantz.SOR.Common.Constants;
using Relevantz.SOR.Core.IService;

namespace Relevantz.SOR.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;
    private readonly ITokenService _tokenService;

    public DashboardController(IDashboardService dashboardService, ITokenService tokenService)
    {
        _dashboardService = dashboardService;
        _tokenService = tokenService;
    }

    [HttpGet("hr")]
    [Authorize(Roles = $"{RoleConstants.HR},{RoleConstants.HRHead}")]
    public async Task<IActionResult> GetHrDashboard()
    {
        var userId = _tokenService.GetUserIdFromClaims(User);
        var result = await _dashboardService.GetHrDashboardAsync(userId);
        return Ok(result);
    }

    [HttpGet("manager")]
    [Authorize(Roles = RoleConstants.HiringManager)]
    public async Task<IActionResult> GetManagerDashboard()
    {
        var userId = _tokenService.GetUserIdFromClaims(User);
        var result = await _dashboardService.GetManagerPendingOffersAsync(userId);
        return Ok(result);
    }
}
