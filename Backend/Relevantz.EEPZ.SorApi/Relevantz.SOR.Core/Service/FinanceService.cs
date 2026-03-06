using Relevantz.SOR.Common.Constants;
using Relevantz.SOR.Common.DTOs.Response;
using Relevantz.SOR.Core.IService;
using Relevantz.SOR.Data.IRepository;

namespace Relevantz.SOR.Core.Service;

public class FinanceService : IFinanceService
{
    private readonly IFinanceBudgetRepository _budgetRepository;
    private readonly IOfferRepository _offerRepository;

    public FinanceService(IFinanceBudgetRepository budgetRepository, IOfferRepository offerRepository)
    {
        _budgetRepository = budgetRepository;
        _offerRepository = offerRepository;
    }

    public async Task<ApiResponseDto<FinanceValidationResponseDto>> ValidateBudgetAsync(
        int offerId, int departmentId, int fiscalYear)
    {
        var offer = await _offerRepository.GetWithDetailsAsync(offerId);
        if (offer == null)
            return ApiResponseDto<FinanceValidationResponseDto>.Fail(OfferMessages.OfferNotFound);

        var budget = await _budgetRepository.GetByDepartmentAndYearAsync(departmentId, fiscalYear);
        var offeredCtc = offer.FullTimeDetails?.AnnualCtc
                         ?? (offer.InternshipDetails?.StipendAmount ?? 0) * 12;

        var remaining = budget?.RemainingBudget ?? 0;
        var variance = remaining > 0
            ? Math.Round((offeredCtc - remaining) / remaining * 100, 2)
            : 0;

        return ApiResponseDto<FinanceValidationResponseDto>.Ok(new FinanceValidationResponseDto
        {
            DepartmentId = departmentId,
            DepartmentName = "Department",
            TotalBudget = budget?.TotalBudget ?? 0,
            UsedBudget = budget?.UsedBudget ?? 0,
            RemainingBudget = remaining,
            OfferedCtc = offeredCtc,
            VariancePercentage = variance,
            IsOverBudget = offeredCtc > remaining
        });
    }
}
