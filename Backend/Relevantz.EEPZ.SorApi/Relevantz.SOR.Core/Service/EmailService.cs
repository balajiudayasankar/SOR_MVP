using MailKit.Net.Smtp;
using MimeKit;
using Microsoft.Extensions.Configuration;
using Relevantz.SOR.Core.IService;

namespace Relevantz.SOR.Core.Service;

public class EmailService : IEmailService
{
    private readonly string _smtpHost;
    private readonly int _smtpPort;
    private readonly string _smtpUser;
    private readonly string _smtpPass;
    private readonly string _fromEmail;
    private readonly string _fromName;

    public EmailService(IConfiguration configuration)
    {
        _smtpHost  = configuration["EmailSettings:SmtpHost"]  ?? "smtp.gmail.com";
        _smtpPort  = int.Parse(configuration["EmailSettings:SmtpPort"] ?? "587");
        _smtpUser  = configuration["EmailSettings:SmtpUser"]  ?? string.Empty;
        _smtpPass  = configuration["EmailSettings:SmtpPass"]  ?? string.Empty;
        _fromEmail = configuration["EmailSettings:FromEmail"] ?? "noreply@relevantz.com";
        _fromName  = configuration["EmailSettings:FromName"]  ?? "Relevantz SOR";
    }

    public async Task SendAsync(string toEmail, string subject, string htmlBody)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(_fromName, _fromEmail));
        message.To.Add(MailboxAddress.Parse(toEmail));
        message.Subject = subject;
        message.Body = new TextPart("html") { Text = htmlBody };

        using var client = new SmtpClient();
        await client.ConnectAsync(_smtpHost, _smtpPort, false);
        await client.AuthenticateAsync(_smtpUser, _smtpPass);
        await client.SendAsync(message);
        await client.DisconnectAsync(true);
    }
}
