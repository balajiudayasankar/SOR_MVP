using FluentValidation;
using Relevantz.SOR.Common.Constants;
using Relevantz.SOR.Common.DTOs.Request.Approval;

namespace Relevantz.SOR.Common.Validators;

public class FinanceValidationRequestDtoValidator : AbstractValidator<FinanceValidationRequestDto>
{
    public FinanceValidationRequestDtoValidator()
    {
        RuleFor(x => x.WorkflowStepId).GreaterThan(0);
        RuleFor(x => x.BudgetNotes).MaximumLength(OfferConstants.MaxCommentLength);
        When(x => !x.IsApproved,
            () => RuleFor(x => x.Comments).NotEmpty().MaximumLength(OfferConstants.MaxCommentLength));
    }
}
