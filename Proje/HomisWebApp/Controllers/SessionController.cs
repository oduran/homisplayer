using ServiceTemplate.Actions;
using ServiceTemplate.Filters;
using ServiceTemplate.Models;
using System.Threading.Tasks;
using System.Web.Http;

namespace ServiceTemplate.Controllers
{
    /// <summary>
    /// This controller is responsible for login/logout operations.
    /// 
    /// <para>
    /// Before you use GM controller you must be logged in the system. (or you must have a valid token) To be able to get a new token you can use "Login" method. In web
    /// (or almost every scenario) you don't have to logout the system. If you don't make any request "SlidingExpiration" property will kick you out when your time is up.
    /// On the other hand system will kick you out again after 24 hours.
    /// </para>
    /// </summary>
    [ValidateModel]
    [GenericExceptionFilter]
    public class SessionController : ApiController
    {
        /// <summary>
        /// Login the system
        /// </summary>
        /// <param name="logininfo"></param>
        /// <returns></returns>
        public async Task<LoginOutput> Login(LoginInput logininfo)
        {
            return await SessionManagement.Login(logininfo);
        }

        /// <summary>
        /// Logout from the system
        /// </summary>
        /// <param name="logoutinfo"></param>
        /// <returns></returns>
        public LogoutOutput Logout(LogoutInput logoutinfo)
        {
            return SessionManagement.Logout(logoutinfo);
        }
    }
}
