using FluentValidation;
using Relevantz.SOR.Common.Constants;
using Relevantz.SOR.Common.DTOs.Request.Offer;

namespace Relevantz.SOR.Common.Validators;

public class InternshipDetailsRequestDtoValidator : AbstractValidator<InternshipDetailsRequestDto>
{
    public InternshipDetailsRequestDtoValidator()
    {
        RuleFor(x => x.InternshipStartDate).NotEmpty();
        RuleFor(x => x.InternshipEndDate).NotEmpty()
            .Must((dto, end) => end > dto.InternshipStartDate)
            .WithMessage(ValidationMessages.EndDateAfterStart);
        RuleFor(x => x.DurationMonths).GreaterThan(0);
        RuleFor(x => x.StipendAmount).GreaterThan(0).WithMessage(ValidationMessages.MustBeGreaterThanZero);
        RuleFor(x => x.PayFrequency).IsInEnum();
        RuleFor(x => x.OtherBenefits).MaximumLength(OfferConstants.MaxBenefitsTextLength);
    }
}
