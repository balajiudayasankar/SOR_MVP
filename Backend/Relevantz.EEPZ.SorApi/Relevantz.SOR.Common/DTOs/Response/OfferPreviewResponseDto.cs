namespace Relevantz.SOR.Common.DTOs.Response;

public class OfferPreviewResponseDto
{
    public int OfferId { get; set; }
    public string OfferNumber { get; set; } = null!;
    public string HtmlContent { get; set; } = null!;
    public string? PdfDownloadUrl { get; set; }
}
