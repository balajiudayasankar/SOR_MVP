using FluentValidation;
using Relevantz.SOR.Common.Constants;
using Relevantz.SOR.Common.DTOs.Request.Offer;

namespace Relevantz.SOR.Common.Validators;

public class FullTimeDetailsRequestDtoValidator : AbstractValidator<FullTimeDetailsRequestDto>
{
    public FullTimeDetailsRequestDtoValidator()
    {
        RuleFor(x => x.EmploymentType).IsInEnum();
        RuleFor(x => x.AnnualCtc).GreaterThan(0).WithMessage(ValidationMessages.CtcMustBePositive);
        RuleFor(x => x.BasicSalary).GreaterThan(0);
        RuleFor(x => x.Hra).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Allowances).GreaterThanOrEqualTo(0);
        RuleFor(x => x.BonusOrVariablePay).GreaterThanOrEqualTo(0);
        RuleFor(x => x.JoiningBonus).GreaterThanOrEqualTo(0);
        RuleFor(x => x.OtherBenefits).MaximumLength(OfferConstants.MaxBenefitsTextLength);
        RuleFor(x => x.NoticePeriod).MaximumLength(100);
    }
}
