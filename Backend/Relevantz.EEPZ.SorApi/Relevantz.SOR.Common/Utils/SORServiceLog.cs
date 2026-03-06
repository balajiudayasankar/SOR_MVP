using Microsoft.Extensions.Logging;

namespace Relevantz.SOR.Common.Utils;

public static class SORServiceLog
{
    public static void LogInfo(ILogger logger, string message, params object[] args)
        => logger.LogInformation("[SOR-SVC] " + message, args);

    public static void LogWarning(ILogger logger, string message, params object[] args)
        => logger.LogWarning("[SOR-SVC] " + message, args);

    public static void LogError(ILogger logger, Exception ex, string message, params object[] args)
        => logger.LogError(ex, "[SOR-SVC] " + message, args);
}
