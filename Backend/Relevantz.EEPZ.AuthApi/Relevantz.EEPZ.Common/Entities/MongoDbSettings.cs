namespace Relevantz.EMT.Common.Entities
{
    public class MongoDbSettings
    {
        public string ConnectionString { get; set; } = null!;
        public string DatabaseName { get; set; } = null!;
        public string ProfileImagesCollectionName { get; set; } = "profileimages";
    }
}
