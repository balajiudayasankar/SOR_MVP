using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Relevantz.SOR.Common.DTOs.Request.Notification;
using Relevantz.SOR.Core.IService;

namespace Relevantz.SOR.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class NotificationController : ControllerBase
{
    private readonly INotificationService _notificationService;
    private readonly ITokenService _tokenService;

    public NotificationController(INotificationService notificationService, ITokenService tokenService)
    {
        _notificationService = notificationService;
        _tokenService = tokenService;
    }

    [HttpGet]
    public async Task<IActionResult> GetMyNotifications()
    {
        var userId = _tokenService.GetUserIdFromClaims(User);
        var result = await _notificationService.GetMyNotificationsAsync(userId);
        return Ok(result);
    }

    [HttpGet("unread-count")]
    public async Task<IActionResult> GetUnreadCount()
    {
        var userId = _tokenService.GetUserIdFromClaims(User);
        var result = await _notificationService.GetUnreadCountAsync(userId);
        return Ok(result);
    }

    [HttpPatch("mark-read")]
    public async Task<IActionResult> MarkAsRead([FromBody] MarkNotificationReadRequestDto dto)
    {
        var userId = _tokenService.GetUserIdFromClaims(User);
        var result = await _notificationService.MarkAsReadAsync(dto, userId);
        return Ok(result);
    }
}
