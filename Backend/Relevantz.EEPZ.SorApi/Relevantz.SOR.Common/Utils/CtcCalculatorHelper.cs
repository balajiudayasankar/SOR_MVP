using Relevantz.SOR.Common.Entities;

namespace Relevantz.SOR.Common.Utils;

public static class CtcCalculatorHelper
{
    public static decimal CalculateTotalCtc(FullTimeDetails details)
    {
        return details.BasicSalary
               + details.Hra
               + details.Allowances
               + details.BonusOrVariablePay
               + details.JoiningBonus;
    }

    public static decimal CalculateMonthlySalary(decimal annualCtc) => Math.Round(annualCtc / 12, 2);
}
