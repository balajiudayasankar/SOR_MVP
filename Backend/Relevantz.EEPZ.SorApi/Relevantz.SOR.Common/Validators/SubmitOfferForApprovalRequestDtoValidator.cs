using FluentValidation;
using Relevantz.SOR.Common.DTOs.Request.Offer;

namespace Relevantz.SOR.Common.Validators;

public class SubmitOfferForApprovalRequestDtoValidator : AbstractValidator<SubmitOfferForApprovalRequestDto>
{
    public SubmitOfferForApprovalRequestDtoValidator()
    {
        RuleFor(x => x.OfferId).GreaterThan(0);
        RuleFor(x => x.ApprovalChainId).GreaterThan(0);
    }
}
