using System.Text.RegularExpressions;

namespace Relevantz.SOR.Common.Utils;

public static class ValidationHelper
{
    private static readonly Regex EmailRegex =
        new(@"^[^@\s]+@[^@\s]+\.[^@\s]+$", RegexOptions.Compiled);

    private static readonly Regex PhoneRegex =
        new(@"^\+?[0-9\s\-\(\)]{7,20}$", RegexOptions.Compiled);

    public static bool IsValidEmail(string email)
        => !string.IsNullOrWhiteSpace(email) && EmailRegex.IsMatch(email);

    public static bool IsValidPhone(string phone)
        => !string.IsNullOrWhiteSpace(phone) && PhoneRegex.IsMatch(phone);

    public static bool IsValidDateRange(DateOnly startDate, DateOnly endDate)
        => endDate > startDate;

    public static bool IsFutureDate(DateOnly date)
        => date >= DateOnly.FromDateTime(DateTime.Today);

    public static bool IsPositiveDecimal(decimal value)
        => value > 0;

    public static bool IsNonNegativeDecimal(decimal value)
        => value >= 0;

    public static bool IsValidCtc(decimal basicSalary, decimal hra,
        decimal allowances, decimal bonus, decimal annualCtc)
    {
        var sum = basicSalary + hra + allowances + bonus;
        return sum >= annualCtc * 0.95m && sum <= annualCtc * 1.05m;
    }

    public static bool IsValidVersion(int version)
        => version >= 1;

    public static string SanitizeString(string? input)
        => string.IsNullOrWhiteSpace(input) ? string.Empty : input.Trim();
}
