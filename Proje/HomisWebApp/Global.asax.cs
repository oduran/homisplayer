using ServiceTemplate.MessageHandlers;
using System;
using System.Linq;
using System.Net.Http.Formatting;
using System.Web.Http;
using System.Web.Mvc;

namespace ServiceTemplate
{
    public class Global : System.Web.HttpApplication
    {
        protected void Application_Start(object sender, EventArgs e)
        {
            var config = GlobalConfiguration.Configuration;

            // we don't need XML
            config.Formatters.Remove(config.Formatters.XmlFormatter);

            // we dont need jQueryFormEncoder
            {
                var remove = config.Formatters.FirstOrDefault<MediaTypeFormatter>((i) => typeof(System.Web.Http.ModelBinding.JQueryMvcFormUrlEncodedFormatter) == i.GetType());
                if (remove != null) config.Formatters.Remove(remove);
            }

            // ApiPerformance
            config.MessageHandlers.Add(new ApiPerformanceLogger());

            // POST Content-type control
            // Bu POST işlemlerinde yapılacak bütün çağrılarda içerğin application/json olma zorunluluğunu sağlar.
            config.MessageHandlers.Add(new ContentTypeHandler());

            // V1 Api Router
            config.Routes.MapHttpRoute("session", "session/{action}", new { controller = "Session" });

            // Kendi controller'ını buraya ekle.
            // config.Routes.MapHttpRoute("api", "api/v1/{action}", new { controller = "Gm" });
            config.Routes.MapHttpRoute("user", "user/{action}", new { controller = "User" });

#if DEBUG
            // bu sayede login olmadan sistemi kullanabileceğiz.
            // token: "baris"
            // ServiceTemplate.Actions.SessionManagement.AddDebugPurposeUserToken();
#endif
        }

        protected void Session_Start(object sender, EventArgs e)
        {

        }

        protected void Application_BeginRequest(object sender, EventArgs e)
        {

        }

        protected void Application_AuthenticateRequest(object sender, EventArgs e)
        {

        }

        protected void Application_Error(object sender, EventArgs e)
        {

        }

        protected void Session_End(object sender, EventArgs e)
        {

        }

        protected void Application_End(object sender, EventArgs e)
        {

        }
    }
}
