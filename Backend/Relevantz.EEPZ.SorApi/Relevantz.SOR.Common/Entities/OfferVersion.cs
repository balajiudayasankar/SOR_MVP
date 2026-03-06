using System;
using Relevantz.SOR.Common.Enums;

namespace Relevantz.SOR.Common.Entities;

public partial class OfferVersion
{
    public int OfferVersionId { get; set; }
    public int OfferId { get; set; }
    public int VersionNumber { get; set; }
    public string SnapshotJson { get; set; } = null!;
    public OfferStatus StatusAtVersion { get; set; }
    public DateTime ArchivedAt { get; set; }
    public int ArchivedByUserId { get; set; }

    public virtual Offer Offer { get; set; } = null!;
}
