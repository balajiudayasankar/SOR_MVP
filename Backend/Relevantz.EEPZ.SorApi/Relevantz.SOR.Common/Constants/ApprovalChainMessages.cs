namespace Relevantz.SOR.Common.Constants;

public static class ApprovalChainMessages
{
    public const string ChainCreated                  = "Approval chain created successfully.";
    public const string ChainUpdated                  = "Approval chain updated successfully.";
    public const string ChainDeleted                  = "Approval chain deleted successfully.";
    public const string ChainNotFound                 = "Approval chain not found.";
    public const string DefaultChainSet               = "Default approval chain updated successfully.";
    public const string DuplicateStepOrder            = "Steps must have unique order numbers.";
    public const string StepOrderMustBeSequential     = "Step orders must be sequential starting from 1 (e.g. 1, 2, 3).";
    public const string ChainDoesNotBelongToDepartment = "This approval chain does not belong to the specified department.";
}
