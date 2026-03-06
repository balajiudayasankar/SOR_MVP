using FluentValidation;
using Relevantz.SOR.Common.DTOs.Request.Offer;

namespace Relevantz.SOR.Common.Validators;

public class SaveOfferDraftRequestDtoValidator : AbstractValidator<SaveOfferDraftRequestDto>
{
    public SaveOfferDraftRequestDtoValidator()
    {
        // All fields optional in draft — only validate what is provided
        When(x => x.CommonDetails != null, () =>
        {
            RuleFor(x => x.CommonDetails!.CandidateName)
                .MaximumLength(200)
                .When(x => x.CommonDetails != null &&
                           !string.IsNullOrWhiteSpace(x.CommonDetails.CandidateName));

            RuleFor(x => x.CommonDetails!.CandidateEmail)
                .EmailAddress()
                .WithMessage("Invalid email format.")
                .When(x => x.CommonDetails != null &&
                           !string.IsNullOrWhiteSpace(x.CommonDetails.CandidateEmail));

            RuleFor(x => x.CommonDetails!.JoiningDate)
                .Must(d => d == default || d >= DateOnly.FromDateTime(DateTime.Today))
                .WithMessage("Joining date must be a future date.")
                .When(x => x.CommonDetails != null);

            RuleFor(x => x.CommonDetails!.WeeklyHours)
                .GreaterThan(0)
                .When(x => x.CommonDetails != null && x.CommonDetails.WeeklyHours > 0);
        });

        When(x => x.InternshipDetails != null, () =>
        {
            RuleFor(x => x.InternshipDetails!.StipendAmount)
                .GreaterThan(0)
                .When(x => x.InternshipDetails != null && x.InternshipDetails.StipendAmount > 0);

            RuleFor(x => x.InternshipDetails!.InternshipEndDate)
                .Must((dto, end) =>
                {
                    if (dto.InternshipDetails == null) return true;
                    if (dto.InternshipDetails.InternshipStartDate == default) return true;
                    if (end == default) return true;
                    return end > dto.InternshipDetails.InternshipStartDate;
                })
                .WithMessage("End date must be after start date.")
                .When(x => x.InternshipDetails != null);
        });

        When(x => x.FullTimeDetails != null, () =>
        {
            RuleFor(x => x.FullTimeDetails!.AnnualCtc)
                .GreaterThan(0)
                .WithMessage("CTC must be greater than 0.")
                .When(x => x.FullTimeDetails != null && x.FullTimeDetails.AnnualCtc > 0);

            RuleFor(x => x.FullTimeDetails!.BasicSalary)
                .GreaterThan(0)
                .When(x => x.FullTimeDetails != null && x.FullTimeDetails.BasicSalary > 0);
        });
    }
}
