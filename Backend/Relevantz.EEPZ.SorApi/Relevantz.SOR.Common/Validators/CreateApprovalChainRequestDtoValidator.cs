using FluentValidation;
using Relevantz.SOR.Common.DTOs.Request.ApprovalChain;

namespace Relevantz.SOR.Common.Validators;

public class CreateApprovalChainRequestDtoValidator : AbstractValidator<CreateApprovalChainRequestDto>
{
    public CreateApprovalChainRequestDtoValidator()
    {
        RuleFor(x => x.ChainName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.DepartmentId).GreaterThan(0);
        RuleFor(x => x.Steps).NotEmpty().WithMessage("Approval chain must have at least one step.");
        RuleForEach(x => x.Steps).SetValidator(new ApprovalChainStepRequestDtoValidator());
    }
}
