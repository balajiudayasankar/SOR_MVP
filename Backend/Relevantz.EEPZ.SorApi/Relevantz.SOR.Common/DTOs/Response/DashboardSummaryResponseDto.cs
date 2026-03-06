namespace Relevantz.SOR.Common.DTOs.Response;

public class DashboardSummaryResponseDto
{
    public int TotalOffers { get; set; }
    public int DraftOffers { get; set; }
    public int PendingApprovalOffers { get; set; }
    public int ApprovedOffers { get; set; }
    public int RejectedOffers { get; set; }
    public int RevisionsRequested { get; set; }
    public List<WorkflowStatusResponseDto> ActiveWorkflows { get; set; } = new();
}
