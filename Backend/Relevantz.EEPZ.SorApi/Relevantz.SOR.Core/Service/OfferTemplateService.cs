using Relevantz.SOR.Common.Constants;
using Relevantz.SOR.Common.DTOs.Request.OfferTemplate;
using Relevantz.SOR.Common.DTOs.Response;
using Relevantz.SOR.Common.Entities;
using Relevantz.SOR.Core.IService;
using Relevantz.SOR.Data.IRepository;

namespace Relevantz.SOR.Core.Service;

public class OfferTemplateService : IOfferTemplateService
{
    private readonly IOfferTemplateRepository _templateRepository;
    private readonly IAuditService            _auditService;

    public OfferTemplateService(IOfferTemplateRepository templateRepository, IAuditService auditService)
    {
        _templateRepository = templateRepository;
        _auditService       = auditService;
    }

    
    public async Task<ApiResponseDto<IEnumerable<OfferTemplateResponseDto>>> GetAllActiveAsync()
    {
        var templates = await _templateRepository.GetAllActiveAsync();
        var result = templates.Select(t => new OfferTemplateResponseDto
        {
            OfferTemplateId = t.OfferTemplateId,
            TemplateName    = t.TemplateName,
            OfferType       = t.OfferType.ToString(),
            HtmlContent     = t.HtmlContent,
            IsDefault       = t.IsDefault,
            IsActive        = t.IsActive,
            CreatedAt       = t.CreatedAt,
            UpdatedAt       = t.UpdatedAt
        });

        return ApiResponseDto<IEnumerable<OfferTemplateResponseDto>>.Ok(result);
    }

    
    
    public async Task<ApiResponseDto<OfferTemplateResponseDto>> CreateAsync(
        CreateOfferTemplateRequestDto dto, int createdByUserId)
    {
        
        if (dto.IsDefault)
            await UnsetExistingDefaultAsync(dto.OfferType);

        var template = new OfferTemplate
        {
            TemplateName    = dto.TemplateName,
            OfferType       = dto.OfferType,
            HtmlContent     = dto.HtmlContent,
            IsDefault       = dto.IsDefault,
            IsActive        = true,
            CreatedByUserId = createdByUserId
        };

        await _templateRepository.AddAsync(template);
        await _auditService.LogAsync(OfferTemplateConstants.EntityType, template.OfferTemplateId,
            AuditConstants.ActionCreate, createdByUserId);

        return ApiResponseDto<OfferTemplateResponseDto>.Ok(
            MapToDto(template), OfferTemplateMessages.TemplateCreated);
    }

    
    
    
    
    public async Task<ApiResponseDto<OfferTemplateResponseDto>> UpdateAsync(
        int templateId, UpdateOfferTemplateRequestDto dto, int updatedByUserId)
    {
        var template = await _templateRepository.GetByIdAsync(templateId);
        if (template == null)
            return ApiResponseDto<OfferTemplateResponseDto>.Fail(OfferTemplateMessages.TemplateNotFound);

        
        if (dto.IsDefault && !template.IsDefault)
            await UnsetExistingDefaultAsync(dto.OfferType, excludeTemplateId: templateId);

        template.TemplateName = dto.TemplateName;
        template.OfferType    = dto.OfferType;
        template.HtmlContent  = dto.HtmlContent;
        template.IsDefault    = dto.IsDefault;

        await _templateRepository.UpdateAsync(template);

        
        await _auditService.LogAsync(OfferTemplateConstants.EntityType, templateId,
            AuditConstants.ActionUpdate, updatedByUserId);

        return ApiResponseDto<OfferTemplateResponseDto>.Ok(
            MapToDto(template), OfferTemplateMessages.TemplateUpdated);
    }

    
    public async Task<ApiResponseDto<bool>> DeleteAsync(int templateId)
    {
        var template = await _templateRepository.GetByIdAsync(templateId);
        if (template == null)
            return ApiResponseDto<bool>.Fail(OfferTemplateMessages.TemplateNotFound);

        if (template.IsDefault)
            return ApiResponseDto<bool>.Fail(OfferTemplateMessages.CannotDeleteDefault);

        await _templateRepository.DeleteAsync(templateId);
        return ApiResponseDto<bool>.Ok(true, OfferTemplateMessages.TemplateDeleted);
    }

    

    private async Task UnsetExistingDefaultAsync(
        Relevantz.SOR.Common.Enums.OfferType offerType, int excludeTemplateId = 0)
    {
        var allTemplates = await _templateRepository.GetAllActiveAsync();
        foreach (var t in allTemplates.Where(t =>
            t.IsDefault &&
            t.OfferType == offerType &&
            t.OfferTemplateId != excludeTemplateId))
        {
            t.IsDefault = false;
            await _templateRepository.UpdateAsync(t);
        }
    }

    private static OfferTemplateResponseDto MapToDto(OfferTemplate t) => new()
    {
        OfferTemplateId = t.OfferTemplateId,
        TemplateName    = t.TemplateName,
        OfferType       = t.OfferType.ToString(),
        HtmlContent     = t.HtmlContent,
        IsDefault       = t.IsDefault,
        IsActive        = t.IsActive,
        CreatedAt       = t.CreatedAt,
        UpdatedAt       = t.UpdatedAt
    };
}
