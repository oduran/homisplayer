using System.Net;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using System.Net.Http.Headers;
using System;

namespace ServiceTemplate.MessageHandlers
{
    /// <summary>
    /// Controller'a parametre olarak gönderilen verilerin JSON formatında olmasını garanti eder.
    /// </summary>
    public sealed class ContentTypeHandler : DelegatingHandler
    {
        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            MediaTypeHeaderValue ct = null;
            string contentType = null;

            if ((ct = request.Content.Headers.ContentType) != null)
            {
                contentType = ct.MediaType;
            }

            if (IsContentTypeValid(request.Method,contentType))
            {
                HttpResponseMessage forbiddenResponse = request.CreateResponse(HttpStatusCode.Forbidden);

                forbiddenResponse.ReasonPhrase = "Forbidden (Content type must be application/json)";
                forbiddenResponse.Content = new StringContent("Forbidden (Content type must be application/json)");

                return Task.FromResult<HttpResponseMessage>(forbiddenResponse);
            }

            return base.SendAsync(request, cancellationToken);
        }

        private bool IsContentTypeValid(HttpMethod method, string contentType)
        {
            return (method == HttpMethod.Post) &&
                    (contentType == null 
                    || string.Compare(contentType, CONSTS.MIMES.JSON, true) != 0 
                    || string.Compare(contentType, CONSTS.MIMES.ZIP, true) != 0);
        }
    }

    
}
