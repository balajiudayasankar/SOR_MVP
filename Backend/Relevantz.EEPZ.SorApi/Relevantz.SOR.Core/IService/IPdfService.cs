namespace Relevantz.SOR.Core.IService;

public interface IPdfService
{
    Task<byte[]> GenerateAsync(int offerId);
    Task<string> GenerateAndSaveAsync(int offerId);
}
