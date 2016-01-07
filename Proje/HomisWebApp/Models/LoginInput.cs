using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace ServiceTemplate.Models
{
    /// <summary>
    /// Login information
    /// </summary>
    public class LoginInput
    {
        /// <summary>
        /// Username
        /// </summary>
        [Required(AllowEmptyStrings = false, ErrorMessage = "Username is missing")]
        [StringLength(40, MinimumLength = 3, ErrorMessage = "Username can not be shorter than 3 chars")]
        public string usr { get; set; }

        /// <summary>
        /// Password
        /// </summary>
        [Required(AllowEmptyStrings = false, ErrorMessage = "Password is missing")]
        [StringLength(40, MinimumLength = 1, ErrorMessage = "Password can not be shorter than 1 chars")]
        public string pwd { get; set; }

        /// <summary>
        /// Sliding Expiration is a property that watch you in the specified time interval. If there is no action this interval the system will kick you out.
        /// (in minutes)
        /// </summary>
        [Range(1, 1440)]
        public int slidingExpiration { get; set; }

        /// <summary>
        /// Application name
        /// </summary>
        [Required(AllowEmptyStrings = false)]
        public string appName { get; set; }

        /// <summary>
        /// Device ID (for mobile support)
        /// </summary>
        [Required(AllowEmptyStrings = true)]
        public string deviceId { get; set; }
    }
}
