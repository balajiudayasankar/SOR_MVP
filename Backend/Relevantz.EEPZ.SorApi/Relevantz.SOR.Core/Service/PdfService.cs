using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using Relevantz.SOR.Common.Entities;
using Relevantz.SOR.Common.Enums;
using Relevantz.SOR.Core.IService;
using Relevantz.SOR.Data.IRepository;
using System.Globalization;

namespace Relevantz.SOR.Core.Service;

public class PdfService : IPdfService
{
    private readonly IOfferRepository _offerRepository;

    public PdfService(IOfferRepository offerRepository)
    {
        _offerRepository = offerRepository;
        QuestPDF.Settings.License = LicenseType.Community;
    }

    public async Task<byte[]> GenerateAsync(int offerId)
    {
        var offer = await _offerRepository.GetWithDetailsAsync(offerId);
        if (offer == null)
            throw new KeyNotFoundException("Offer not found.");
        return BuildDocument(offer).GeneratePdf();
    }

    public async Task<string> GenerateAndSaveAsync(int offerId)
    {
        var pdfBytes  = await GenerateAsync(offerId);
        var directory = Path.Combine("wwwroot", "offers");
        Directory.CreateDirectory(directory);
        var fileName = $"offer_{offerId}_{DateTime.UtcNow:yyyyMMddHHmmss}.pdf";
        var fullPath = Path.Combine(directory, fileName);
        await File.WriteAllBytesAsync(fullPath, pdfBytes);
        return fullPath;
    }

    
    
    

