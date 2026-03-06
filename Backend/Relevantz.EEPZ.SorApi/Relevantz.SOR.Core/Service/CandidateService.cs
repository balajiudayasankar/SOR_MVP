using Mapster;
using Microsoft.Extensions.Logging;
using Relevantz.SOR.Common.Constants;
using Relevantz.SOR.Common.DTOs.Request.Candidate;
using Relevantz.SOR.Common.DTOs.Response;
using Relevantz.SOR.Common.Entities;
using Relevantz.SOR.Common.Enums;
using Relevantz.SOR.Common.Utils;
using Relevantz.SOR.Core.IService;
using Relevantz.SOR.Data.IRepository;

namespace Relevantz.SOR.Core.Service;

public class CandidateService : ICandidateService
{
    private readonly ICandidateRepository _candidateRepository;
    private readonly IAuditService _auditService;
    private readonly ILogger<CandidateService> _logger;

    public CandidateService(
        ICandidateRepository candidateRepository,
        IAuditService auditService,
        ILogger<CandidateService> logger)
    {
        _candidateRepository = candidateRepository;
        _auditService = auditService;
        _logger = logger;
    }

    public async Task<ApiResponseDto<CandidateResponseDto>> GetByIdAsync(int candidateId)
    {
        var candidate = await _candidateRepository.GetByIdAsync(candidateId);
        if (candidate == null)
            return ApiResponseDto<CandidateResponseDto>.Fail(CandidateMessages.CandidateNotFound);

        return ApiResponseDto<CandidateResponseDto>.Ok(candidate.Adapt<CandidateResponseDto>());
    }

    public async Task<ApiResponseDto<IEnumerable<CandidateResponseDto>>> GetAllAsync()
    {
        var candidates = await _candidateRepository.GetAllAsync();
        return ApiResponseDto<IEnumerable<CandidateResponseDto>>.Ok(
            candidates.Adapt<IEnumerable<CandidateResponseDto>>());
    }

    public async Task<ApiResponseDto<IEnumerable<CandidateResponseDto>>> GetByStageAsync(CandidateStage stage)
    {
        var candidates = await _candidateRepository.GetByStageAsync(stage);
        return ApiResponseDto<IEnumerable<CandidateResponseDto>>.Ok(
            candidates.Adapt<IEnumerable<CandidateResponseDto>>());
    }

    public async Task<ApiResponseDto<CandidateResponseDto>> CreateAsync(
        CreateCandidateRequestDto dto, int createdByUserId)
    {
        var candidate = new Candidate
        {
            CandidateName = dto.CandidateName,
            Email = dto.Email,
            Phone = dto.Phone,
            Address = dto.Address,
            CurrentStage = CandidateStage.Interview,
            IsActive = true,
            CreatedByUserId = createdByUserId
        };

        await _candidateRepository.AddAsync(candidate);
        await _auditService.LogAsync(CandidateConstants.EntityType, candidate.CandidateId,
            AuditConstants.ActionCreate, createdByUserId);

        SORBusinessLog.LogInfo(_logger, "Candidate {CandidateId} created by user {UserId}",
            candidate.CandidateId, createdByUserId);

        return ApiResponseDto<CandidateResponseDto>.Ok(
            candidate.Adapt<CandidateResponseDto>(), CandidateMessages.CandidateCreated);
    }

    public async Task<ApiResponseDto<CandidateResponseDto>> UpdateAsync(
        int candidateId, UpdateCandidateRequestDto dto, int updatedByUserId)
    {
        var candidate = await _candidateRepository.GetByIdAsync(candidateId);
        if (candidate == null)
            return ApiResponseDto<CandidateResponseDto>.Fail(CandidateMessages.CandidateNotFound);

        candidate.CandidateName = dto.CandidateName;
        candidate.Email = dto.Email;
        candidate.Phone = dto.Phone;
        candidate.Address = dto.Address;
        candidate.UpdatedByUserId = updatedByUserId;

        await _candidateRepository.UpdateAsync(candidate);
        await _auditService.LogAsync(CandidateConstants.EntityType, candidateId,
            AuditConstants.ActionUpdate, updatedByUserId);

        return ApiResponseDto<CandidateResponseDto>.Ok(
            candidate.Adapt<CandidateResponseDto>(), CandidateMessages.CandidateUpdated);
    }

    public async Task<ApiResponseDto<CandidateResponseDto>> MoveToOfferStageAsync(
        int candidateId, int performedByUserId)
    {
        var candidate = await _candidateRepository.GetByIdAsync(candidateId);
        if (candidate == null)
            return ApiResponseDto<CandidateResponseDto>.Fail(CandidateMessages.CandidateNotFound);

        if (candidate.CurrentStage == CandidateStage.OfferStage)
            return ApiResponseDto<CandidateResponseDto>.Fail(CandidateMessages.CandidateAlreadyInOfferStage);

        if (candidate.CurrentStage != CandidateStage.Interview)
            return ApiResponseDto<CandidateResponseDto>.Fail(CandidateMessages.CandidateMustBeInInterviewStage);

        candidate.CurrentStage = CandidateStage.OfferStage;
        candidate.UpdatedByUserId = performedByUserId;

        await _candidateRepository.UpdateAsync(candidate);
        await _auditService.LogAsync(CandidateConstants.EntityType, candidateId,
            AuditConstants.ActionMoveStage, performedByUserId);

        SORBusinessLog.LogInfo(_logger, "Candidate {CandidateId} moved to OfferStage by user {UserId}",
            candidateId, performedByUserId);

        return ApiResponseDto<CandidateResponseDto>.Ok(
            candidate.Adapt<CandidateResponseDto>(), CandidateMessages.CandidateMovedToOfferStage);
    }
}
