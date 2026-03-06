using Relevantz.SOR.Common.Enums;

namespace Relevantz.SOR.Common.DTOs.Request.OfferTemplate;

public class CreateOfferTemplateRequestDto
{
    public string TemplateName { get; set; } = null!;
    public OfferType OfferType { get; set; }
    public string HtmlContent { get; set; } = null!;
    public bool IsDefault { get; set; }
}
