using System.Net;
using System.Net.Http;
using System.Web.Http.Controllers;
using System.Web.Http.Filters;

namespace ServiceTemplate.Filters
{
    /// <summary>
    /// Çağırılan methodlara girilen bilgilerde sorun olup olmadığını kontrol eder.
    /// </summary>
    public sealed class ValidateModelAttribute : ActionFilterAttribute
    {
        public override void OnActionExecuting(HttpActionContext actionContext)
        {
            if (actionContext.ModelState.IsValid == false)
            {
                actionContext.Response = actionContext.Request.CreateErrorResponse(HttpStatusCode.BadRequest, actionContext.ModelState);

                //var doc = actionContext.ModelState.ToBsonDocument();
                //doc.Add("Error", "Hatalı model");

                //actionContext.Response = new HttpResponseMessage(HttpStatusCode.BadRequest);
                //actionContext.Response.Content = new StringContent(doc.ToJson(), Encoding.UTF8, App.MIME_JSON);
            }
        }
    }
}
