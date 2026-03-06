namespace Relevantz.SOR.Common.Constants;

public static class WorkflowMessages
{
    public const string WorkflowStarted = "Approval workflow started successfully.";
    public const string WorkflowApproved = "Offer approved and workflow advanced.";
    public const string WorkflowRejected = "Offer rejected at this step.";
    public const string WorkflowRevisionRequested = "Revision requested. Offer returned to HR.";
    public const string WorkflowExpedited = "Offer expedited by HR Head.";
    public const string WorkflowNotFound = "Workflow not found.";
    public const string WorkflowLocked = "Workflow is locked. No edits allowed during approval.";
    public const string StepNotFound = "Workflow step not found.";
    public const string UnauthorizedApprover = "You are not the assigned approver for this step.";
    public const string CommentRequiredForRejection = "Comments are mandatory for rejection.";
    public const string JustificationRequiredForExpedite = "Justification is required to expedite an offer.";
}
