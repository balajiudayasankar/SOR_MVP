using FluentValidation;
using Relevantz.SOR.Common.Constants;
using Relevantz.SOR.Common.DTOs.Request.Approval;

namespace Relevantz.SOR.Common.Validators;

public class RejectOfferRequestDtoValidator : AbstractValidator<RejectOfferRequestDto>
{
    public RejectOfferRequestDtoValidator()
    {
        RuleFor(x => x.WorkflowStepId).GreaterThan(0);
        RuleFor(x => x.Comments).NotEmpty()
            .WithMessage(WorkflowMessages.CommentRequiredForRejection)
            .MaximumLength(OfferConstants.MaxCommentLength);
    }
}
