using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Relevantz.SOR.Common.Constants;
using Relevantz.SOR.Common.DTOs.Request.ApprovalChain;
using Relevantz.SOR.Core.IService;

namespace Relevantz.SOR.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize(Roles = RoleConstants.HR)]
public class ApprovalChainController : ControllerBase
{
    private readonly IApprovalChainService _chainService;
    private readonly ITokenService _tokenService;

    public ApprovalChainController(IApprovalChainService chainService, ITokenService tokenService)
    {
        _chainService = chainService;
        _tokenService = tokenService;
    }

    [HttpGet("department/{departmentId:int}")]
    public async Task<IActionResult> GetByDepartment(int departmentId)
    {
        var result = await _chainService.GetByDepartmentAsync(departmentId);
        return Ok(result);
    }

    [HttpGet("{chainId:int}")]
    public async Task<IActionResult> GetById(int chainId)
    {
        var result = await _chainService.GetByIdAsync(chainId);
        return result.Success ? Ok(result) : NotFound(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateApprovalChainRequestDto dto)
    {
        var userId = _tokenService.GetUserIdFromClaims(User);
        var result = await _chainService.CreateAsync(dto, userId);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpPut("{chainId:int}")]
    public async Task<IActionResult> Update(int chainId, [FromBody] UpdateApprovalChainRequestDto dto)
    {
        var result = await _chainService.UpdateAsync(chainId, dto);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpDelete("{chainId:int}")]
    public async Task<IActionResult> Delete(int chainId)
    {
        var result = await _chainService.DeleteAsync(chainId);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpPost("test")]
    public async Task<IActionResult> Test([FromBody] TestApprovalChainRequestDto dto)
    {
        var result = await _chainService.TestAsync(dto);
        return Ok(result);
    }

    [HttpPatch("{chainId:int}/set-default/{departmentId:int}")]
    public async Task<IActionResult> SetDefault(int chainId, int departmentId)
    {
        var result = await _chainService.SetDefaultAsync(chainId, departmentId);
        return result.Success ? Ok(result) : BadRequest(result);
    }
}
