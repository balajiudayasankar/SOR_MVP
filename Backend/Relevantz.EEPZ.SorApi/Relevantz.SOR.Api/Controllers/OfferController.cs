using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Relevantz.SOR.Common.Constants;
using Relevantz.SOR.Common.DTOs.Request.Offer;
using Relevantz.SOR.Core.IService;

namespace Relevantz.SOR.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class OfferController : ControllerBase
{
    private readonly IOfferService _offerService;
    private readonly ITokenService _tokenService;

    public OfferController(IOfferService offerService, ITokenService tokenService)
    {
        _offerService = offerService;
        _tokenService = tokenService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _offerService.GetAllActiveAsync();
        return Ok(result);
    }

    [HttpGet("{offerId:int}")]
    public async Task<IActionResult> GetById(int offerId)
    {
        var result = await _offerService.GetByIdAsync(offerId);
        return result.Success ? Ok(result) : NotFound(result);
    }

    [HttpGet("{offerId:int}/preview")]
    public async Task<IActionResult> GetPreview(int offerId)
    {
        var result = await _offerService.GetPreviewAsync(offerId);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpGet("{offerId:int}/versions")]
    public async Task<IActionResult> GetVersionHistory(int offerId)
    {
        var result = await _offerService.GetVersionHistoryAsync(offerId);
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = RoleConstants.HR)]
    public async Task<IActionResult> Create([FromBody] CreateOfferRequestDto dto)
    {
        var userId = _tokenService.GetUserIdFromClaims(User);
        var result = await _offerService.CreateAsync(dto, userId);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpPut("{offerId:int}/details")]
    [Authorize(Roles = RoleConstants.HR)]
    public async Task<IActionResult> UpdateDetails(int offerId, [FromBody] UpdateOfferRequestDto dto)
    {
        var userId = _tokenService.GetUserIdFromClaims(User);
        var result = await _offerService.UpdateDetailsAsync(offerId, dto, userId);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpPatch("{offerId:int}/draft")]
    [Authorize(Roles = RoleConstants.HR)]
    public async Task<IActionResult> SaveDraft(int offerId, [FromBody] SaveOfferDraftRequestDto dto)
    {
        var userId = _tokenService.GetUserIdFromClaims(User);
        var result = await _offerService.SaveDraftAsync(offerId, dto, userId);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpPost("submit-for-approval")]
    [Authorize(Roles = RoleConstants.HR)]
    public async Task<IActionResult> SubmitForApproval([FromBody] SubmitOfferForApprovalRequestDto dto)
    {
        var userId = _tokenService.GetUserIdFromClaims(User);
        var result = await _offerService.SubmitForApprovalAsync(dto, userId);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpPost("regenerate")]
    [Authorize(Roles = RoleConstants.HR)]
    public async Task<IActionResult> Regenerate([FromBody] RegenerateOfferRequestDto dto)
    {
        var userId = _tokenService.GetUserIdFromClaims(User);
        var result = await _offerService.RegenerateAsync(dto, userId);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpGet("{offerId:int}/download")]
    [Authorize(Roles = $"{RoleConstants.HR},{RoleConstants.HRHead}")]
    public async Task<IActionResult> Download(int offerId)
    {
        var userId = _tokenService.GetUserIdFromClaims(User);
        var result = await _offerService.DownloadApprovedOfferAsync(offerId, userId);
        if (!result.Success) return BadRequest(result);
        return File(result.Data!, "application/pdf", $"offer_{offerId}.pdf");
    }
}
