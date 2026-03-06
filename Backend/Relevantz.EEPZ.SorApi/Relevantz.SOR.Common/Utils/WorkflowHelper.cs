using Relevantz.SOR.Common.Entities;
using Relevantz.SOR.Common.Enums;

namespace Relevantz.SOR.Common.Utils;

public static class WorkflowHelper
{
    
    
    
    public static bool IsAllStepsCompleted(OfferWorkflow workflow)
    {
        var activeSteps = workflow.Steps
            .Where(s => !s.IsSkipped)
            .ToList();

        return activeSteps.Any() &&
               activeSteps.All(s => s.Status == ApprovalStepStatus.Approved);
    }

    
    
    
    public static OfferWorkflowStep? GetCurrentStep(OfferWorkflow workflow)
    {
        return workflow.Steps
            .Where(s => !s.IsSkipped)
            .OrderBy(s => s.StepOrder)
            .FirstOrDefault(s => s.Status == ApprovalStepStatus.Pending);
    }

    
    
    
    public static bool HasBottleneck(OfferWorkflow workflow)
        => workflow.Status == WorkflowStatus.OnHold;

    
    
    
    public static IEnumerable<int> GetApproverIds(OfferWorkflow workflow)
        => workflow.Steps
            .Where(s => !s.IsSkipped)
            .OrderBy(s => s.StepOrder)
            .Select(s => s.ApproverUserId);
}
