using Mapster;
using Relevantz.SOR.Common.Constants;
using Relevantz.SOR.Common.DTOs.Request.ApprovalChain;
using Relevantz.SOR.Common.DTOs.Response;
using Relevantz.SOR.Common.Entities;
using Relevantz.SOR.Core.IService;
using Relevantz.SOR.Data.IRepository;

namespace Relevantz.SOR.Core.Service;

public class ApprovalChainService : IApprovalChainService
{
    private readonly IApprovalChainRepository _chainRepository;
    private readonly IApprovalChainStepRepository _stepRepository;
    private readonly IAuditService _auditService;

    public ApprovalChainService(
        IApprovalChainRepository chainRepository,
        IApprovalChainStepRepository stepRepository,
        IAuditService auditService)
    {
        _chainRepository = chainRepository;
        _stepRepository = stepRepository;
        _auditService = auditService;
    }

    public async Task<ApiResponseDto<ApprovalChainResponseDto>> GetByIdAsync(int chainId)
    {
        var chain = await _chainRepository.GetWithStepsAsync(chainId);
        if (chain == null)
            return ApiResponseDto<ApprovalChainResponseDto>.Fail(ApprovalChainMessages.ChainNotFound);

        return ApiResponseDto<ApprovalChainResponseDto>.Ok(chain.Adapt<ApprovalChainResponseDto>());
    }

    public async Task<ApiResponseDto<IEnumerable<ApprovalChainResponseDto>>> GetByDepartmentAsync(int departmentId)
    {
        var chains = await _chainRepository.GetByDepartmentIdAsync(departmentId);
        return ApiResponseDto<IEnumerable<ApprovalChainResponseDto>>.Ok(
            chains.Adapt<IEnumerable<ApprovalChainResponseDto>>());
    }

    public async Task<ApiResponseDto<ApprovalChainResponseDto>> CreateAsync(
        CreateApprovalChainRequestDto dto, int createdByUserId)
    {
        
        var stepOrders = dto.Steps.Select(s => s.StepOrder).ToList();
        if (stepOrders.Distinct().Count() != stepOrders.Count)
            return ApiResponseDto<ApprovalChainResponseDto>.Fail(
                ApprovalChainMessages.DuplicateStepOrder);

        
        var expectedOrders = Enumerable.Range(1, dto.Steps.Count).ToList();
        if (!stepOrders.OrderBy(x => x).SequenceEqual(expectedOrders))
            return ApiResponseDto<ApprovalChainResponseDto>.Fail(
                ApprovalChainMessages.StepOrderMustBeSequential);

        
        if (dto.IsDefault)
            await UnsetExistingDefaultAsync(dto.DepartmentId);

        var chain = new ApprovalChain
        {
            ChainName       = dto.ChainName,
            DepartmentId    = dto.DepartmentId,
            IsDefault       = dto.IsDefault,
            IsActive        = true,
            CreatedByUserId = createdByUserId
        };

        await _chainRepository.AddAsync(chain);

        var steps = dto.Steps.Select(s => new ApprovalChainStep
        {
            ApprovalChainId = chain.ApprovalChainId,
            StepOrder       = s.StepOrder,
            Role            = s.Role,
            AssignedUserId  = s.AssignedUserId,
            IsMandatory     = s.IsMandatory
        });

        await _stepRepository.AddRangeAsync(steps);
        await _auditService.LogAsync(ApprovalChainConstants.EntityType, chain.ApprovalChainId,
            AuditConstants.ActionCreate, createdByUserId);

        var result = await _chainRepository.GetWithStepsAsync(chain.ApprovalChainId);
        return ApiResponseDto<ApprovalChainResponseDto>.Ok(
            result!.Adapt<ApprovalChainResponseDto>(), ApprovalChainMessages.ChainCreated);
    }

