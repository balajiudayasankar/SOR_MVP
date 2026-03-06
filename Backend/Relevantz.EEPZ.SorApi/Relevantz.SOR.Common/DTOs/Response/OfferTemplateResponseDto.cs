namespace Relevantz.SOR.Common.DTOs.Response;

public class OfferTemplateResponseDto
{
    public int    OfferTemplateId { get; set; }
    public string TemplateName   { get; set; } = string.Empty;
    public string OfferType      { get; set; } = string.Empty;
    public string HtmlContent    { get; set; } = string.Empty;
    public bool   IsDefault      { get; set; }
    public bool   IsActive       { get; set; }
    public DateTime CreatedAt    { get; set; }
    public DateTime? UpdatedAt   { get; set; }
}
