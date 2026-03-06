using FluentValidation;
using Relevantz.SOR.Common.DTOs.Request.Offer;

namespace Relevantz.SOR.Common.Validators;

public class UpdateOfferRequestDtoValidator : AbstractValidator<UpdateOfferRequestDto>
{
    public UpdateOfferRequestDtoValidator()
    {
        RuleFor(x => x.CommonDetails).NotNull().SetValidator(new OfferCommonDetailsRequestDtoValidator());
        When(x => x.InternshipDetails != null,
            () => RuleFor(x => x.InternshipDetails!).SetValidator(new InternshipDetailsRequestDtoValidator()));
        When(x => x.FullTimeDetails != null,
            () => RuleFor(x => x.FullTimeDetails!).SetValidator(new FullTimeDetailsRequestDtoValidator()));
    }
}
