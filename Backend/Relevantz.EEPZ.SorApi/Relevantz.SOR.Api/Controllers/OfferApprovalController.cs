using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Relevantz.SOR.Common.Constants;
using Relevantz.SOR.Common.DTOs.Request.Approval;
using Relevantz.SOR.Core.IService;

namespace Relevantz.SOR.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class OfferApprovalController : ControllerBase
{
    private readonly IOfferApprovalService _approvalService;
    private readonly IOfferWorkflowService _workflowService;
    private readonly ITokenService _tokenService;

    public OfferApprovalController(
        IOfferApprovalService approvalService,
        IOfferWorkflowService workflowService,
        ITokenService tokenService)
    {
        _approvalService = approvalService;
        _workflowService = workflowService;
        _tokenService    = tokenService;
    }

    [HttpGet("my-pending")]
    public async Task<IActionResult> GetMyPending()
    {
        var userId = _tokenService.GetUserIdFromClaims(User);
        var result = await _approvalService.GetMyPendingApprovalsAsync(userId);
        return Ok(result);
    }

    
    [HttpGet("workflow/status")]
    [Authorize(Roles = RoleConstants.HR)]
    public async Task<IActionResult> GetAllWorkflowStatuses(
        [FromQuery] string? department, [FromQuery] string? status)
    {
        var result = await _workflowService.GetAllActiveWorkflowsAsync(department, status);
        return Ok(result);
    }

    
    [HttpGet("workflow/{offerId:int}")]
    [Authorize(Roles = $"{RoleConstants.HR},{RoleConstants.HRHead},{RoleConstants.HiringManager},{RoleConstants.Finance}")]
    public async Task<IActionResult> GetWorkflowByOffer(int offerId)
    {
        var result = await _workflowService.GetByOfferIdAsync(offerId);
        return result.Success ? Ok(result) : NotFound(result);
    }

    
    [HttpGet("workflow/{offerId:int}/status")]
    [Authorize(Roles = $"{RoleConstants.HR},{RoleConstants.HRHead},{RoleConstants.HiringManager},{RoleConstants.Finance}")]
    public async Task<IActionResult> GetWorkflowStatus(int offerId)
    {
        var result = await _workflowService.GetStatusAsync(offerId);
        return result.Success ? Ok(result) : NotFound(result);
    }

    
    [HttpPost("approve")]
    [Authorize(Roles = $"{RoleConstants.HR},{RoleConstants.HRHead},{RoleConstants.HiringManager},{RoleConstants.Finance}")]
    public async Task<IActionResult> Approve([FromBody] ApproveOfferRequestDto dto)
    {
        var userId = _tokenService.GetUserIdFromClaims(User);
        var result = await _approvalService.ApproveAsync(dto, userId);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    
    [HttpPost("reject")]
    [Authorize(Roles = $"{RoleConstants.HR},{RoleConstants.HRHead},{RoleConstants.HiringManager},{RoleConstants.Finance}")]
    public async Task<IActionResult> Reject([FromBody] RejectOfferRequestDto dto)
    {
        var userId = _tokenService.GetUserIdFromClaims(User);
        var result = await _approvalService.RejectAsync(dto, userId);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    
    [HttpPost("request-revision")]
    [Authorize(Roles = $"{RoleConstants.HR},{RoleConstants.HRHead},{RoleConstants.HiringManager},{RoleConstants.Finance}")]
    public async Task<IActionResult> RequestRevision([FromBody] RequestRevisionDto dto)
    {
        var userId = _tokenService.GetUserIdFromClaims(User);
        var result = await _approvalService.RequestRevisionAsync(dto, userId);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpPost("expedite")]
    [Authorize(Roles = RoleConstants.HRHead)]
    public async Task<IActionResult> Expedite([FromBody] ExpediteOfferRequestDto dto)
    {
        var userId = _tokenService.GetUserIdFromClaims(User);
        var result = await _approvalService.ExpediteAsync(dto, userId);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpGet("finance/summary/{offerId:int}")]
    [Authorize(Roles = RoleConstants.Finance)]
    public async Task<IActionResult> GetFinanceSummary(int offerId, [FromQuery] int departmentId)
    {
        var result = await _approvalService.GetFinanceSummaryAsync(offerId, departmentId);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpPost("finance/validate")]
    [Authorize(Roles = RoleConstants.Finance)]
    public async Task<IActionResult> SubmitFinanceValidation([FromBody] FinanceValidationRequestDto dto)
    {
        var userId = _tokenService.GetUserIdFromClaims(User);
        var result = await _approvalService.SubmitFinanceValidationAsync(dto, userId);
        return result.Success ? Ok(result) : BadRequest(result);
    }
}
