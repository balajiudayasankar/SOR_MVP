using System;
using Relevantz.SOR.Common.Enums;

namespace Relevantz.SOR.Common.Entities;

public partial class OfferTemplate
{
    public int OfferTemplateId { get; set; }
    public string TemplateName { get; set; } = null!;
    public OfferType OfferType { get; set; }
    public string HtmlContent { get; set; } = null!;
    public bool IsDefault { get; set; } = false;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public int CreatedByUserId { get; set; }
}
