using System;
using System.Collections.Generic;
using System.Security.Claims;

namespace ServiceTemplate.Token
{
    public sealed class UserToken
    {
        private ShortGuid _token;

        public static readonly TimeSpan DefaultSlideExpiration = TimeSpan.FromHours(1);

        public UserPrincipal User { get; private set; }

        public string Token { get { return _token.ToString(); } }

        public TimeSpan SlidingExpiration { get; private set; }

        public string FromApp { get; private set; }

        private UserToken()
        {
            _token = ShortGuid.NewGuid();
            SlidingExpiration = DefaultSlideExpiration;
        }

        public static UserToken GenerateNew()
        {
            return new UserToken();
        }

        public static UserToken GenerateNew(string username, string[] roles, IEnumerable<Claim> claims, TimeSpan slideExpiration, string appName, string dbName)
        {
            return new UserToken()
            {
                User = UserPrincipal.Create(username, roles, claims, dbName),
                SlidingExpiration = slideExpiration,
                FromApp = appName
            };
        }

    }
}