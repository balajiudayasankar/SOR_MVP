using FluentValidation;
using Relevantz.SOR.Common.Constants;
using Relevantz.SOR.Common.DTOs.Request.Approval;

namespace Relevantz.SOR.Common.Validators;

public class ExpediteOfferRequestDtoValidator : AbstractValidator<ExpediteOfferRequestDto>
{
    public ExpediteOfferRequestDtoValidator()
    {
        RuleFor(x => x.OfferId).GreaterThan(0);
        RuleFor(x => x.Justification).NotEmpty()
            .WithMessage(WorkflowMessages.JustificationRequiredForExpedite)
            .MaximumLength(OfferConstants.MaxCommentLength);
    }
}
