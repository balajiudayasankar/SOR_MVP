using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Relevantz.SOR.Common.Entities;

namespace Relevantz.SOR.Data.DBContexts;

public class DbInitializer
{
    public static async Task InitializeAsync(SORDbContext context, IConfiguration configuration)
    {
        try
        {
            Console.WriteLine("\n" + new string('=', 70));
            Console.WriteLine("   STARTING SOR DATABASE INITIALIZATION");
            Console.WriteLine(new string('=', 70) + "\n");

            await SeedOfferTemplatesAsync(context, configuration);
            await SeedFinanceBudgetsAsync(context);

            Console.WriteLine("\n" + new string('=', 70));
            Console.WriteLine("   SOR DATABASE INITIALIZATION COMPLETED SUCCESSFULLY!");
            Console.WriteLine(new string('=', 70) + "\n");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"\nERROR during SOR database initialization: {ex.Message}\n");
            throw;
        }
    }

    private static async Task SeedOfferTemplatesAsync(SORDbContext context, IConfiguration configuration)
    {
        var logoPath = configuration.GetValue<string>("CompanySettings:LogoPath")
                       ?? "/assets/images/company-logo.png";

        var templates = new List<OfferTemplate>
        {
            new OfferTemplate
            {
                TemplateName    = "Default Internship Offer Template",
                OfferType       = Common.Enums.OfferType.Internship,
                HtmlContent     = BuildInternshipTemplate(logoPath),
                IsDefault       = true,
                IsActive        = true,
                CreatedByUserId = 1,
                CreatedAt       = DateTime.UtcNow
            },
            new OfferTemplate
            {
                TemplateName    = "Default Full-Time Offer Template",
                OfferType       = Common.Enums.OfferType.FullTime,
                HtmlContent     = BuildFullTimeTemplate(logoPath),
                IsDefault       = true,
                IsActive        = true,
                CreatedByUserId = 1,
                CreatedAt       = DateTime.UtcNow
            }
        };

        foreach (var template in templates)
        {
            var exists = await context.OfferTemplates
                .AnyAsync(t => t.TemplateName == template.TemplateName);
            if (!exists)
                context.OfferTemplates.Add(template);
        }

        await context.SaveChangesAsync();
    }

    
    
    

    private static string BuildFullTimeTemplate(string logoPath)
    {
        var html = """
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  @page { margin: 150px 50px 100px 50px; }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Arial', sans-serif;
    font-size: 11.5px;
    line-height: 1.75;
    color: #1a1a1a;
  }

  /* ── Fixed Header ── */
  header {
    position: fixed;
    top: -120px;
    left: 0; right: 0;
    height: 100px;
    padding: 10px 50px;
    border-bottom: 2px solid #003366;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  header .logo { width: 160px; }

  header .company-info {
    text-align: right;
    font-size: 10px;
    color: #003366;
    line-height: 1.6;
  }

  header .company-info strong { font-size: 12px; }

  /* ── Fixed Footer ── */
  footer {
    position: fixed;
    bottom: -75px;
    left: 0; right: 0;
    height: 55px;
    padding: 8px 50px;
    border-top: 1px solid #003366;
    font-size: 9.5px;
    color: #666;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  /* ── Page Counter ── */
  .pagenum:before { content: counter(page); }
  .pagetotal:before { content: counter(pages); }

  /* ── Typography ── */
  h2 {
    text-align: center;
    font-size: 16px;
    letter-spacing: 2px;
    color: #003366;
    margin: 10px 0 6px 0;
    text-transform: uppercase;
  }

  h3 {
    font-size: 11.5px;
    color: #003366;
    text-transform: uppercase;
    letter-spacing: 1px;
    border-bottom: 1px solid #003366;
    padding-bottom: 3px;
    margin: 20px 0 8px 0;
  }

  p { margin-bottom: 8px; }

  /* ── Tables ── */
  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 6px;
    margin-bottom: 10px;
  }

  table td, table th {
    border: 1px solid #ccc;
    padding: 6px 10px;
    font-size: 11px;
  }

  table th {
    background-color: #003366;
    color: #fff;
    font-weight: bold;
    text-align: left;
  }

  table tr:nth-child(even) td { background-color: #f5f8ff; }

  .label-col { width: 45%; font-weight: bold; color: #333; background: #f0f4ff; }

  /* ── Misc ── */
  .ref-box {
    background: #f0f4ff;
    border-left: 4px solid #003366;
    padding: 8px 14px;
    margin: 10px 0 16px 0;
    font-size: 11px;
  }

  .highlight { color: #003366; font-weight: bold; }

  .terms-list { margin-left: 16px; margin-bottom: 8px; }
  .terms-list li { margin-bottom: 5px; }

  .sign-block { margin-top: 30px; }
  .sign-line  { border-bottom: 1px solid #333; width: 220px; margin-top: 40px; margin-bottom: 4px; }

  .page-break { page-break-after: always; }

  .confidential-strip {
    background: #003366;
    color: #fff;
    text-align: center;
    font-size: 9px;
    letter-spacing: 2px;
    padding: 3px 0;
    margin-bottom: 14px;
    text-transform: uppercase;
  }
</style>
</head>
<body>

<!-- FIXED HEADER -->
<header>
  <img src="__LOGO__" class="logo" alt="Company Logo"/>
  <div class="company-info">
    <strong>{{CompanyName}}</strong><br/>
    Offer Ref No: &nbsp;<strong>{{OfferNumber}}</strong><br/>
    Document Version: v{{OfferVersion}}<br/>
    Issue Date: {{OfferIssueDate}}
  </div>
</header>

<!-- FIXED FOOTER -->
<footer>
  <span>{{CompanyName}} | Private &amp; Confidential</span>
  <span>Page <span class="pagenum"></span> of <span class="pagetotal"></span></span>
  <span>{{HrEmail}} | {{HrPhone}}</span>
</footer>

<!-- ═══════════════════════════ PAGE 1 ═══════════════════════════ -->
<div class="confidential-strip">Strictly Private &amp; Confidential</div>

<h2>Offer of Employment</h2>

<div class="ref-box">
  <strong>To:</strong> {{CandidateName}} &nbsp;|&nbsp;
  <strong>Position:</strong> {{Designation}} &nbsp;|&nbsp;
  <strong>Department:</strong> {{Department}}
</div>

<p>Dear <strong>{{CandidateName}}</strong>,</p>

<p>
  We are delighted to extend this formal offer of employment with
  <strong>{{CompanyName}}</strong> for the role of
  <strong>{{Designation}}</strong> within the <strong>{{Department}}</strong>.
  This offer is contingent upon the successful completion of our pre-employment
  verification process and your acceptance of the terms outlined herein.
</p>

<p>
  We believe your skills and experience will be a valuable addition to our team,
  and we look forward to welcoming you on board on
  <strong>{{JoiningDate}}</strong>.
</p>

<!-- Section 1: Employment Details -->
<h3>1. Employment Details</h3>
<table>
  <tr><td class="label-col">Candidate Name</td><td>{{CandidateName}}</td></tr>
  <tr><td class="label-col">Designation</td><td>{{Designation}}</td></tr>
  <tr><td class="label-col">Department</td><td>{{Department}}</td></tr>
  <tr><td class="label-col">Employment Type</td><td>{{EmploymentType}}</td></tr>
  <tr><td class="label-col">Work Location</td><td>{{WorkLocation}}</td></tr>
  <tr><td class="label-col">Reporting Manager</td><td>{{ReportingManager}}</td></tr>
  <tr><td class="label-col">Date of Joining</td><td>{{JoiningDate}}</td></tr>
  <tr><td class="label-col">Probation Period</td><td>{{ProbationPeriod}}</td></tr>
  <tr><td class="label-col">Confirmation Terms</td><td>{{ConfirmationTerms}}</td></tr>
  <tr><td class="label-col">Working Days</td><td>{{WorkingDays}}</td></tr>
  <tr><td class="label-col">Daily Working Hours</td><td>{{WorkingHours}}</td></tr>
  <tr><td class="label-col">Weekly Hours</td><td>{{WeeklyHours}}</td></tr>
  <tr><td class="label-col">Notice Period</td><td>{{NoticePeriod}}</td></tr>
</table>

<!-- Section 2: Compensation -->
<h3>2. Compensation Structure (Annual)</h3>
<table>
  <tr><th>Compensation Component</th><th>Amount (INR)</th></tr>
  <tr><td>Basic Salary</td><td>{{BasicSalary}}</td></tr>
  <tr><td>House Rent Allowance (HRA)</td><td>{{Hra}}</td></tr>
  <tr><td>Special Allowances</td><td>{{Allowances}}</td></tr>
  <tr><td>Bonus / Variable Pay</td><td>{{BonusOrVariablePay}}</td></tr>
  <tr><td>Joining Bonus (One-Time)</td><td>{{JoiningBonus}}</td></tr>
  <tr>
    <td><strong>Total Annual CTC</strong></td>
    <td><strong>{{AnnualCtc}}</strong></td>
  </tr>
</table>

<p style="font-size:10px; color:#666;">
  * The above CTC is indicative and includes fixed and variable components.
    Statutory deductions (PF, TDS, etc.) shall apply as per applicable laws.
    ESOP details, if any: {{EsopDetails}}
</p>

<div class="page-break"></div>

<!-- ═══════════════════════════ PAGE 2 ═══════════════════════════ -->

<!-- Section 3: Benefits & Entitlements -->
<h3>3. Benefits &amp; Entitlements</h3>
<table>
  <tr><td class="label-col">PF Eligibility</td><td>{{PfEligibility}}</td></tr>
  <tr><td class="label-col">Gratuity Eligibility</td><td>{{GratuityEligibility}}</td></tr>
  <tr><td class="label-col">Insurance Plan</td><td>{{InsurancePlan}}</td></tr>
  <tr><td class="label-col">Leave Entitlement</td><td>{{LeaveEntitlement}}</td></tr>
  <tr><td class="label-col">Other Benefits</td><td>{{OtherBenefits}}</td></tr>
</table>

<!-- Section 4: Terms & Conditions -->
<h3>4. Terms &amp; Conditions of Employment</h3>

<p>
  Your employment with <strong>{{CompanyName}}</strong> is governed by the
  Company's HR policies, the Employee Handbook, and applicable labour laws.
  The following conditions form an integral part of this offer:
</p>

<ul class="terms-list">
  <li>
    <strong>Probation:</strong> You will be on probation for {{ProbationPeriod}}
    from your date of joining. During this period, either party may terminate
    employment with three (3) days' written notice. Performance will be formally
    reviewed prior to confirmation.
  </li>
  <li>
    <strong>Notice Period:</strong> Post-confirmation, a notice period of
    <strong>{{NoticePeriod}}</strong> is applicable on either side. The Company
    reserves the right to buy out the notice period at its discretion.
  </li>
  <li>
    <strong>Background Verification:</strong>
    Background verification required: <strong>{{BackgroundVerificationRequired}}</strong>.
    Any misrepresentation in your application or supporting documents will result
    in immediate termination without notice or compensation.
  </li>
  <li>
    <strong>Confidentiality:</strong> You are required to maintain strict
    confidentiality regarding all business, technical, financial, and client
    information during and after the tenure of your employment.
    {{ConfidentialityClause}}
  </li>
  <li>
    <strong>Non-Compete &amp; Non-Solicitation:</strong>
    Non-Compete clause applicable: <strong>{{NonCompeteEnabled}}</strong>.
    You agree not to directly or indirectly solicit clients or employees of
    {{CompanyName}} for a period of twelve (12) months post-separation.
  </li>
  <li>
    <strong>Intellectual Property:</strong> All work, innovations, code,
    designs, and deliverables created during your employment shall be the
    exclusive intellectual property of {{CompanyName}}.
  </li>
  <li>
    <strong>Code of Conduct:</strong> You are expected to adhere to the
    Company's Code of Conduct, IT Security Policy, Data Privacy Policy, and
    Anti-Bribery &amp; Corruption Policy at all times.
  </li>
  <li>
    <strong>Equipment &amp; Assets:</strong> Any company-issued equipment,
    hardware, or access credentials must be returned in good condition upon
    separation. Loss or damage may result in recovery of costs.
  </li>
</ul>

<!-- Section 5: Company Policies -->
<h3>5. Company Policies</h3>
<p>
  By accepting this offer, you acknowledge that you have read and agree to
  abide by all existing and future policies of {{CompanyName}}, including but
  not limited to:
</p>
<ul class="terms-list">
  <li>Equal Opportunity &amp; Anti-Harassment Policy</li>
  <li>Information Security &amp; Acceptable Use Policy</li>
  <li>Remote Work &amp; Hybrid Engagement Policy</li>
  <li>Performance Management &amp; Appraisal Framework</li>
  <li>Travel &amp; Expense Reimbursement Policy</li>
  <li>Social Media &amp; Communication Policy</li>
</ul>
<p>{{CompanyPolicyText}}</p>

<div class="page-break"></div>

<!-- ═══════════════════════════ PAGE 3 ═══════════════════════════ -->

<!-- Section 6: Statutory Compliance -->
<h3>6. Statutory Compliance &amp; Declarations</h3>
<p>
  This employment offer and your subsequent engagement shall at all times comply
  with applicable Indian labour laws, including the Industrial Disputes Act,
  Payment of Wages Act, Employees' Provident Fund Act, and the Payment of
  Gratuity Act. Any amendment in statutory regulations shall automatically apply
  to your employment terms.
</p>
<p>
  You are required to submit all necessary documentation including educational
  certificates, identity proof, prior employment relieving letters, and
  completed statutory forms (Form 2, Form 11, etc.) on or before your date of
  joining. Failure to do so may result in deferral or withdrawal of this offer.
</p>

<!-- Section 7: Offer Validity -->
<h3>7. Offer Validity &amp; Acceptance</h3>
<p>
  This offer letter is valid for <strong>seven (7) calendar days</strong> from
  the issue date — <strong>{{OfferIssueDate}}</strong>. Failure to communicate
  acceptance within this period will result in the automatic withdrawal of this
  offer. The Company reserves the right to withdraw this offer at any time prior
  to the commencement of employment in the event of unsatisfactory verification
  results or material misrepresentation.
</p>

<p>
  Please sign and return a copy of this letter as your formal acceptance. We are
  excited about the possibility of you joining our growing team and contributing
  to our mission.
</p>

<p>For any queries, please contact our HR team:</p>
<table>
  <tr><td class="label-col">HR Contact</td><td>{{HrContactName}}</td></tr>
  <tr><td class="label-col">HR Email</td><td>{{HrEmail}}</td></tr>
  <tr><td class="label-col">HR Phone</td><td>{{HrPhone}}</td></tr>
</table>

<!-- Signatory -->
<div class="sign-block">
  <p>Yours Sincerely,</p>
  <div class="sign-line"></div>
  <p><strong>{{SignatoryName}}</strong></p>
  <p>{{SignatoryDesignation}}</p>
  <p><strong>{{CompanyName}}</strong></p>
</div>

<br/><br/>

<!-- Acceptance Block -->
<h3>Candidate Acceptance</h3>
<p>
  I, <strong>{{CandidateName}}</strong>, hereby accept the offer of employment
  extended by <strong>{{CompanyName}}</strong> for the position of
  <strong>{{Designation}}</strong> on the terms and conditions stated above.
</p>

<table class="no-border" style="margin-top:20px;">
  <tr>
    <td width="50%">
      <div class="sign-line"></div>
      <p>Candidate Signature</p>
    </td>
    <td width="50%">
      <div class="sign-line"></div>
      <p>Date</p>
    </td>
  </tr>
  <tr>
    <td colspan="2" style="padding-top:10px;">
      <strong>Full Name:</strong> {{CandidateName}}<br/>
      <strong>Email:</strong> {{CandidateEmail}}<br/>
      <strong>Phone:</strong> {{CandidatePhone}}
    </td>
  </tr>
</table>

<p style="margin-top:20px; font-size:10px; color:#888; text-align:center;">
  This document is system-generated and forms a legally binding agreement upon
  acceptance. | {{CompanyName}} | Ref: {{OfferNumber}}
</p>

</body>
</html>
""";
        return html.Replace("__LOGO__", logoPath);
    }

    
    
    

    private static string BuildInternshipTemplate(string logoPath)
    {
        var html = """
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  @page { margin: 150px 50px 100px 50px; }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Arial', sans-serif;
    font-size: 11.5px;
    line-height: 1.75;
    color: #1a1a1a;
  }

  header {
    position: fixed;
    top: -120px;
    left: 0; right: 0;
    height: 100px;
    padding: 10px 50px;
    border-bottom: 2px solid #1a6b3c;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  header .logo { width: 160px; }

  header .company-info {
    text-align: right;
    font-size: 10px;
    color: #1a6b3c;
    line-height: 1.6;
  }

  header .company-info strong { font-size: 12px; }

  footer {
    position: fixed;
    bottom: -75px;
    left: 0; right: 0;
    height: 55px;
    padding: 8px 50px;
    border-top: 1px solid #1a6b3c;
    font-size: 9.5px;
    color: #666;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .pagenum:before  { content: counter(page); }
  .pagetotal:before { content: counter(pages); }

  h2 {
    text-align: center;
    font-size: 16px;
    letter-spacing: 2px;
    color: #1a6b3c;
    margin: 10px 0 6px 0;
    text-transform: uppercase;
  }

  h3 {
    font-size: 11.5px;
    color: #1a6b3c;
    text-transform: uppercase;
    letter-spacing: 1px;
    border-bottom: 1px solid #1a6b3c;
    padding-bottom: 3px;
    margin: 20px 0 8px 0;
  }

  p { margin-bottom: 8px; }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 6px;
    margin-bottom: 10px;
  }

  table td, table th {
    border: 1px solid #ccc;
    padding: 6px 10px;
    font-size: 11px;
  }

  table th {
    background-color: #1a6b3c;
    color: #fff;
    font-weight: bold;
    text-align: left;
  }

  table tr:nth-child(even) td { background-color: #f0fff6; }

  .label-col { width: 45%; font-weight: bold; color: #333; background: #eafff3; }

  .ref-box {
    background: #eafff3;
    border-left: 4px solid #1a6b3c;
    padding: 8px 14px;
    margin: 10px 0 16px 0;
    font-size: 11px;
  }

  .terms-list { margin-left: 16px; margin-bottom: 8px; }
  .terms-list li { margin-bottom: 5px; }

  .sign-block { margin-top: 30px; }
  .sign-line  { border-bottom: 1px solid #333; width: 220px; margin-top: 40px; margin-bottom: 4px; }

  .page-break { page-break-after: always; }

  .confidential-strip {
    background: #1a6b3c;
    color: #fff;
    text-align: center;
    font-size: 9px;
    letter-spacing: 2px;
    padding: 3px 0;
    margin-bottom: 14px;
    text-transform: uppercase;
  }

  .badge {
    display: inline-block;
    background: #1a6b3c;
    color: #fff;
    font-size: 9px;
    padding: 2px 8px;
    border-radius: 10px;
    letter-spacing: 1px;
    margin-left: 6px;
    vertical-align: middle;
  }
</style>
</head>
<body>

<!-- FIXED HEADER -->
<header>
  <img src="__LOGO__" class="logo" alt="Company Logo"/>
  <div class="company-info">
    <strong>{{CompanyName}}</strong><br/>
    Offer Ref No: &nbsp;<strong>{{OfferNumber}}</strong><br/>
    Issue Date: {{OfferIssueDate}}
  </div>
</header>

<!-- FIXED FOOTER -->
<footer>
  <span>{{CompanyName}} | Internship Engagement Document — Confidential</span>
  <span>Page <span class="pagenum"></span> of <span class="pagetotal"></span></span>
  <span>{{HrEmail}}</span>
</footer>

<!-- ═══════════════════════════ PAGE 1 ═══════════════════════════ -->
<div class="confidential-strip">Strictly Private &amp; Confidential</div>

<h2>Internship Offer Letter <span class="badge">INTERNSHIP</span></h2>

<div class="ref-box">
  <strong>To:</strong> {{CandidateName}} &nbsp;|&nbsp;
  <strong>Role:</strong> {{Designation}} &nbsp;|&nbsp;
  <strong>Department:</strong> {{Department}}
</div>

<p>Dear <strong>{{CandidateName}}</strong>,</p>

<p>
  We are pleased to offer you an internship opportunity with
  <strong>{{CompanyName}}</strong> for the role of
  <strong>{{Designation}}</strong> within the <strong>{{Department}}</strong>.
  This engagement is designed to provide you with hands-on industry experience
  in a professional IT environment and we are confident that this will be a
  mutually enriching experience.
</p>

<p>
  This offer is subject to your acceptance of the terms and conditions detailed
  herein and the successful completion of any pre-joining documentation
  requirements.
</p>

<!-- Section 1: Internship Details -->
<h3>1. Internship Engagement Details</h3>
<table>
  <tr><td class="label-col">Intern Name</td><td>{{CandidateName}}</td></tr>
  <tr><td class="label-col">Designation / Role</td><td>{{Designation}}</td></tr>
  <tr><td class="label-col">Department</td><td>{{Department}}</td></tr>
  <tr><td class="label-col">Reporting Manager</td><td>{{ReportingManager}}</td></tr>
  <tr><td class="label-col">Internship Start Date</td><td>{{InternshipStartDate}}</td></tr>
  <tr><td class="label-col">Internship End Date</td><td>{{InternshipEndDate}}</td></tr>
  <tr><td class="label-col">Duration</td><td>{{DurationMonths}} Month(s)</td></tr>
  <tr><td class="label-col">Training Location</td><td>{{TrainingLocation}}</td></tr>
  <tr><td class="label-col">Training Institution</td><td>{{TrainingInstitution}}</td></tr>
  <tr><td class="label-col">Training Duration</td><td>{{TrainingDuration}}</td></tr>
  <tr><td class="label-col">Working Days</td><td>{{TrainingWorkingDays}}</td></tr>
  <tr><td class="label-col">Work Location</td><td>{{WorkLocation}}</td></tr>
</table>

<!-- Section 2: Stipend & Financial Benefits -->
<h3>2. Stipend &amp; Financial Benefits</h3>
<table>
  <tr><th>Component</th><th>Details</th></tr>
  <tr><td>Monthly Stipend</td><td>{{StipendAmount}}</td></tr>
  <tr><td>Payment Frequency</td><td>{{PayFrequency}}</td></tr>
  <tr><td>Payment Timing</td><td>{{PaymentTiming}}</td></tr>
  <tr><td>Joining Bonus (if applicable)</td><td>{{JoiningBonus}}</td></tr>
  <tr><td>Retention Bonus (if applicable)</td><td>{{RetentionBonus}}</td></tr>
  <tr><td>Insurance Coverage</td><td>{{InsuranceEnabled}} — {{InsuranceAmount}}</td></tr>
  <tr><td>Accommodation</td><td>{{AccommodationAvailable}} — Cost: {{AccommodationCost}}</td></tr>
  <tr><td>Other Benefits</td><td>{{OtherBenefits}}</td></tr>
</table>

<p style="font-size:10px; color:#666; margin-top:4px;">
  * Stipend is subject to applicable TDS deductions as per the Income Tax Act.
    Full-time salary upon conversion, if applicable: {{FullTimeSalaryAfterInternship}}
</p>

<!-- Section 3: Required Documents -->
<h3>3. Documents Required on Joining</h3>
<p>
  Please carry the following documents (originals + self-attested copies) on
  your first day:
</p>
<p>{{RequiredDocuments}}</p>

<div class="page-break"></div>

<!-- ═══════════════════════════ PAGE 2 ═══════════════════════════ -->

<!-- Section 4: Terms & Conditions -->
<h3>4. Terms &amp; Conditions of Internship</h3>

<ul class="terms-list">
  <li>
    <strong>Nature of Engagement:</strong> This is a fixed-term internship
    engagement and does not constitute an offer of permanent employment.
    Continuation beyond the stated period is at the sole discretion of
    {{CompanyName}}.
  </li>
  <li>
    <strong>Confidentiality:</strong> You shall not disclose, publish, or
    divulge any proprietary, technical, business, or client information
    obtained during your internship, either during or after the engagement
    period. {{ConfidentialityClause}}
  </li>
  <li>
    <strong>Intellectual Property:</strong> All work products, code, designs,
    reports, or deliverables produced during the internship remain the
    exclusive intellectual property of {{CompanyName}}.
  </li>
  <li>
    <strong>Code of Conduct:</strong> You are expected to maintain professional
    conduct, adhere to dress code, and follow all office policies including
    IT Security and Data Privacy guidelines at all times.
  </li>
  <li>
    <strong>Attendance &amp; Punctuality:</strong> Regular attendance is
    mandatory. Any planned absence must be communicated to your reporting
    manager in advance. Excessive unplanned absences may result in termination
    of the internship.
  </li>
  <li>
    <strong>Service Agreement:</strong> Duration: {{ServiceAgreementDurationMonths}}
    month(s). Period: {{ServiceAgreementPeriod}}.
    Breakage charges (if applicable): {{BreakageCharges}}.
  </li>
  <li>
    <strong>Certificate &amp; Retention:</strong>
    {{CertificateRetentionTerms}}
  </li>
  <li>
    <strong>Social Media:</strong> You shall not post, share, or comment on
    any matters related to {{CompanyName}}, its clients, or projects on any
    social media platform without prior written approval.
  </li>
  <li>
    <strong>Termination:</strong> Either party may terminate this engagement
    with three (3) days' written notice. {{CompanyName}} reserves the right
    to immediately terminate in cases of gross misconduct, breach of
    confidentiality, or policy violations.
  </li>
</ul>

<!-- Section 5: Company Policies -->
<h3>5. Company Policies &amp; Compliance</h3>
<p>
  By accepting this internship offer, you agree to comply with all applicable
  {{CompanyName}} policies:
</p>
<ul class="terms-list">
  <li>Information Security &amp; Acceptable Use Policy</li>
  <li>Equal Opportunity &amp; Anti-Harassment Policy</li>
  <li>Data Privacy &amp; GDPR Compliance Policy</li>
  <li>Workplace Safety &amp; Health Policy</li>
  <li>Asset Return Policy upon Completion of Internship</li>
</ul>
<p>{{CompanyPolicyText}}</p>

<!-- Section 6: Offer Validity -->
<h3>6. Offer Validity</h3>
<p>
  This offer is valid for <strong>five (5) calendar days</strong> from the
  issue date of <strong>{{OfferIssueDate}}</strong>. Non-response within this
  period will be treated as a rejection. Please contact our HR team for any
  clarifications:
</p>
<table>
  <tr><td class="label-col">HR Contact</td><td>{{HrContactName}}</td></tr>
  <tr><td class="label-col">HR Email</td><td>{{HrEmail}}</td></tr>
  <tr><td class="label-col">HR Phone</td><td>{{HrPhone}}</td></tr>
</table>

<!-- Signatory -->
<div class="sign-block">
  <p>Yours Sincerely,</p>
  <div class="sign-line"></div>
  <p><strong>{{SignatoryName}}</strong></p>
  <p>{{SignatoryDesignation}}</p>
  <p><strong>{{CompanyName}}</strong></p>
</div>

<br/><br/>

<!-- Acceptance -->
<h3>Intern Acceptance</h3>
<p>
  I, <strong>{{CandidateName}}</strong>, hereby accept this internship offer
  extended by <strong>{{CompanyName}}</strong> for the role of
  <strong>{{Designation}}</strong> on the terms and conditions stated above.
</p>

<table style="margin-top:20px;">
  <tr>
    <td width="50%">
      <div class="sign-line"></div>
      <p>Intern Signature</p>
    </td>
    <td width="50%">
      <div class="sign-line"></div>
      <p>Date</p>
    </td>
  </tr>
  <tr>
    <td colspan="2" style="padding-top:10px;">
      <strong>Full Name:</strong> {{CandidateName}}<br/>
      <strong>Email:</strong> {{CandidateEmail}}<br/>
      <strong>Phone:</strong> {{CandidatePhone}}<br/>
      <strong>Address:</strong> {{CandidateAddress}}
    </td>
  </tr>
</table>

<p style="margin-top:20px; font-size:10px; color:#888; text-align:center;">
  This document is system-generated. | {{CompanyName}} | Ref: {{OfferNumber}}
</p>

</body>
</html>
""";
        return html.Replace("__LOGO__", logoPath);
    }

    
    
    

    private static async Task SeedFinanceBudgetsAsync(SORDbContext context)
    {
        if (await context.FinanceBudgets.AnyAsync()) return;

        context.FinanceBudgets.AddRange(
            new FinanceBudget
            {
                DepartmentId    = 3,
                FiscalYear      = DateTime.UtcNow.Year,
                TotalBudget     = 5000000m,
                UsedBudget      = 0m,
                CreatedByUserId = 1,
                CreatedAt       = DateTime.UtcNow
            },
            new FinanceBudget
            {
                DepartmentId    = 2,
                FiscalYear      = DateTime.UtcNow.Year,
                TotalBudget     = 2000000m,
                UsedBudget      = 0m,
                CreatedByUserId = 1,
                CreatedAt       = DateTime.UtcNow
            });

        await context.SaveChangesAsync();
    }
}
