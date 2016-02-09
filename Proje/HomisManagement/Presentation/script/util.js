var Util =
{
  getWindowUrl: function()
  {
   return window.location.href.substring(0,window.location.href.lastIndexOf('/') +1);
  },
  getCookieValue : function (name) 
  {
   var result = document.cookie.match(new RegExp(name + '=([^;]+)'));
   return result;
  }
}