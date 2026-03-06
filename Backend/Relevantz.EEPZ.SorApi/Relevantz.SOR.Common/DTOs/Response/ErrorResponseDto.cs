namespace Relevantz.SOR.Common.DTOs.Response;

public class ErrorResponseDto
{
    public string Message { get; set; } = string.Empty;
    public List<string>? Details { get; set; }
    public int StatusCode { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
