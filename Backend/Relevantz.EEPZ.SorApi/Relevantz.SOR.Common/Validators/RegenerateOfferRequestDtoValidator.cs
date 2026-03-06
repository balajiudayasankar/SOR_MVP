using FluentValidation;
using Relevantz.SOR.Common.DTOs.Request.Offer;

namespace Relevantz.SOR.Common.Validators;

public class RegenerateOfferRequestDtoValidator : AbstractValidator<RegenerateOfferRequestDto>
{
    public RegenerateOfferRequestDtoValidator()
    {
        RuleFor(x => x.OfferId).GreaterThan(0);
        RuleFor(x => x.RegenerateReason).NotEmpty().MaximumLength(500);
        RuleFor(x => x.ApprovalChainId).GreaterThan(0);
    }
}
