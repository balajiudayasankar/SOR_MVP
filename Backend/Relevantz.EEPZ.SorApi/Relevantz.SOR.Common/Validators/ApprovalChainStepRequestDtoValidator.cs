using FluentValidation;
using Relevantz.SOR.Common.DTOs.Request.ApprovalChain;

namespace Relevantz.SOR.Common.Validators;

public class ApprovalChainStepRequestDtoValidator : AbstractValidator<ApprovalChainStepRequestDto>
{
    public ApprovalChainStepRequestDtoValidator()
    {
        RuleFor(x => x.StepOrder).GreaterThan(0);
        RuleFor(x => x.Role).IsInEnum();
        RuleFor(x => x.AssignedUserId).GreaterThan(0);
    }
}
