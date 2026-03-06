using Microsoft.Extensions.Logging;

namespace Relevantz.SOR.Common.Utils;

public static class SORBusinessLog
{
    public static void LogInfo(ILogger logger, string message, params object[] args)
        => logger.LogInformation("[SOR-BIZ] " + message, args);

    public static void LogWarning(ILogger logger, string message, params object[] args)
        => logger.LogWarning("[SOR-BIZ] " + message, args);

    public static void LogError(ILogger logger, Exception ex, string message, params object[] args)
        => logger.LogError(ex, "[SOR-BIZ] " + message, args);
}
