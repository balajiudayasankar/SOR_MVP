using FluentValidation;
using Relevantz.SOR.Common.DTOs.Request.Approval;

namespace Relevantz.SOR.Common.Validators;

public class ApproveOfferRequestDtoValidator : AbstractValidator<ApproveOfferRequestDto>
{
    public ApproveOfferRequestDtoValidator()
    {
        RuleFor(x => x.WorkflowStepId).GreaterThan(0);
    }
}
