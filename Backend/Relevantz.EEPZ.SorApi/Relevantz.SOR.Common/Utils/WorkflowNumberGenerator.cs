using Relevantz.SOR.Common.Constants;

namespace Relevantz.SOR.Common.Utils;

public static class WorkflowNumberGenerator
{
    public static string Generate()
    {
        var timestamp = DateTime.UtcNow.ToString("yyyyMMddHHmmss");
        var random = new Random().Next(1000, 9999);
        return $"{WorkflowConstants.WorkflowNumberPrefix}-{timestamp}-{random}";
    }
}
