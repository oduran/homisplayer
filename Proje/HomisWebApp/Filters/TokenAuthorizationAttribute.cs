using System;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using System.Web.Http.Controllers;

namespace ServiceTemplate.Filters
{
    /// <summary>
    /// Kullanıcının gerekli ROLE'e sahip olup olmadığını otomatik olarak kontrol eder.
    /// 
    /// Authentication sonrasında kullanıcı bilgileri sisteme tanıtılır ve bu sınıf ilgili method'un çalışabilmesi için kullanıcının tanımlanan hakları olup olmadığını kontrol eder.
    /// Bir sınıfın üzerine konulabileceği gibi ve method üzerine de konulabilir.
    /// 
    /// Eğer Role tanımlanmadan kullanılırsa kullanılmaması ile aynı sonucu verir. Kısaca hiçbir kontrole girmeden İZİN VERİR.
    /// Eğer Role tanımlandı ise kullanıcının tanımlanan Role'e sahip olması gerekir.
    /// </summary>
    public class TokenAuthorizationAttribute : Attribute, System.Web.Http.Filters.IAuthorizationFilter
    {
        /// <summary>
        /// İlgili method ve controller'ın çağırılabilmesi için gereken roller.
        /// Rolleri VİRGÜL ile ayırarak yazmak gerekli.
        /// </summary>
        public string Roles { get; set; }

        public async Task<HttpResponseMessage> ExecuteAuthorizationFilterAsync(
            HttpActionContext actionContext,
            CancellationToken cancellationToken,
            Func<Task<HttpResponseMessage>> continuation)
        {
            if (!string.IsNullOrEmpty(Roles))
            {
                string[] roles = Roles.Split(new char[] { ',' }, StringSplitOptions.RemoveEmptyEntries);

                bool inRole = false;
                var principal = actionContext.RequestContext.Principal;

                foreach (var role in roles)
                {
                    inRole = inRole || principal.IsInRole(role);
                    if (inRole) break;
                }

                if (!inRole)
                {
                    return await new TokenAuthorizationResult("Unauthorized access", actionContext.Request).ExecuteAsync(cancellationToken);
                }
            }

            // Öncesi

            var response = await continuation();

            // Sonrası

            return response;
        }

        public bool AllowMultiple
        {
            get { return false; }
        }
    }
}
