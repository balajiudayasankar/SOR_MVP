using FluentValidation;
using Relevantz.SOR.Common.DTOs.Request.Candidate;

namespace Relevantz.SOR.Common.Validators;

public class MoveToOfferStageRequestDtoValidator : AbstractValidator<MoveToOfferStageRequestDto>
{
    public MoveToOfferStageRequestDtoValidator()
    {
        RuleFor(x => x.CandidateId).GreaterThan(0);
    }
}
