using FluentValidation;
using Relevantz.SOR.Common.Constants;
using Relevantz.SOR.Common.DTOs.Request.Approval;

namespace Relevantz.SOR.Common.Validators;

public class RequestRevisionDtoValidator : AbstractValidator<RequestRevisionDto>
{
    public RequestRevisionDtoValidator()
    {
        RuleFor(x => x.WorkflowStepId).GreaterThan(0);
        RuleFor(x => x.RevisionReason).NotEmpty().MaximumLength(OfferConstants.MaxCommentLength);
    }
}