    private static Document BuildDocument(Offer offer)
    {
        var common      = offer.OfferCommonDetails;
        var full        = offer.FullTimeDetails;
        var intern      = offer.InternshipDetails;
        var isFullTime  = offer.OfferType == OfferType.FullTime;
        var accent      = isFullTime ? "#003366" : "#1a6b3c";
        var accentLight = isFullTime ? "#f0f4ff" : "#eafff3";

        return Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.MarginHorizontal(45);
                page.MarginTop(28);
                page.MarginBottom(28);
                page.DefaultTextStyle(x => x.FontSize(10).FontFamily("Arial"));

                
                page.Header().Column(col =>
                {
                    col.Item().BorderBottom(2).BorderColor(accent).PaddingBottom(6).Row(row =>
                    {
                        row.RelativeItem().Column(info =>
                        {
                            
                            info.Item()
                                .DefaultTextStyle(x => x.FontSize(14).Bold().FontColor(accent))
                                .Text(common?.CompanyName ?? "");

                            info.Item()
                                .DefaultTextStyle(x => x.FontSize(8.5f).FontColor("#555555"))
                                .Text($"Offer Ref: {offer.OfferNumber}  |  Issue Date: {Fmt(common?.OfferIssueDate)}");

                            if (isFullTime)
                                info.Item()
                                    .DefaultTextStyle(x => x.FontSize(8.5f).FontColor("#555555"))
                                    .Text($"Document Version: v{offer.Version}");
                        });

                        row.ConstantItem(140).AlignRight().AlignMiddle()
                            .DefaultTextStyle(x => x.FontSize(9).Bold().FontColor(accent))
                            .Text(isFullTime ? "OFFER OF EMPLOYMENT" : "INTERNSHIP OFFER LETTER");
                    });
                    col.Item().Height(5);
                });

                
                page.Footer().BorderTop(1).BorderColor(accent).PaddingTop(4).Row(row =>
                {
                    row.RelativeItem()
                        .DefaultTextStyle(x => x.FontSize(8).FontColor("#666666"))
                        .Text($"{common?.CompanyName ?? ""} | Private & Confidential");

                    row.RelativeItem().AlignCenter().Text(t =>
                    {
                        t.DefaultTextStyle(x => x.FontSize(8).FontColor("#666666"));
                        t.Span("Page ");
                        t.CurrentPageNumber();
                        t.Span(" of ");
                        t.TotalPages();
                    });

                    row.RelativeItem().AlignRight()
                        .DefaultTextStyle(x => x.FontSize(8).FontColor("#666666"))
                        .Text(common?.HrEmail ?? "");
                });

                
                page.Content().Column(content =>
                {
                    content.Spacing(7);

                    
                    content.Item()
                        .Background(accent).PaddingVertical(3).PaddingHorizontal(6)
                        .AlignCenter()
                        .DefaultTextStyle(x => x.FontSize(8).Bold().FontColor("#FFFFFF"))
                        .Text("STRICTLY PRIVATE & CONFIDENTIAL");

                    content.Item()
                        .PaddingVertical(6).AlignCenter()
                        .DefaultTextStyle(x => x.FontSize(15).Bold().FontColor(accent))
                        .Text(isFullTime ? "OFFER OF EMPLOYMENT" : "INTERNSHIP OFFER LETTER");

                    
                    content.Item().Background(accentLight).BorderLeft(3).BorderColor(accent)
                        .Padding(8).Row(row =>
                        {
                            row.RelativeItem()
                                .DefaultTextStyle(x => x.Bold().FontSize(10))
                                .Text($"To: {common?.CandidateName ?? ""}");
                            row.RelativeItem()
                                .DefaultTextStyle(x => x.FontSize(10))
                                .Text($"Role: {common?.Designation ?? ""}");
                            row.RelativeItem()
                                .DefaultTextStyle(x => x.FontSize(10))
                                .Text($"Dept: {common?.Department ?? ""}");
                        });

                    if (isFullTime && full != null)
                        BuildFullTimeContent(content, offer, common, full, accent, accentLight);
                    else if (!isFullTime && intern != null)
                        BuildInternshipContent(content, offer, common, intern, accent, accentLight);
                });
            });
        });
    }

    
    
    

    private static void BuildFullTimeContent(
        ColumnDescriptor col, Offer offer,
        OfferCommonDetails? c, FullTimeDetails ft,
        string accent, string accentLight)
    {
        

        
        col.Item().DefaultTextStyle(x => x.FontSize(10)).Text(t =>
        {
            t.Span("We are delighted to extend this formal offer of employment with ");
            t.Span(c?.CompanyName ?? "").Bold();
            t.Span(" for the role of ");
            t.Span(c?.Designation ?? "").Bold();
            t.Span(" within the ");
            t.Span(c?.Department ?? "").Bold();
            t.Span(". This offer is contingent upon successful completion of our pre-employment verification process and your acceptance of the terms outlined herein.");
        });

        col.Item()
            .DefaultTextStyle(x => x.FontSize(10))
            .Text($"We look forward to welcoming you on board on {Fmt(c?.JoiningDate)}.");

        SectionTitle(col, "1. Employment Details", accent);
        col.Item().Table(t =>
        {
            t.ColumnsDefinition(cd => { cd.RelativeColumn(2); cd.RelativeColumn(3); });
            LabelRow(t, "Candidate Name",    c?.CandidateName,             accent, accentLight);
            LabelRow(t, "Designation",       c?.Designation,               accent, accentLight);
            LabelRow(t, "Department",        c?.Department,                accent, accentLight);
            LabelRow(t, "Employment Type",   ft.EmploymentType.ToString(), accent, accentLight);
            LabelRow(t, "Work Location",     c?.WorkLocation,              accent, accentLight);
            LabelRow(t, "Reporting Manager", c?.ReportingManager,          accent, accentLight);
            LabelRow(t, "Date of Joining",   Fmt(c?.JoiningDate),          accent, accentLight);
            LabelRow(t, "Probation Period",  ft.ProbationPeriod,           accent, accentLight);
            LabelRow(t, "Confirmation",      ft.ConfirmationTerms,         accent, accentLight);
            LabelRow(t, "Working Days",      c?.WorkingDays,               accent, accentLight);
            LabelRow(t, "Working Hours",     c?.WorkingHours,              accent, accentLight);
            LabelRow(t, "Weekly Hours", c?.WeeklyHours.ToString("0.##") ?? "—", accent, accentLight);
            LabelRow(t, "Notice Period",     ft.NoticePeriod,              accent, accentLight);
        });

        SectionTitle(col, "2. Compensation Structure (Annual)", accent);
        col.Item().Table(t =>
        {
            t.ColumnsDefinition(cd => { cd.RelativeColumn(3); cd.RelativeColumn(2); });

            
            t.Cell().Background(accent).Padding(5).Text(tx =>
            {
                tx.DefaultTextStyle(x => x.Bold().FontColor("#FFFFFF").FontSize(10));
                tx.Span("Compensation Component");
            });
            t.Cell().Background(accent).Padding(5).Text(tx =>
            {
                tx.DefaultTextStyle(x => x.Bold().FontColor("#FFFFFF").FontSize(10));
                tx.Span("Amount (INR)");
            });

            CompRow(t, "Basic Salary",         ft.BasicSalary);
            CompRow(t, "House Rent Allowance", ft.Hra);
            CompRow(t, "Special Allowances",   ft.Allowances);
            CompRow(t, "Bonus / Variable Pay", ft.BonusOrVariablePay);
            CompRow(t, "Joining Bonus",        ft.JoiningBonus);

            t.Cell().BorderTop(1).BorderColor("#cccccc").Padding(5).Text(tx =>
            {
                tx.DefaultTextStyle(x => x.Bold()); tx.Span("Total Annual CTC");
            });
            t.Cell().BorderTop(1).BorderColor("#cccccc").Padding(5).Text(tx =>
            {
                tx.DefaultTextStyle(x => x.Bold()); tx.Span(FmtCurr(ft.AnnualCtc));
            });
        });

        col.Item()
            .DefaultTextStyle(x => x.FontSize(8).FontColor("#666666"))
            .Text($"* Statutory deductions (PF, TDS, etc.) apply as per law. ESOP: {ft.EsopDetails ?? "N/A"}");

        col.Item().PageBreak();

        

        SectionTitle(col, "3. Benefits & Entitlements", accent);
        col.Item().Table(t =>
        {
            t.ColumnsDefinition(cd => { cd.RelativeColumn(2); cd.RelativeColumn(3); });
            LabelRow(t, "PF Eligibility",       ft.PfEligibility ? "Yes" : "No",       accent, accentLight);
            LabelRow(t, "Gratuity Eligibility", ft.GratuityEligibility ? "Yes" : "No", accent, accentLight);
            LabelRow(t, "Insurance Plan",       ft.InsurancePlan,                       accent, accentLight);
            LabelRow(t, "Leave Entitlement",    ft.LeaveEntitlement,                    accent, accentLight);
            LabelRow(t, "Other Benefits",       ft.OtherBenefits,                       accent, accentLight);
        });

        SectionTitle(col, "4. Terms & Conditions of Employment", accent);
        col.Item().DefaultTextStyle(x => x.FontSize(10))
            .Text("Your employment is governed by Company HR policies and applicable labour laws:");

        
        var ftConfText = c?.ConfidentialityClause == true
            ? "Confidentiality clause is applicable." : "";

        BulletPoint(col, "Probation",
            $"Probation for {ft.ProbationPeriod ?? "the specified period"}. Either party may terminate with 3 days' written notice during probation.", accent);
        BulletPoint(col, "Notice Period",
            $"Post-confirmation notice period of {ft.NoticePeriod ?? "as specified"} is applicable on either side.", accent);
        BulletPoint(col, "Background Verification",
            $"Required: {(ft.BackgroundVerificationRequired ? "Yes" : "No")}. Any misrepresentation results in immediate termination.", accent);
        BulletPoint(col, "Confidentiality",
            $"Strict confidentiality of all business, technical, financial and client information required. {ftConfText}", accent);
        BulletPoint(col, "Non-Compete",
            $"Applicable: {(ft.NonCompeteEnabled ? "Yes" : "No")}. No solicitation of clients or employees for 12 months post-separation.", accent);
        BulletPoint(col, "Intellectual Property",
            "All work, code, designs, and deliverables created during employment are the exclusive IP of the Company.", accent);
        BulletPoint(col, "Code of Conduct",
            "Adherence to Code of Conduct, IT Security Policy, and Data Privacy Policy is mandatory at all times.", accent);
        BulletPoint(col, "Equipment & Assets",
            "Company-issued equipment must be returned in good condition upon separation. Loss may result in cost recovery.", accent);

        SectionTitle(col, "5. Company Policies", accent);
        foreach (var policy in new[]
        {
            "Equal Opportunity & Anti-Harassment Policy",
            "Information Security & Acceptable Use Policy",
            "Remote Work & Hybrid Engagement Policy",
            "Performance Management & Appraisal Framework",
            "Travel & Expense Reimbursement Policy",
            "Social Media & Communication Policy"
        })
            BulletPoint(col, null, policy, accent);

        if (!string.IsNullOrWhiteSpace(c?.CompanyPolicyText))
            col.Item().DefaultTextStyle(x => x.FontSize(10)).Text(c.CompanyPolicyText);

        col.Item().PageBreak();

        

        SectionTitle(col, "6. Statutory Compliance & Declarations", accent);
        col.Item().DefaultTextStyle(x => x.FontSize(10))
            .Text("This employment offer shall comply with applicable Indian labour laws including the Industrial Disputes Act, Payment of Wages Act, Employees' Provident Fund Act, and the Payment of Gratuity Act. Any statutory amendment shall automatically apply to your employment terms.");
        col.Item().DefaultTextStyle(x => x.FontSize(10))
            .Text("You are required to submit all documentation — educational certificates, identity proof, prior employment relieving letters, and statutory forms — on or before your date of joining.");

        SectionTitle(col, "7. Offer Validity & Acceptance", accent);
        col.Item().DefaultTextStyle(x => x.FontSize(10))
            .Text($"This offer is valid for seven (7) calendar days from the issue date — {Fmt(c?.OfferIssueDate)}. Non-response will result in automatic withdrawal.");
        col.Item().DefaultTextStyle(x => x.FontSize(10))
            .Text("Please sign and return a copy of this letter as your formal acceptance.");

        col.Item().Table(t =>
        {
            t.ColumnsDefinition(cd => { cd.RelativeColumn(2); cd.RelativeColumn(3); });
            LabelRow(t, "HR Contact", c?.HrContactName, accent, accentLight);
            LabelRow(t, "HR Email",   c?.HrEmail,        accent, accentLight);
            LabelRow(t, "HR Phone",   c?.HrPhone,        accent, accentLight);
        });

        col.Item().PaddingTop(16).DefaultTextStyle(x => x.FontSize(10)).Text("Yours Sincerely,");
        col.Item().PaddingTop(28).PaddingBottom(4).BorderBottom(1).BorderColor("#333333");
        col.Item().PaddingTop(4).DefaultTextStyle(x => x.Bold().FontSize(10)).Text(c?.SignatoryName ?? "");
        col.Item().DefaultTextStyle(x => x.FontSize(10)).Text(c?.SignatoryDesignation ?? "");
        col.Item().DefaultTextStyle(x => x.Bold().FontSize(10)).Text(c?.CompanyName ?? "");

        SectionTitle(col, "Candidate Acceptance", accent);
        col.Item().DefaultTextStyle(x => x.FontSize(10)).Text(t =>
        {
            t.Span("I, "); t.Span(c?.CandidateName ?? "").Bold();
            t.Span(", hereby accept this offer for the position of ");
            t.Span(c?.Designation ?? "").Bold();
            t.Span(" at "); t.Span(c?.CompanyName ?? "").Bold();
            t.Span(" on the terms and conditions stated above.");
        });

        col.Item().PaddingTop(12).Row(row =>
        {
            row.RelativeItem().Column(sig =>
            {
                sig.Item().PaddingTop(32).PaddingBottom(4).BorderBottom(1).BorderColor("#333333");
                sig.Item().PaddingTop(3)
                    .DefaultTextStyle(x => x.FontSize(9).FontColor("#666666"))
                    .Text("Candidate Signature");
            });
            row.ConstantItem(30);
            row.RelativeItem().Column(sig =>
            {
                sig.Item().PaddingTop(32).PaddingBottom(4).BorderBottom(1).BorderColor("#333333");
                sig.Item().PaddingTop(3)
                    .DefaultTextStyle(x => x.FontSize(9).FontColor("#666666"))
                    .Text("Date");
            });
        });

        col.Item().PaddingTop(10).DefaultTextStyle(x => x.FontSize(10)).Text(t =>
        {
            t.Span("Name: ").Bold();  t.Span(c?.CandidateName ?? "");
            t.Span("    Email: ").Bold(); t.Span(c?.CandidateEmail ?? "");
            t.Span("    Phone: ").Bold(); t.Span(c?.CandidatePhone ?? "");
        });

        col.Item().PaddingTop(12).AlignCenter()
            .DefaultTextStyle(x => x.FontSize(8).FontColor("#888888"))
            .Text($"System-generated document | {c?.CompanyName ?? ""} | Ref: {offer.OfferNumber}");
    }

    
    
    

    private static void BuildInternshipContent(
        ColumnDescriptor col, Offer offer,
        OfferCommonDetails? c, InternshipDetails i,
        string accent, string accentLight)
    {
        

        col.Item().DefaultTextStyle(x => x.FontSize(10)).Text(t =>
        {
            t.Span("We are pleased to offer you an internship opportunity with ");
            t.Span(c?.CompanyName ?? "").Bold();
            t.Span(" for the role of ");
            t.Span(c?.Designation ?? "").Bold();
            t.Span(" within the ");
            t.Span(c?.Department ?? "").Bold();
            t.Span(". This engagement is designed to provide hands-on industry experience in a professional IT environment.");
        });

        SectionTitle(col, "1. Internship Engagement Details", accent);
        col.Item().Table(t =>
        {
            t.ColumnsDefinition(cd => { cd.RelativeColumn(2); cd.RelativeColumn(3); });
            LabelRow(t, "Intern Name",          c?.CandidateName,               accent, accentLight);
            LabelRow(t, "Designation / Role",   c?.Designation,                 accent, accentLight);
            LabelRow(t, "Department",           c?.Department,                  accent, accentLight);
            LabelRow(t, "Reporting Manager",    c?.ReportingManager,            accent, accentLight);
            LabelRow(t, "Start Date",           Fmt(i.InternshipStartDate),     accent, accentLight);
            LabelRow(t, "End Date",             Fmt(i.InternshipEndDate),       accent, accentLight);
            LabelRow(t, "Duration",             $"{i.DurationMonths} Month(s)", accent, accentLight);
            LabelRow(t, "Training Location",    i.TrainingLocation,             accent, accentLight);
            LabelRow(t, "Training Institution", i.TrainingInstitution,          accent, accentLight);
            LabelRow(t, "Training Duration",    i.TrainingDuration,             accent, accentLight);
            LabelRow(t, "Working Days",         i.TrainingWorkingDays,          accent, accentLight);
            LabelRow(t, "Work Location",        c?.WorkLocation,                accent, accentLight);
        });

        SectionTitle(col, "2. Stipend & Financial Benefits", accent);
        col.Item().Table(t =>
        {
            t.ColumnsDefinition(cd => { cd.RelativeColumn(3); cd.RelativeColumn(2); });
            t.Cell().Background(accent).Padding(5).Text(tx =>
            {
                tx.DefaultTextStyle(x => x.Bold().FontColor("#FFFFFF").FontSize(10));
                tx.Span("Component");
            });
            t.Cell().Background(accent).Padding(5).Text(tx =>
            {
                tx.DefaultTextStyle(x => x.Bold().FontColor("#FFFFFF").FontSize(10));
                tx.Span("Details");
            });
            StrRow(t, "Monthly Stipend",    FmtCurr(i.StipendAmount));
            StrRow(t, "Payment Frequency",  i.PayFrequency.ToString());
            StrRow(t, "Payment Timing",     i.PaymentTiming                              ?? "N/A");
            StrRow(t, "Joining Bonus",      i.JoiningBonus.HasValue                      ? FmtCurr(i.JoiningBonus.Value)                      : "N/A");
            StrRow(t, "Retention Bonus",    i.RetentionBonus.HasValue                    ? FmtCurr(i.RetentionBonus.Value)                    : "N/A");
            StrRow(t, "Insurance Coverage", $"{(i.InsuranceEnabled ? "Yes" : "No")} — {(i.InsuranceAmount.HasValue ? FmtCurr(i.InsuranceAmount.Value) : "N/A")}");
            StrRow(t, "Accommodation",      $"{(i.AccommodationAvailable ? "Yes" : "No")} — Cost: {(i.AccommodationCost.HasValue ? FmtCurr(i.AccommodationCost.Value) : "N/A")}");
            StrRow(t, "Other Benefits",     i.OtherBenefits                              ?? "N/A");
            StrRow(t, "Full-Time Salary Post Internship", i.FullTimeSalaryAfterInternship.HasValue ? FmtCurr(i.FullTimeSalaryAfterInternship.Value) : "N/A");
        });

        col.Item()
            .DefaultTextStyle(x => x.FontSize(8).FontColor("#666666"))
            .Text("* Stipend is subject to applicable TDS deductions per the Income Tax Act.");

        SectionTitle(col, "3. Documents Required on Joining", accent);
        col.Item().DefaultTextStyle(x => x.FontSize(10))
            .Text("Please carry the following documents (originals + self-attested copies) on your first day:");
        col.Item().DefaultTextStyle(x => x.FontSize(10))
            .Text(i.RequiredDocuments ?? "As communicated by HR.");

        col.Item().PageBreak();

        

        SectionTitle(col, "4. Terms & Conditions of Internship", accent);

        
        var internConfText = c?.ConfidentialityClause == true
            ? "Confidentiality clause is applicable." : "";

        
        var breakageText = i.BreakageCharges.HasValue
            ? FmtCurr(i.BreakageCharges.Value) : "N/A";

        BulletPoint(col, "Nature of Engagement",
            $"This is a fixed-term internship of {i.DurationMonths} month(s) and does not constitute permanent employment.", accent);
        BulletPoint(col, "Confidentiality",
            $"You shall not disclose any proprietary, technical, business, or client information. {internConfText}", accent);
        BulletPoint(col, "Intellectual Property",
            "All work products, code, designs, and deliverables remain the exclusive IP of the Company.", accent);
        BulletPoint(col, "Code of Conduct",
            "Maintain professional conduct and follow all IT Security and Data Privacy policies.", accent);
        BulletPoint(col, "Attendance",
            "Regular attendance is mandatory. Excessive unplanned absences may result in termination.", accent);
        BulletPoint(col, "Service Agreement",
            $"Duration: {(i.ServiceAgreementDurationMonths.HasValue ? i.ServiceAgreementDurationMonths.Value + " month(s)" : "N/A")} | Period: {i.ServiceAgreementPeriod ?? "N/A"} | Breakage Charges: {breakageText}.", accent);
        BulletPoint(col, "Certificate & Retention",
            i.CertificateRetentionTerms ?? "Completion certificate issued upon successful completion.", accent);
        BulletPoint(col, "Termination",
            "Either party may terminate with three (3) days' written notice.", accent);

        SectionTitle(col, "5. Company Policies & Compliance", accent);
        foreach (var policy in new[]
        {
            "Information Security & Acceptable Use Policy",
            "Equal Opportunity & Anti-Harassment Policy",
            "Data Privacy & GDPR Compliance Policy",
            "Workplace Safety & Health Policy",
            "Asset Return Policy upon Completion of Internship"
        })
            BulletPoint(col, null, policy, accent);

        if (!string.IsNullOrWhiteSpace(c?.CompanyPolicyText))
            col.Item().DefaultTextStyle(x => x.FontSize(10)).Text(c.CompanyPolicyText);

        SectionTitle(col, "6. Offer Validity", accent);
        col.Item().DefaultTextStyle(x => x.FontSize(10))
            .Text($"This offer is valid for five (5) calendar days from {Fmt(c?.OfferIssueDate)}. Non-response will be treated as rejection.");

        col.Item().Table(t =>
        {
            t.ColumnsDefinition(cd => { cd.RelativeColumn(2); cd.RelativeColumn(3); });
            LabelRow(t, "HR Contact", c?.HrContactName, accent, accentLight);
            LabelRow(t, "HR Email",   c?.HrEmail,        accent, accentLight);
            LabelRow(t, "HR Phone",   c?.HrPhone,        accent, accentLight);
        });

        col.Item().PaddingTop(16).DefaultTextStyle(x => x.FontSize(10)).Text("Yours Sincerely,");
        col.Item().PaddingTop(28).PaddingBottom(4).BorderBottom(1).BorderColor("#333333");
        col.Item().PaddingTop(4).DefaultTextStyle(x => x.Bold().FontSize(10)).Text(c?.SignatoryName ?? "");
        col.Item().DefaultTextStyle(x => x.FontSize(10)).Text(c?.SignatoryDesignation ?? "");
        col.Item().DefaultTextStyle(x => x.Bold().FontSize(10)).Text(c?.CompanyName ?? "");

        SectionTitle(col, "Intern Acceptance", accent);
        col.Item().DefaultTextStyle(x => x.FontSize(10)).Text(t =>
        {
            t.Span("I, "); t.Span(c?.CandidateName ?? "").Bold();
            t.Span(", hereby accept this internship offer for the role of ");
            t.Span(c?.Designation ?? "").Bold();
            t.Span(" at "); t.Span(c?.CompanyName ?? "").Bold();
            t.Span(" on the terms and conditions stated above.");
        });

        col.Item().PaddingTop(12).Row(row =>
        {
            row.RelativeItem().Column(sig =>
            {
                sig.Item().PaddingTop(32).PaddingBottom(4).BorderBottom(1).BorderColor("#333333");
                sig.Item().PaddingTop(3)
                    .DefaultTextStyle(x => x.FontSize(9).FontColor("#666666"))
                    .Text("Intern Signature");
            });
            row.ConstantItem(30);
            row.RelativeItem().Column(sig =>
            {
                sig.Item().PaddingTop(32).PaddingBottom(4).BorderBottom(1).BorderColor("#333333");
                sig.Item().PaddingTop(3)
                    .DefaultTextStyle(x => x.FontSize(9).FontColor("#666666"))
                    .Text("Date");
            });
        });

        col.Item().PaddingTop(10).DefaultTextStyle(x => x.FontSize(10)).Text(t =>
        {
            t.Span("Name: ").Bold();    t.Span(c?.CandidateName ?? "");
            t.Span("    Email: ").Bold();   t.Span(c?.CandidateEmail ?? "");
            t.Span("    Phone: ").Bold();   t.Span(c?.CandidatePhone ?? "");
            t.Span("    Address: ").Bold(); t.Span(c?.CandidateAddress ?? "");
        });

        col.Item().PaddingTop(12).AlignCenter()
            .DefaultTextStyle(x => x.FontSize(8).FontColor("#888888"))
            .Text($"System-generated document | {c?.CompanyName ?? ""} | Ref: {offer.OfferNumber}");
    }

    
    
    

    private static void SectionTitle(ColumnDescriptor col, string title, string accent)
    {
        
        col.Item().PaddingTop(10).BorderBottom(1).BorderColor(accent).PaddingBottom(3)
            .DefaultTextStyle(x => x.FontSize(11).Bold().FontColor(accent))
            .Text(title);
    }

    private static void BulletPoint(ColumnDescriptor col, string? label, string text, string accent)
    {
        col.Item().PaddingVertical(2).Row(row =>
        {
            
            row.ConstantItem(10)
                .DefaultTextStyle(x => x.FontColor(accent).FontSize(10))
                .Text("•");
            row.RelativeItem().Text(t =>
            {
                t.DefaultTextStyle(x => x.FontSize(10));
                if (!string.IsNullOrWhiteSpace(label))
                    t.Span(label + ": ").Bold().FontColor(accent);
                t.Span(text);
            });
        });
    }

    private static void LabelRow(
        TableDescriptor t, string label, string? value,
        string accent, string accentLight)
    {
        t.Cell().Background(accentLight).BorderBottom(1).BorderColor("#dddddd").Padding(5)
            .DefaultTextStyle(x => x.Bold().FontSize(10)).Text(label);
        t.Cell().BorderBottom(1).BorderColor("#dddddd").Padding(5)
            .DefaultTextStyle(x => x.FontSize(10)).Text(value ?? "");
    }

    private static void CompRow(TableDescriptor t, string label, decimal value)
    {
        t.Cell().BorderBottom(1).BorderColor("#dddddd").Padding(5)
            .DefaultTextStyle(x => x.FontSize(10)).Text(label);
        t.Cell().BorderBottom(1).BorderColor("#dddddd").Padding(5)
            .DefaultTextStyle(x => x.FontSize(10)).Text(FmtCurr(value));
    }

    private static void StrRow(TableDescriptor t, string label, string value)
    {
        t.Cell().BorderBottom(1).BorderColor("#dddddd").Padding(5)
            .DefaultTextStyle(x => x.FontSize(10)).Text(label);
        t.Cell().BorderBottom(1).BorderColor("#dddddd").Padding(5)
            .DefaultTextStyle(x => x.FontSize(10)).Text(value);
    }

    
    
    

    private static string Fmt(DateOnly date)
        => date == default ? "" : date.ToString("dd MMMM yyyy", CultureInfo.InvariantCulture);

    private static string Fmt(DateOnly? date)
        => date.HasValue ? Fmt(date.Value) : "";

    private static string FmtCurr(decimal value)
        => string.Format(CultureInfo.InvariantCulture, "₹ {0:N2}", value);
}
