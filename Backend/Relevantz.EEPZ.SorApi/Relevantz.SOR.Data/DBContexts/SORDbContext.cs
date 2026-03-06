using Microsoft.EntityFrameworkCore;
using Relevantz.SOR.Common.Entities;
using Relevantz.SOR.Common.Enums;

namespace Relevantz.SOR.Data.DBContexts;

public partial class SORDbContext : DbContext
{
    public SORDbContext(DbContextOptions<SORDbContext> options) : base(options) { }

    public virtual DbSet<Candidate> Candidates { get; set; }
    public virtual DbSet<Offer> Offers { get; set; }
    public virtual DbSet<OfferCommonDetails> OfferCommonDetails { get; set; }
    public virtual DbSet<InternshipDetails> InternshipDetails { get; set; }
    public virtual DbSet<FullTimeDetails> FullTimeDetails { get; set; }
    public virtual DbSet<OfferWorkflow> OfferWorkflows { get; set; }
    public virtual DbSet<OfferWorkflowStep> OfferWorkflowSteps { get; set; }
    public virtual DbSet<ApprovalChain> ApprovalChains { get; set; }
    public virtual DbSet<ApprovalChainStep> ApprovalChainSteps { get; set; }
    public virtual DbSet<AuditLog> AuditLogs { get; set; }
    public virtual DbSet<Notification> Notifications { get; set; }
    public virtual DbSet<OfferTemplate> OfferTemplates { get; set; }
    public virtual DbSet<OfferVersion> OfferVersions { get; set; }
    public virtual DbSet<FinanceBudget> FinanceBudgets { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Candidate>(entity =>
        {
            entity.HasKey(e => e.CandidateId);
            entity.Property(e => e.CandidateName).HasMaxLength(200).IsRequired();
            entity.Property(e => e.Email).HasMaxLength(200).IsRequired();
            entity.Property(e => e.Phone).HasMaxLength(20).IsRequired();
            entity.Property(e => e.Address).HasMaxLength(500);
            entity.Property(e => e.CurrentStage).HasConversion<string>().HasMaxLength(50);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP(6)");
        });

        modelBuilder.Entity<Offer>(entity =>
        {
            entity.HasKey(e => e.OfferId);
            entity.Property(e => e.OfferNumber).HasMaxLength(50).IsRequired();
            entity.Property(e => e.OfferType).HasConversion<string>().HasMaxLength(20);
            entity.Property(e => e.Status).HasConversion<string>().HasMaxLength(50);
            entity.Property(e => e.Version).HasDefaultValue(1);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP(6)");
            entity.HasOne(e => e.Candidate)
                .WithMany(c => c.Offers)
                .HasForeignKey(e => e.CandidateId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(e => e.OfferCommonDetails)
                .WithOne(d => d.Offer)
                .HasForeignKey<OfferCommonDetails>(d => d.OfferId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.InternshipDetails)
                .WithOne(d => d.Offer)
                .HasForeignKey<InternshipDetails>(d => d.OfferId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.FullTimeDetails)
                .WithOne(d => d.Offer)
                .HasForeignKey<FullTimeDetails>(d => d.OfferId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.OfferWorkflow)
                .WithOne(w => w.Offer)
                .HasForeignKey<OfferWorkflow>(w => w.OfferId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<OfferCommonDetails>(entity =>
        {
            entity.HasKey(e => e.OfferCommonDetailsId);
            entity.Property(e => e.CandidateName).HasMaxLength(200).IsRequired();
            entity.Property(e => e.CandidateEmail).HasMaxLength(200).IsRequired();
            entity.Property(e => e.CandidatePhone).HasMaxLength(20).IsRequired();
            entity.Property(e => e.Designation).HasMaxLength(200).IsRequired();
            entity.Property(e => e.Department).HasMaxLength(200).IsRequired();
            entity.Property(e => e.WorkLocation).HasMaxLength(200).IsRequired();
            entity.Property(e => e.ReportingManager).HasMaxLength(200).IsRequired();
            entity.Property(e => e.CompanyName).HasMaxLength(200).IsRequired();
            entity.Property(e => e.HrContactName).HasMaxLength(200).IsRequired();
            entity.Property(e => e.HrEmail).HasMaxLength(200).IsRequired();
            entity.Property(e => e.HrPhone).HasMaxLength(20).IsRequired();
            entity.Property(e => e.SignatoryName).HasMaxLength(200).IsRequired();
            entity.Property(e => e.SignatoryDesignation).HasMaxLength(200).IsRequired();
            entity.Property(e => e.CompanyPolicyText).HasMaxLength(2000);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP(6)");
        });

        modelBuilder.Entity<InternshipDetails>(entity =>
        {
            entity.HasKey(e => e.InternshipDetailsId);
            entity.Property(e => e.StipendAmount).HasColumnType("decimal(18,2)");
            entity.Property(e => e.PayFrequency).HasConversion<string>().HasMaxLength(30);
            entity.Property(e => e.InsuranceAmount).HasColumnType("decimal(18,2)");
            entity.Property(e => e.FullTimeSalaryAfterInternship).HasColumnType("decimal(18,2)");
            entity.Property(e => e.JoiningBonus).HasColumnType("decimal(18,2)");
            entity.Property(e => e.RetentionBonus).HasColumnType("decimal(18,2)");
            entity.Property(e => e.BreakageCharges).HasColumnType("decimal(18,2)");
            entity.Property(e => e.AccommodationCost).HasColumnType("decimal(18,2)");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP(6)");
        });

        modelBuilder.Entity<FullTimeDetails>(entity =>
        {
            entity.HasKey(e => e.FullTimeDetailsId);
            entity.Property(e => e.EmploymentType).HasConversion<string>().HasMaxLength(30);
            entity.Property(e => e.AnnualCtc).HasColumnType("decimal(18,2)");
            entity.Property(e => e.BasicSalary).HasColumnType("decimal(18,2)");
            entity.Property(e => e.Hra).HasColumnType("decimal(18,2)");
            entity.Property(e => e.Allowances).HasColumnType("decimal(18,2)");
            entity.Property(e => e.BonusOrVariablePay).HasColumnType("decimal(18,2)");
            entity.Property(e => e.JoiningBonus).HasColumnType("decimal(18,2)");
            entity.Property(e => e.EsopDetails).HasMaxLength(500);
            entity.Property(e => e.ProbationPeriod).HasMaxLength(100);
            entity.Property(e => e.InsurancePlan).HasMaxLength(200);
            entity.Property(e => e.LeaveEntitlement).HasMaxLength(500);
            entity.Property(e => e.NoticePeriod).HasMaxLength(100);
            entity.Property(e => e.OtherBenefits).HasMaxLength(1000);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP(6)");
        });

        modelBuilder.Entity<OfferWorkflow>(entity =>
        {
            entity.HasKey(e => e.OfferWorkflowId);
            entity.Property(e => e.WorkflowNumber).HasMaxLength(50).IsRequired();
            entity.Property(e => e.Status).HasConversion<string>().HasMaxLength(50);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP(6)");
        });

        modelBuilder.Entity<OfferWorkflowStep>(entity =>
        {
            entity.HasKey(e => e.OfferWorkflowStepId);
            entity.Property(e => e.Role).HasConversion<string>().HasMaxLength(30);
            entity.Property(e => e.Status).HasConversion<string>().HasMaxLength(30);
            entity.Property(e => e.Comments).HasMaxLength(500);
            entity.Property(e => e.SkipJustification).HasMaxLength(500);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP(6)");
            entity.HasOne(e => e.OfferWorkflow)
                .WithMany(w => w.Steps)
                .HasForeignKey(e => e.OfferWorkflowId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ApprovalChain>(entity =>
        {
            entity.HasKey(e => e.ApprovalChainId);
            entity.Property(e => e.ChainName).HasMaxLength(200).IsRequired();
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP(6)");
        });

        modelBuilder.Entity<ApprovalChainStep>(entity =>
        {
            entity.HasKey(e => e.ApprovalChainStepId);
            entity.Property(e => e.Role).HasConversion<string>().HasMaxLength(30);
            entity.HasOne(e => e.ApprovalChain)
                .WithMany(c => c.Steps)
                .HasForeignKey(e => e.ApprovalChainId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<AuditLog>(entity =>
        {
            entity.HasKey(e => e.AuditLogId);
            entity.Property(e => e.EntityType).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Action).HasMaxLength(100).IsRequired();
            entity.Property(e => e.PerformedAt).HasDefaultValueSql("CURRENT_TIMESTAMP(6)");
            entity.HasOne(e => e.Offer)
                .WithMany(o => o.AuditLogs)
                .HasForeignKey(e => e.OfferId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<Notification>(entity =>
        {
            entity.HasKey(e => e.NotificationId);
            entity.Property(e => e.Title).HasMaxLength(200).IsRequired();
            entity.Property(e => e.Message).HasMaxLength(1000).IsRequired();
            entity.Property(e => e.NotificationType).HasConversion<string>().HasMaxLength(50);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP(6)");
        });

        modelBuilder.Entity<OfferTemplate>(entity =>
        {
            entity.HasKey(e => e.OfferTemplateId);
            entity.Property(e => e.TemplateName).HasMaxLength(200).IsRequired();
            entity.Property(e => e.OfferType).HasConversion<string>().HasMaxLength(20);
            entity.Property(e => e.HtmlContent).IsRequired();
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP(6)");
        });

        modelBuilder.Entity<OfferVersion>(entity =>
        {
            entity.HasKey(e => e.OfferVersionId);
            entity.Property(e => e.StatusAtVersion).HasConversion<string>().HasMaxLength(50);
            entity.Property(e => e.ArchivedAt).HasDefaultValueSql("CURRENT_TIMESTAMP(6)");
            entity.HasOne(e => e.Offer)
                .WithMany(o => o.OfferVersions)
                .HasForeignKey(e => e.OfferId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<FinanceBudget>(entity =>
        {
            entity.HasKey(e => e.FinanceBudgetId);
            entity.Property(e => e.TotalBudget).HasColumnType("decimal(18,2)");
            entity.Property(e => e.UsedBudget).HasColumnType("decimal(18,2)");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP(6)");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
