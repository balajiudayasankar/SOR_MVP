using System.Globalization;
using System.Text;
using Relevantz.SOR.Common.Entities;

namespace Relevantz.SOR.Common.Utils;

public static class TemplateRendererHelper
{
    
    
    

    public static string Render(string htmlTemplate, Dictionary<string, string> placeholders)
    {
        var result = new StringBuilder(htmlTemplate);
        foreach (var (key, value) in placeholders)
            result.Replace($"{{{{{key}}}}}", value ?? string.Empty);
        return result.ToString();
    }

    
    
    

    public static Dictionary<string, string> BuildPlaceholders(Offer offer)
    {
        var p = new Dictionary<string, string>();
        if (offer == null) return p;

        
        p["OfferNumber"]  = offer.OfferNumber ?? "";
        p["OfferVersion"] = offer.Version.ToString();
        p["OfferStatus"]  = offer.Status.ToString();
        p["OfferType"]    = offer.OfferType.ToString();

        
        
        
        

        var c = offer.OfferCommonDetails;
        if (c != null)
        {
            p["CandidateName"]          = Safe(c.CandidateName);
            p["CandidateEmail"]         = Safe(c.CandidateEmail);
            p["CandidatePhone"]         = Safe(c.CandidatePhone);
            p["CandidateAddress"]       = Safe(c.CandidateAddress);
            p["Designation"]            = Safe(c.Designation);
            p["Department"]             = Safe(c.Department);
            p["WorkLocation"]           = Safe(c.WorkLocation);
            p["ReportingManager"]       = Safe(c.ReportingManager);
            p["JoiningDate"]            = FormatDate(c.JoiningDate);       
            p["OfferIssueDate"]         = FormatDate(c.OfferIssueDate);    
            p["CompanyName"]            = Safe(c.CompanyName);
            p["HrContactName"]          = Safe(c.HrContactName);
            p["HrEmail"]                = Safe(c.HrEmail);
            p["HrPhone"]                = Safe(c.HrPhone);
            p["SignatoryName"]          = Safe(c.SignatoryName);
            p["SignatoryDesignation"]   = Safe(c.SignatoryDesignation);
            p["WorkingDays"]            = Safe(c.WorkingDays);
            p["WorkingHours"]           = Safe(c.WorkingHours);
            p["WeeklyHours"]            = c.WeeklyHours.ToString();        
            p["CompanyPolicyText"]      = Safe(c.CompanyPolicyText);
            p["ConfidentialityClause"]  = FormatBool(c.ConfidentialityClause); 
        }

        
        
        

        var ft = offer.FullTimeDetails;
        if (ft != null)
        {
            p["EmploymentType"]                 = ft.EmploymentType.ToString();
            p["AnnualCtc"]                      = FormatCurrency(ft.AnnualCtc);          
            p["BasicSalary"]                    = FormatCurrency(ft.BasicSalary);        
            p["Hra"]                            = FormatCurrency(ft.Hra);                
            p["Allowances"]                     = FormatCurrency(ft.Allowances);         
            p["BonusOrVariablePay"]             = FormatCurrency(ft.BonusOrVariablePay); 
            p["JoiningBonus"]                   = FormatCurrency(ft.JoiningBonus);       
            p["EsopDetails"]                    = Safe(ft.EsopDetails);
            p["ProbationPeriod"]                = Safe(ft.ProbationPeriod);
            p["ConfirmationTerms"]              = Safe(ft.ConfirmationTerms);
            p["PfEligibility"]                  = FormatBool(ft.PfEligibility);          
            p["GratuityEligibility"]            = FormatBool(ft.GratuityEligibility);    
            p["InsurancePlan"]                  = Safe(ft.InsurancePlan);
            p["LeaveEntitlement"]               = Safe(ft.LeaveEntitlement);
            p["OtherBenefits"]                  = Safe(ft.OtherBenefits);
            p["NoticePeriod"]                   = Safe(ft.NoticePeriod);
            p["BackgroundVerificationRequired"] = FormatBool(ft.BackgroundVerificationRequired); 
            p["NonCompeteEnabled"]              = FormatBool(ft.NonCompeteEnabled);     
        }

        
        
        
        
        
        
        
        
        
        
        

        var i = offer.InternshipDetails;
        if (i != null)
        {
            p["InternshipStartDate"]             = FormatDate(i.InternshipStartDate);    
            p["InternshipEndDate"]               = FormatDate(i.InternshipEndDate);      
            p["DurationMonths"]                  = i.DurationMonths.ToString();
            p["StipendAmount"]                   = FormatCurrency(i.StipendAmount);      
            p["PayFrequency"]                    = i.PayFrequency.ToString();
            p["PaymentTiming"]                   = Safe(i.PaymentTiming);
            p["TrainingLocation"]                = Safe(i.TrainingLocation);
            p["TrainingInstitution"]             = Safe(i.TrainingInstitution);
            p["TrainingDuration"]                = Safe(i.TrainingDuration);
            p["TrainingWorkingDays"]             = Safe(i.TrainingWorkingDays);
            p["RequiredDocuments"]               = Safe(i.RequiredDocuments);
            p["InsuranceEnabled"]                = FormatBool(i.InsuranceEnabled);       
            p["InsuranceAmount"]                 = FormatNullableCurrency(i.InsuranceAmount);
            p["OtherBenefits"]                   = Safe(i.OtherBenefits);
            p["FullTimeSalaryAfterInternship"]   = FormatNullableCurrency(i.FullTimeSalaryAfterInternship);
            p["JoiningBonus"]                    = FormatNullableCurrency(i.JoiningBonus);
            p["RetentionBonus"]                  = FormatNullableCurrency(i.RetentionBonus);
            p["ServiceAgreementDurationMonths"]  = i.ServiceAgreementDurationMonths.HasValue
                                                     ? i.ServiceAgreementDurationMonths.Value.ToString()
                                                     : "N/A";
            p["ServiceAgreementPeriod"]          = Safe(i.ServiceAgreementPeriod);
            p["CertificateRetentionTerms"]       = Safe(i.CertificateRetentionTerms);
            p["BreakageCharges"]                 = FormatNullableCurrency(i.BreakageCharges); 
            p["AccommodationAvailable"]          = FormatBool(i.AccommodationAvailable);  
            p["AccommodationCost"]               = FormatNullableCurrency(i.AccommodationCost);
        }

        return p;
    }

    
    
    

    private static string Safe(string? value)
        => string.IsNullOrWhiteSpace(value) ? "" : value;

    private static string FormatBool(bool value)
        => value ? "Yes" : "No";

    private static string FormatDate(DateOnly date)
        => date == default
            ? ""
            : date.ToString("dd MMMM yyyy", CultureInfo.InvariantCulture);

    private static string FormatCurrency(decimal amount)
        => string.Format(CultureInfo.InvariantCulture, "₹ {0:N2}", amount);

    
    private static string FormatNullableCurrency(decimal? amount)
        => amount.HasValue
            ? string.Format(CultureInfo.InvariantCulture, "₹ {0:N2}", amount.Value)
            : "N/A";
}
