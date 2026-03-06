using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Relevantz.SOR.Common.Constants;
using Relevantz.SOR.Common.DTOs.Request.OfferTemplate;
using Relevantz.SOR.Core.IService;

namespace Relevantz.SOR.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize(Roles = $"{RoleConstants.HR},{RoleConstants.HRHead}")]
public class OfferTemplateController : ControllerBase
{
    private readonly IOfferTemplateService _templateService;
    private readonly ITokenService         _tokenService;

    public OfferTemplateController(IOfferTemplateService templateService, ITokenService tokenService)
    {
        _templateService = templateService;
        _tokenService    = tokenService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _templateService.GetAllActiveAsync();
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateOfferTemplateRequestDto dto)
    {
        var userId = _tokenService.GetUserIdFromClaims(User);
        var result = await _templateService.CreateAsync(dto, userId);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpPut("{templateId:int}")]
    public async Task<IActionResult> Update(int templateId, [FromBody] UpdateOfferTemplateRequestDto dto)
    {
        var userId = _tokenService.GetUserIdFromClaims(User);
        var result = await _templateService.UpdateAsync(templateId, dto, userId);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpDelete("{templateId:int}")]
    public async Task<IActionResult> Delete(int templateId)
    {
        var result = await _templateService.DeleteAsync(templateId);
        return result.Success ? Ok(result) : BadRequest(result);
    }
}
