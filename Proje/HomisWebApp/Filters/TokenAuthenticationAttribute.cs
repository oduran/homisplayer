using ServiceTemplate.Extensions;
using System;
using System.Net.Http;
using System.Security.Principal;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http.Filters;
using ServiceTemplate.Actions;

namespace ServiceTemplate.Filters
{
    /// <summary>
    /// Kullanıcının token bilgisine göre otomatik olarak AUTH operasyonunu gerçekleştiren yapı
    /// </summary>
    public class TokenAuthenticationAttribute : Attribute, IAuthenticationFilter
    {
        /// <summary>
        /// Kullanıcının token bilgisi doğru ise kendisi için yaratılmış olan kullanıcıyı sisteme tanımlar.
        /// Artık kullanıcının ayrıcalıkları ile sistem çalışmaya başlayacaktır.
        /// </summary>
        /// <param name="principal"></param>
        private void SetPrincipal(IPrincipal principal)
        {
            // TODO: Bu atamanın yapılması gerekli mi emin değilim.
            Thread.CurrentPrincipal = principal;

            if (HttpContext.Current != null)
            {
                HttpContext.Current.User = principal;
            }
        }

        /*
         * 
            Here is a general outline for implementing AuthenticateAsync.

            Look for credentials in the request.
            If there are no credentials, do nothing and return (no-op).
            If there are credentials but the filter does not recognize the authentication scheme, do nothing and return (no-op). Another filter in the pipeline might understand the scheme.
            If there are credentials that the filter understands, try to authenticate them.
            If the credentials are bad, return 401 by setting context.ErrorResult.
            If the credentials are valid, create an IPrincipal and set context.Principal.
         * 
         */

        /// <summary>
        /// GMController içine yapılan her çağrıda bu method çalışacaktır.
        /// 
        /// x-gm-tokem bilgisine bakacak ve sistemin çalışıp çalışmayacağına karar verecek.
        /// </summary>
        /// <param name="context"></param>
        /// <param name="cancellationToken"></param>
        /// <returns></returns>
        public async Task AuthenticateAsync(HttpAuthenticationContext context, CancellationToken cancellationToken)
        {
            // İstek içinden token bilgisini almaya çalış
            HttpRequestMessage request = context.Request;

            string token = await request.GetHeader(CONSTS.HTTP_HEADERS.TOKEN, cancellationToken);

            // Eğer token yoksa
            if (String.IsNullOrEmpty(token))
            {
                context.ErrorResult = new TokenAuthenticationResult("Missing credentials", request);
                return;
            }

            // Eğer varsa doğruluğunu kontrol et ve kullanıcıyı al.
            var userToken = SessionManagement.getUserToken(token);

            // Token hatalı ve logout olduysa
            if (userToken == null)
            {
                context.ErrorResult = new TokenAuthenticationResult("Invalid token", request);
            }
            else
            {
                // Bu method'u mu kullanmalıyız emin değilim.
                SetPrincipal(userToken.User);

                // TODO: asp.net örneğinde sadece bunu yapmış.
                // context.Principal = principal;
            }
        }

        public Task ChallengeAsync(HttpAuthenticationChallengeContext context, CancellationToken cancellationToken)
        {
            /*
             * Bu method içinde AuthenticateAsync methodu tarafından "context.ErrorResult" içerisine atılmış olan "IHttpActionResult"
             * nesnesi "context.Result" içinde bize ulaşıyor.
             * 
             * Ancak bu "IHttpActionResult" nesnesinin "ExecuteAsync" methodu henüz çağırılmamış oluyor.
             * 
             * "ChallengeAsync" methodunun görevi bu içeriği oluşturmak, daha sonra da üzerine eklenmesi gereken diğer bilgileri
             * (Basic veya Digest Auth için gereken header bilgileri gibi) eklemektir.
             * 
             * Biz basit token yapısında bu header'a ihtiyaç duymuyoruz. Sadece 401 Unauth gitmesi yeterli.
             */

            // Aşağıdaki örnek Basic Auth için bir örnek teşkil ediyor.
            // -----------------------------------------------------------
            // var challenge = new AuthenticationHeaderValue("Basic");
            // context.Result = new AddChallengeOnUnauthorizedResult(challenge, context.Result);
            // -----------------------------------------------------------

            return Task.FromResult<int>(0);
        }

        public bool AllowMultiple
        {
            get { return false; }
        }
    }
}
