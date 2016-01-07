using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;

namespace ServiceTemplate.Extensions
{
    public static class HttpRequestMessageExtension
    {
        /// <summary>
        /// İlk bulduğu Custom HTTP Header bilgisini geri döndürür.
        /// </summary>
        /// <param name="request"></param>
        /// <param name="name"></param>
        /// <returns>Bulamaz ise NULL geri döndürür</returns>
        public static async Task<string> GetHeader(this HttpRequestMessage request, string name, CancellationToken cancellationToken)
        {
            return await Task.Factory.StartNew<string>(() =>
            {
                IEnumerable<string> headers;

                if (request.Headers.TryGetValues(name, out headers))
                {
                    return headers.FirstOrDefault();
                }

                return null;
            }, cancellationToken);
        }

        /// <summary>
        /// HttpRequestMessage içindeki Content'i okuyup otomatik olarak BsonDocument geri döndürür.
        /// </summary>
        /// <param name="request"></param>
        /// <returns></returns>
        public static async Task<BsonDocument> GetBsonDocumentFromBody(this HttpRequestMessage request)
        {
            // İçeriği oku
            var json = await request.Content.ReadAsStringAsync();

            // BsonDocument oluştur.
            return await Task.Factory.StartNew<BsonDocument>(() => BsonSerializer.Deserialize<BsonDocument>(json));
        }
    }
}
