namespace Relevantz.SOR.Common.DTOs.Response;

public class OfferVersionHistoryResponseDto
{
    public int OfferVersionId { get; set; }
    public int OfferId { get; set; }
    public int VersionNumber { get; set; }
    public string StatusAtVersion { get; set; } = null!;
    public DateTime ArchivedAt { get; set; }
    public string ArchivedByUserName { get; set; } = null!;
}
