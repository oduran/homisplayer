using System.Net;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using System.Web.Http;

namespace ServiceTemplate.Filters
{
    public class TokenAuthenticationResult: IHttpActionResult
    {
        public TokenAuthenticationResult(string reasonPhrase, HttpRequestMessage request)
        {
            ReasonPhrase = reasonPhrase;
            Request = request;
        }

        public string ReasonPhrase { get; private set; }

        public HttpRequestMessage Request { get; private set; }

        public Task<HttpResponseMessage> ExecuteAsync(CancellationToken cancellationToken)
        { 
            HttpResponseMessage response = new HttpResponseMessage(HttpStatusCode.Unauthorized);
            response.RequestMessage = Request;
            response.ReasonPhrase = ReasonPhrase;
            response.Content = new StringContent("HTTP " + (int)(response.StatusCode) + " : " + ReasonPhrase, System.Text.Encoding.UTF8);
            return Task.FromResult(response);
        }
    }
}
