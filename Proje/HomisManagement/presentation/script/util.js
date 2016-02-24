var Util =
{
  getWindowUrl: function()
  {
   return window.location.href.substring(0,window.location.href.lastIndexOf('/') +1);
  },
  
  getCookieValue : function (name) 
  {
   var result = document.cookie.match(new RegExp(name + '=([^;]+)'));
   if(!result)
   {
     return null;
   }
   
   return result[1];
  },
  
  deleteCookie : function (name)
  {
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  },
  
  getParameterByName : function(name, url)
  {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  },
  
  mergeObjects : function (o1, o2) 
  {
    if (o1 == null || o2 == null)
    {
      return o1;
    }
    
    for (var key in o2)
    {
      if (o2.hasOwnProperty(key))
      {
        o1[key] = o2[key];
      }
    }
        
    return o1;
  },
  test: function (){}
} 
 