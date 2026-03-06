namespace Relevantz.SOR.Common.Constants;

public static class ValidationMessages
{
    public const string Required = "{PropertyName} is required.";
    public const string MustBeGreaterThanZero = "{PropertyName} must be greater than 0.";
    public const string InvalidEmail = "Invalid email format.";
    public const string InvalidDate = "{PropertyName} has an invalid date.";
    public const string MaxLength = "{PropertyName} must not exceed {MaxLength} characters.";
    public const string JoiningDateMustBeFuture = "Joining date must be a future date.";
    public const string EndDateAfterStart = "End date must be after start date.";
    public const string CtcMustBePositive = "CTC must be greater than 0.";
}
