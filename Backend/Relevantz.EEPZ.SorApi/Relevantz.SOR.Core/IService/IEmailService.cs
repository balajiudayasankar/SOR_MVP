namespace Relevantz.SOR.Core.IService;

public interface IEmailService
{
    Task SendAsync(string toEmail, string subject, string htmlBody);
}
