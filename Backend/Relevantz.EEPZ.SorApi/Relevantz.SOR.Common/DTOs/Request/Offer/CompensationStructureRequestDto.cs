namespace Relevantz.SOR.Common.DTOs.Request.Offer;

public class CompensationStructureRequestDto
{
    public decimal AnnualCtc { get; set; }
    public decimal BasicSalary { get; set; }
    public decimal Hra { get; set; }
    public decimal Allowances { get; set; }
    public decimal BonusOrVariablePay { get; set; }
    public decimal JoiningBonus { get; set; }
    public decimal? RetentionBonus { get; set; }
    public string? EsopDetails { get; set; }
    public decimal GrossMonthlySalary => Math.Round(AnnualCtc / 12, 2);
    public decimal TotalComponents => BasicSalary + Hra + Allowances + BonusOrVariablePay;
}
