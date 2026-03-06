using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Relevantz.SOR.Common.Constants;
using Relevantz.SOR.Common.DTOs.Request.Candidate;
using Relevantz.SOR.Common.Enums;
using Relevantz.SOR.Core.IService;

namespace Relevantz.SOR.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class CandidateController : ControllerBase
{
    private readonly ICandidateService _candidateService;
    private readonly ITokenService _tokenService;

    public CandidateController(ICandidateService candidateService, ITokenService tokenService)
    {
        _candidateService = candidateService;
        _tokenService = tokenService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _candidateService.GetAllAsync();
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpGet("{candidateId:int}")]
    public async Task<IActionResult> GetById(int candidateId)
    {
        var result = await _candidateService.GetByIdAsync(candidateId);
        return result.Success ? Ok(result) : NotFound(result);
    }

    [HttpGet("stage/{stage}")]
    public async Task<IActionResult> GetByStage(CandidateStage stage)
    {
        var result = await _candidateService.GetByStageAsync(stage);
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = RoleConstants.HR)]
    public async Task<IActionResult> Create([FromBody] CreateCandidateRequestDto dto)
    {
        var userId = _tokenService.GetUserIdFromClaims(User);
        var result = await _candidateService.CreateAsync(dto, userId);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpPut("{candidateId:int}")]
    [Authorize(Roles = RoleConstants.HR)]
    public async Task<IActionResult> Update(int candidateId, [FromBody] UpdateCandidateRequestDto dto)
    {
        var userId = _tokenService.GetUserIdFromClaims(User);
        var result = await _candidateService.UpdateAsync(candidateId, dto, userId);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpPatch("{candidateId:int}/move-to-offer-stage")]
    [Authorize(Roles = RoleConstants.HR)]
    public async Task<IActionResult> MoveToOfferStage(int candidateId)
    {
        var userId = _tokenService.GetUserIdFromClaims(User);
        var result = await _candidateService.MoveToOfferStageAsync(candidateId, userId);
        return result.Success ? Ok(result) : BadRequest(result);
    }
}
