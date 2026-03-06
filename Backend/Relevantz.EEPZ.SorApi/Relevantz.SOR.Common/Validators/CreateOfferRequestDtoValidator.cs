using FluentValidation;
using Relevantz.SOR.Common.DTOs.Request.Offer;

namespace Relevantz.SOR.Common.Validators;

public class CreateOfferRequestDtoValidator : AbstractValidator<CreateOfferRequestDto>
{
    public CreateOfferRequestDtoValidator()
    {
        RuleFor(x => x.CandidateId).GreaterThan(0);
        RuleFor(x => x.OfferType).IsInEnum();
    }
}
