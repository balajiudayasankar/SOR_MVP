using FluentValidation;
using Relevantz.SOR.Common.Constants;
using Relevantz.SOR.Common.DTOs.Request.Offer;

namespace Relevantz.SOR.Common.Validators;

public class OfferCommonDetailsRequestDtoValidator : AbstractValidator<OfferCommonDetailsRequestDto>
{
    public OfferCommonDetailsRequestDtoValidator()
    {
        RuleFor(x => x.CandidateName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.CandidateEmail).NotEmpty().EmailAddress().WithMessage(ValidationMessages.InvalidEmail);
        RuleFor(x => x.CandidatePhone).NotEmpty().MaximumLength(20);
        RuleFor(x => x.Designation).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Department).NotEmpty().MaximumLength(200);
        RuleFor(x => x.WorkLocation).NotEmpty().MaximumLength(200);
        RuleFor(x => x.ReportingManager).NotEmpty().MaximumLength(200);
        RuleFor(x => x.OfferIssueDate).NotEmpty();
        RuleFor(x => x.JoiningDate).NotEmpty()
            .Must(d => d >= DateOnly.FromDateTime(DateTime.Today))
            .WithMessage(ValidationMessages.JoiningDateMustBeFuture);
        RuleFor(x => x.WorkingDays).NotEmpty().MaximumLength(100);
        RuleFor(x => x.WorkingHours).NotEmpty().MaximumLength(100);
        RuleFor(x => x.WeeklyHours).GreaterThan(0);
        RuleFor(x => x.CompanyName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.HrContactName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.HrEmail).NotEmpty().EmailAddress().WithMessage(ValidationMessages.InvalidEmail);
        RuleFor(x => x.HrPhone).NotEmpty().MaximumLength(20);
        RuleFor(x => x.SignatoryName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.SignatoryDesignation).NotEmpty().MaximumLength(200);
        RuleFor(x => x.CompanyPolicyText).MaximumLength(OfferConstants.MaxPolicyTextLength);
    }
}
