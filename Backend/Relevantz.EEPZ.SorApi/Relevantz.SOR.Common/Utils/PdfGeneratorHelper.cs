namespace Relevantz.SOR.Common.Utils;

// Abstraction — concrete implementation in Infrastructure uses a PDF library
public static class PdfGeneratorHelper
{
    public static byte[] GenerateFromHtml(string htmlContent)
    {
        throw new NotImplementedException("PDF generation must be implemented in Infrastructure layer.");
    }
}
