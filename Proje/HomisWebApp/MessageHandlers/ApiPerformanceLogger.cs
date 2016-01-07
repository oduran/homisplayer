using ServiceTemplate.Extensions;
using System.Diagnostics;
using System.Net.Http;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace ServiceTemplate.MessageHandlers
{
    /// <summary>
    /// API'ye yapılan bütün çağrıların performansını ölçer.
    /// 
    /// TODO: Buraya ek olarak belli bir sürenin altında kalan çağrıları LOG olarak kaydetmemesini yapabiliriz.
    /// </summary>
    public sealed class ApiPerformanceLogger: DelegatingHandler
    {
        private NLog.ILogger logger = NLog.LogManager.GetCurrentClassLogger();

        protected async override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            var rq = await request.Content.ReadAsStringAsync();
            string token = await request.GetHeader(CONSTS.HTTP_HEADERS.TOKEN,CancellationToken.None);

            Stopwatch sw = new Stopwatch();
            sw.Start();
            
            var response = await base.SendAsync(request, cancellationToken);

            sw.Stop();
            
            var re = await response.Content.ReadAsStringAsync();

            // TODO: Burasını LOG seviyesine göre düzenle !
            logger.Trace(() => {
                var sb = new StringBuilder();
                sb.Append("[");
                sb.Append(request.RequestUri.ToString());
                sb.Append("] (");
                sb.Append(sw.ElapsedMilliseconds);
                sb.AppendLine(" msec)");

                sb.Append("[TOKEN]");
                sb.AppendLine(token);

                sb.Append("[REQUEST] ");
                sb.AppendLine(rq);

                sb.Append("[RESPONSE] ");
                sb.AppendLine(re);

                return sb.ToString();
            });

            return response;
        }
    }
}
