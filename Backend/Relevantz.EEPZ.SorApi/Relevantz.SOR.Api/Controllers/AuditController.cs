using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Relevantz.SOR.Common.Constants;
using Relevantz.SOR.Core.IService;

namespace Relevantz.SOR.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize(Roles = $"{RoleConstants.HR},{RoleConstants.HRHead}")]
public class AuditController : ControllerBase
{
    private readonly IAuditService _auditService;

    public AuditController(IAuditService auditService)
        => _auditService = auditService;

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 20)
    {
        var result = await _auditService.GetAllAsync(pageNumber, pageSize);
        return Ok(result);
    }

    [HttpGet("offer/{offerId:int}")]
    public async Task<IActionResult> GetByOffer(int offerId)
    {
        var result = await _auditService.GetByOfferIdAsync(offerId);
        return Ok(result);
    }

    [HttpGet("user/{userId:int}")]
    public async Task<IActionResult> GetByUser(int userId)
    {
        var result = await _auditService.GetByUserIdAsync(userId);
        return Ok(result);
    }

    [HttpGet("date-range")]
    public async Task<IActionResult> GetByDateRange(
        [FromQuery] DateTime from, [FromQuery] DateTime to)
    {
        var result = await _auditService.GetByDateRangeAsync(from, to);
        return Ok(result);
    }
}
