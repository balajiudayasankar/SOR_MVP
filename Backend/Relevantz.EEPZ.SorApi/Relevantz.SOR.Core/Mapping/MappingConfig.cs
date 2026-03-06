using Mapster;
using Relevantz.SOR.Common.DTOs.Response;
using Relevantz.SOR.Common.Entities;

namespace Relevantz.SOR.Core.Mapping;

public static class MappingConfig
{
    public static void Configure()
    {
        TypeAdapterConfig<Candidate, CandidateResponseDto>.NewConfig()
            .Map(dest => dest.CurrentStage, src => src.CurrentStage.ToString());

        TypeAdapterConfig<Offer, OfferResponseDto>.NewConfig()
            .Map(dest => dest.CandidateName, src => src.Candidate != null ? src.Candidate.CandidateName : string.Empty)
            .Map(dest => dest.OfferType, src => src.OfferType.ToString())
            .Map(dest => dest.Status, src => src.Status.ToString());

        TypeAdapterConfig<Offer, OfferDetailResponseDto>.NewConfig()
            .Map(dest => dest.CandidateName, src => src.Candidate != null ? src.Candidate.CandidateName : string.Empty)
            .Map(dest => dest.OfferType, src => src.OfferType.ToString())
            .Map(dest => dest.Status, src => src.Status.ToString())
            .Map(dest => dest.CommonDetails, src => src.OfferCommonDetails)
            .Map(dest => dest.InternshipDetails, src => src.InternshipDetails)
            .Map(dest => dest.FullTimeDetails, src => src.FullTimeDetails)
            .Map(dest => dest.Workflow, src => src.OfferWorkflow);

        TypeAdapterConfig<OfferCommonDetails, OfferCommonDetailsResponseDto>.NewConfig();

        TypeAdapterConfig<InternshipDetails, InternshipDetailsResponseDto>.NewConfig()
            .Map(dest => dest.PayFrequency, src => src.PayFrequency.ToString());

        TypeAdapterConfig<FullTimeDetails, FullTimeDetailsResponseDto>.NewConfig()
            .Map(dest => dest.EmploymentType, src => src.EmploymentType.ToString());

        TypeAdapterConfig<OfferWorkflow, OfferWorkflowResponseDto>.NewConfig()
            .Map(dest => dest.Status, src => src.Status.ToString());

        TypeAdapterConfig<OfferWorkflowStep, OfferWorkflowStepResponseDto>.NewConfig()
            .Map(dest => dest.Role, src => src.Role.ToString())
            .Map(dest => dest.Status, src => src.Status.ToString())
            .Map(dest => dest.ApproverName, src => string.Empty);

        TypeAdapterConfig<AuditLog, AuditLogResponseDto>.NewConfig()
            .Map(dest => dest.PerformedByUserName, src => string.Empty);

        TypeAdapterConfig<Notification, NotificationResponseDto>.NewConfig()
            .Map(dest => dest.NotificationType, src => src.NotificationType.ToString());

        TypeAdapterConfig<ApprovalChain, ApprovalChainResponseDto>.NewConfig();

        TypeAdapterConfig<ApprovalChainStep, ApprovalChainStepResponseDto>.NewConfig()
            .Map(dest => dest.Role, src => src.Role.ToString())
            .Map(dest => dest.AssignedUserName, src => string.Empty);

        TypeAdapterConfig<OfferVersion, OfferVersionHistoryResponseDto>.NewConfig()
            .Map(dest => dest.StatusAtVersion, src => src.StatusAtVersion.ToString())
            .Map(dest => dest.ArchivedByUserName, src => string.Empty);
    }
}
