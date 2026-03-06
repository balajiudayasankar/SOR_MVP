using System;
using Relevantz.SOR.Common.Enums;

namespace Relevantz.SOR.Common.Entities;

public partial class Offer
{
    public int OfferId { get; set; }
    public string OfferNumber { get; set; } = null!;
    public int CandidateId { get; set; }
    public OfferType OfferType { get; set; }
    public OfferStatus Status { get; set; }
    public int Version { get; set; } = 1;
    public int? ParentOfferId { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public int CreatedByUserId { get; set; }
    public int? UpdatedByUserId { get; set; }

    public virtual Candidate Candidate { get; set; } = null!;
    public virtual OfferCommonDetails? OfferCommonDetails { get; set; }
    public virtual InternshipDetails? InternshipDetails { get; set; }
    public virtual FullTimeDetails? FullTimeDetails { get; set; }
    public virtual OfferWorkflow? OfferWorkflow { get; set; }
    public virtual ICollection<OfferVersion> OfferVersions { get; set; } = new List<OfferVersion>();
    public virtual ICollection<AuditLog> AuditLogs { get; set; } = new List<AuditLog>();
}
