using FluentValidation;
using Relevantz.SOR.Common.DTOs.Request.ApprovalChain;

namespace Relevantz.SOR.Common.Validators;

public class UpdateApprovalChainRequestDtoValidator : AbstractValidator<UpdateApprovalChainRequestDto>
{
    public UpdateApprovalChainRequestDtoValidator()
    {
        RuleFor(x => x.ChainName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.DepartmentId).GreaterThan(0);
        RuleFor(x => x.Steps).NotEmpty();
        RuleForEach(x => x.Steps).SetValidator(new ApprovalChainStepRequestDtoValidator());
    }
}
