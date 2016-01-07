using Newtonsoft.Json;
using ServiceTemplate.Token;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ServiceTemplate.Models
{
    public class LoginOutput
    {
        public int Success { get; set; }

        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public string Error { get; set; }

        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public string Token { get; set; }

        public int SlideExpiration { get; set; }

        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public string Roles { get; set; }

        public static LoginOutput UserNotFound()
        {
            return new LoginOutput() { Success = 0, Error = "User not found" };
        }

        public static LoginOutput InvalidPassword()
        {
            return new LoginOutput() { Success = 0, Error = "Invalid password" };
        }

        public static LoginOutput InvalidApp()
        {
            return new LoginOutput() { Success = 0, Error = "Invalid app" };
        }

        public static LoginOutput InvalidDb()
        {
            return new LoginOutput() { Success = 0, Error = "Invalid DB" };
        }

        public static LoginOutput TooManyUsersLoggedIn()
        {
            return new LoginOutput() { Success = 0, Error = "TooManyUsersLoggedIn" };
        }

        public static LoginOutput OK(UserToken token)
        {
            return new LoginOutput()
            {
                Success = 1,
                Token = token.Token,
                Roles = token.User.GetUserRolesAsCommaSeperated(),
                SlideExpiration = (int)token.SlidingExpiration.TotalMinutes
            };
        }
    }
}