using FluentValidation;
using Relevantz.SOR.Common.Constants;
using Relevantz.SOR.Common.DTOs.Request.Candidate;

namespace Relevantz.SOR.Common.Validators;

public class CreateCandidateRequestDtoValidator : AbstractValidator<CreateCandidateRequestDto>
{
    public CreateCandidateRequestDtoValidator()
    {
        RuleFor(x => x.CandidateName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Email).NotEmpty().EmailAddress().WithMessage(ValidationMessages.InvalidEmail);
        RuleFor(x => x.Phone).NotEmpty().MaximumLength(20);
        RuleFor(x => x.Address).MaximumLength(500);
    }
}
