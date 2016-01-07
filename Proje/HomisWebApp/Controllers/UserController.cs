using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Threading.Tasks;
using MongoDB.Bson;
using MongoDB.Driver;
using ServiceTemplate.Filters;
using ServiceTemplate.Models;

namespace ServiceTemplate.Controllers
{
    [GenericExceptionFilter]
    [ValidateModel]
    //[TokenAuthentication]
    //[TokenAuthorization]
    public class UserController : ApiController
    {
        [HttpPost]
        // GET user/<controller>
        public async Task<string> CreateUser(LogoutInput l)
        {
            return await Task.FromResult<string>(l.test);
        }

        // GET <controller>/get
        public string Get(int id)
        {
            return "value"+id;
        }

        // POST api/<controller>
        public void Post([FromBody]string value)
        {
        }

        // PUT api/<controller>/5
        public void Put(int id, [FromBody]string value)
        {
        }

        // DELETE api/<controller>/5
        public void Delete(int id)
        {
        }
    }
}
