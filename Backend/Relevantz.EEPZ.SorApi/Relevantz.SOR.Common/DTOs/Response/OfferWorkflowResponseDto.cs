using System.Collections.Generic;

namespace Relevantz.SOR.Common.DTOs.Response;

public class OfferWorkflowResponseDto
{
    public int OfferWorkflowId { get; set; }
    public string WorkflowNumber { get; set; } = null!;
    public int OfferId { get; set; }
    public int CurrentStepIndex { get; set; }
    public string Status { get; set; } = null!;
    public bool IsLocked { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<OfferWorkflowStepResponseDto> Steps { get; set; } = new();
    public string? CandidateName { get; set; }
    public string? OfferNumber   { get; set; }
    public string? OfferType     { get; set; }

}