    public async Task<ApiResponseDto<ApprovalChainResponseDto>> UpdateAsync(
        int chainId, UpdateApprovalChainRequestDto dto)
    {
        var chain = await _chainRepository.GetByIdAsync(chainId);
        if (chain == null)
            return ApiResponseDto<ApprovalChainResponseDto>.Fail(ApprovalChainMessages.ChainNotFound);

        
        var stepOrders = dto.Steps.Select(s => s.StepOrder).ToList();
        if (stepOrders.Distinct().Count() != stepOrders.Count)
            return ApiResponseDto<ApprovalChainResponseDto>.Fail(
                ApprovalChainMessages.DuplicateStepOrder);

        
        var expectedOrders = Enumerable.Range(1, dto.Steps.Count).ToList();
        if (!stepOrders.OrderBy(x => x).SequenceEqual(expectedOrders))
            return ApiResponseDto<ApprovalChainResponseDto>.Fail(
                ApprovalChainMessages.StepOrderMustBeSequential);

        
        if (dto.IsDefault && !chain.IsDefault)
            await UnsetExistingDefaultAsync(dto.DepartmentId, excludeChainId: chainId);

        chain.ChainName    = dto.ChainName;
        chain.DepartmentId = dto.DepartmentId;
        chain.IsDefault    = dto.IsDefault;
        await _chainRepository.UpdateAsync(chain);

        await _stepRepository.DeleteByChainIdAsync(chainId);
        var steps = dto.Steps.Select(s => new ApprovalChainStep
        {
            ApprovalChainId = chainId,
            StepOrder       = s.StepOrder,
            Role            = s.Role,
            AssignedUserId  = s.AssignedUserId,
            IsMandatory     = s.IsMandatory
        });
        await _stepRepository.AddRangeAsync(steps);

        var result = await _chainRepository.GetWithStepsAsync(chainId);
        return ApiResponseDto<ApprovalChainResponseDto>.Ok(
            result!.Adapt<ApprovalChainResponseDto>(), ApprovalChainMessages.ChainUpdated);
    }

    public async Task<ApiResponseDto<bool>> DeleteAsync(int chainId)
    {
        var chain = await _chainRepository.GetByIdAsync(chainId);
        if (chain == null)
            return ApiResponseDto<bool>.Fail(ApprovalChainMessages.ChainNotFound);

        await _chainRepository.DeleteAsync(chainId);
        return ApiResponseDto<bool>.Ok(true, ApprovalChainMessages.ChainDeleted);
    }

    public async Task<ApiResponseDto<bool>> TestAsync(TestApprovalChainRequestDto dto)
    {
        var chain = await _chainRepository.GetWithStepsAsync(dto.ApprovalChainId);
        if (chain == null)
            return ApiResponseDto<bool>.Fail(ApprovalChainMessages.ChainNotFound);

        if (!chain.Steps.Any())
            return ApiResponseDto<bool>.Ok(false, "Approval chain has no steps.");

        
        var orders = chain.Steps.Select(s => s.StepOrder).ToList();
        if (orders.Distinct().Count() != orders.Count)
            return ApiResponseDto<bool>.Ok(false, "Approval chain has duplicate step orders.");

        
        var expected = Enumerable.Range(1, chain.Steps.Count).ToList();
        if (!orders.OrderBy(x => x).SequenceEqual(expected))
            return ApiResponseDto<bool>.Ok(false,
                "Step orders must be sequential starting from 1 (e.g. 1, 2, 3).");

        return ApiResponseDto<bool>.Ok(true, "Approval chain is valid.");
    }

    public async Task<ApiResponseDto<bool>> SetDefaultAsync(int chainId, int departmentId)
    {
        
        var target = await _chainRepository.GetByIdAsync(chainId);
        if (target == null)
            return ApiResponseDto<bool>.Fail(ApprovalChainMessages.ChainNotFound);

        if (target.DepartmentId != departmentId)
            return ApiResponseDto<bool>.Fail(
                ApprovalChainMessages.ChainDoesNotBelongToDepartment);

        
        await UnsetExistingDefaultAsync(departmentId, excludeChainId: chainId);

        target.IsDefault = true;
        await _chainRepository.UpdateAsync(target);
        return ApiResponseDto<bool>.Ok(true, ApprovalChainMessages.DefaultChainSet);
    }

    

    private async Task UnsetExistingDefaultAsync(int departmentId, int excludeChainId = 0)
    {
        var chains = await _chainRepository.GetByDepartmentIdAsync(departmentId);
        foreach (var c in chains.Where(c => c.IsDefault && c.ApprovalChainId != excludeChainId))
        {
            c.IsDefault = false;
            await _chainRepository.UpdateAsync(c);
        }
    }
}
