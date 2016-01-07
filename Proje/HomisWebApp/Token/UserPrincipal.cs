using MongoDB.Driver;
using System.Collections.Generic;
using System.Security.Claims;
using System.Security.Principal;

namespace ServiceTemplate.Token
{
    public class UserPrincipal : GenericPrincipal
    {
        private string[] _roles;

        private UserPrincipal(IIdentity identity, string[] roles)
            : base(identity, roles)
        {
            _roles = roles;
        }

        /// <summary>
        /// Kullanıcıya ait olan veritabanı
        /// </summary>
        public IMongoDatabase DB { get; private set; }

        public static UserPrincipal Create(string username, string[] roles, IEnumerable<Claim> claims, string dbName)
        {
            GenericIdentity i = new GenericIdentity(username, "token");

            if (claims != null)
                i.AddClaims(claims);

            if (roles == null)
                roles = new string[] { };

            return new UserPrincipal(i, roles)
            {
                DB = App.MongoClient.GetDatabase(dbName)
            };
        }

        public string[] GetUserRoles()
        {
            return _roles;
        }

        public string GetUserRolesAsCommaSeperated()
        {
            return string.Join(",", _roles);
        }

        public IEnumerable<Claim> GetClaims()
        {
            return this.Claims;
        }
    }
}
