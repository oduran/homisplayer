  var Config = function ()
  {
    var user;
    var userMediaresources ="";
    var iframeMediaresources = "";
    var selectedMenu=0;
    var url = Util.getWindowUrl();
    var serviceUrl = url +"service/";
    
    /**
    * Kullanıcı menuboard üzerinde dönen resim animasyonlarındaki resimleri değiştirmek için kullanılan fonksiyon.
    */
    var addSaveImages = function ()
    {
      $("#saveImages").click(function()
      { 
         $("#templateUrl").contents().find("#right").empty();
         var images =[];
   
         $("#onIframeMediaResources").find("option").each(function(e)
        { 
          var mediaUrl = $("#onIframeMediaResources").find("option")[e].value;
          
          if(e==0)
          { 
            if(mediaUrl.indexOf(".webm")>0||mediaUrl.indexOf(".mp4")>0||mediaUrl.indexOf(".ogg")>0)
            {
              var element = "<video autoplay class='active' src = '"+mediaUrl+"'></video>"
            }
            
            else
            {
              var element = "<img class='right-image active' src = '"+mediaUrl+"'></img>";
            }
          }
          
          else
          {
            if(mediaUrl.indexOf(".webm")>0||mediaUrl.indexOf(".mp4")>0||mediaUrl.indexOf(".ogg")>0)
            {
              var element = "<video src = '"+mediaUrl+"'></video>";
            }
            
            else
            {
              var element = "<img src = '"+mediaUrl+"'></img>";
            }
          }
          
          images.push(element);

        });
         $("#imagesConfigModal").modal("hide");
         $("#onIframeMediaResources").empty();
         $("#onUserMediaResources").empty();
         var swapImagesInterval = $("#swapImagesInterval").val();
         $("#templateUrl").contents().find("#right").attr("data-time",swapImagesInterval);
         $("#templateUrl").contents().find("#right").append(images);
      });
    }
    
    /**
    * Kullanıcının menuboard üzerinde yazıları değiştirmek için kullanılan fonksiyon.
    */
    var addSaveTextValue = function ()
    {
      $("#saveTextValue").click(function()
      { 
        var matches = $("#textValue").val().match(/\d+/g);
        if(matches != null)
        {
          var splitText = $("#textValue").val().slice(0, -1).split(".");
          var splitTextHtml = ""+splitText[0]+".<span class='smalltext'>"+splitText[1]+"</span>&nbsp ₺";
          $("#templateUrl").contents().find("#"+currentGuid).html(splitTextHtml);
        }
        
        else
        {
          $("#templateUrl").contents().find("#"+currentGuid).text($("#textValue").val());
        }
        
        $("#textConfigModal").modal("hide");

        currentGuid="";
      })
    }
    
    
    /**
    * Şablon sayfaları üzerinde double click eventlerini ekleyen fonksiyon.
    */
    var doubleClickFunctions = function()
    {
       //Menu Itemleri Düzenleme İşlemi
      changeText();
      //Resim Animasyonu Değiştirme
      changeImage();
    }
    
    /**
    * Şablon sayfaları üzerinde menu itemleri düzenleme işlemeni yapan fonksiyon.
    */
    var changeText = function()
    {
      $("#templateUrl").contents().find(".editabletext").on('dblclick', function () 
      {
        $("#textConfigModal").modal("show");
        currentGuid = createguid();
        $(this).attr("id",currentGuid);
        $("#textValue").val($(this).text());
      });
    }
    
    /**
    * Şablon sayfaları üzerinde resimleri değiştirme işlemeni yapan fonksiyon.
    */
    var changeImage = function () 
    {
      
      $("#templateUrl").contents().find(".editablemultipleimages").on('dblclick' ,function () 
      {
        $("#imagesConfigModal").modal(
        {
          backdrop: 'static',
          keyboard: false 
        });
        $("#imagesConfigModal").modal("show");
        $("#images").empty();
        $("#templateUrl").contents().find("#right img,video").each(function(e,el)
        {
          var url = el.src;
          var resourceName = url.substr(url.lastIndexOf('/') + 1);
          var iframeMediaResource = "<option value='"+url+"' id='"+resourceName+"_iframe'>"+resourceName+"</option>";
          $("#onIframeMediaResources").append(iframeMediaResource);
        });

        var userName = Util.getParameterByName('userName');
        
          getUser(userName,function(user){
          getUserMediaResources(user)
            });
        
      });
    }
    
    /**
    * Kullanıcı isme göre çağrıan fonksiyon.
    * @params {string} userName - Kullanıcı adı.
    * @params function callback 
    * @returns {user} - response dan gelen user objesini döndürür. 
    */
    var getUser = function(userName,callback)
    {
      var data = {name: userName};
      if(!userName)
      {
        data = {};
      }
      
      var targetUrl = serviceUrl+"getUser";
      $.ajax({
        type: "POST",
        url:  targetUrl,
        data: data,
        success: function(response)
        {
          
          if(response.message)
          {
            BootstrapDialog.alert(response.message);
            return;
          }
          
          callback(response.user);
        }
      });
    };
    
    /**
    * Şablon sayfaları resimlerini değiştirmek için kullanıcıyı ait resimleri getiren fonksiyon.
    * @returns Kullanıcıya ait resimleri ekrana bastırır.
    */
    var getUserMediaResources = function(user)
    { 
     var userMediaResourceName="";

      if(!user.mediaResources)
      {
        return;
      }
       
      if(user.mediaResources)
      {
        for(var i = 0 ;i<user.mediaResources.length; i++)
        {
          var mediaUrl = "/" + user.mediaResources[i].url;
          var resourceName = mediaUrl.substr(mediaUrl.lastIndexOf('/') + 1);
          userMediaResourceName += "<option value='"+mediaUrl+"' id='"+resourceName+"_userMedia' >"+resourceName+"</option>";
        }
       $("#onUserMediaResources").html(userMediaResourceName); 

      }
      else
      {
        return;
      }
    }
    
    /**
    * Şablon sayfaları değiştirilen itemların id'sine guid atayan fonksiyon.
    */
    var createguid = function()
    {
      function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
          .toString(16)
          .substring(1);
      }
      return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
    }
    
    /**
    * Resim değiştirme dialogunda sol tarafa atılmak istenen resimleri atayan button.
    */
    var addMoveLeftButtonClick = function()
    {
      $("#moveLeft").click(function()
      {
        if(selectedMenu===1)
        {
          for(var i =0 ; i<userMediaresources.length;i++)
          {
            var resourceName = userMediaresources[i].substr(userMediaresources[i].lastIndexOf('/') + 1);
            var option = "<option value='"+userMediaresources[i]+"' id='"+resourceName+"_iframe'>"+resourceName+"</option>";
            $("#onIframeMediaResources").append(option);
            selectedMenu=0;
          }
          
         }
      });
    }
    
    /**
    * Resim değiştirme dialogunda sağ tarafa atılmak istenen resimleri atayan button.
    */
    var addMoveRightButtonClick = function()
    {
      $("#moveRight").click(function()
      {
        if(selectedMenu===2)
        {
          for(var i =0 ; i<iframeMediaresources.length;i++)
          {
            var resourceName = iframeMediaresources[i].substr(iframeMediaresources[i].lastIndexOf('/') + 1);
            var option = "<option value='"+iframeMediaresources[i]+"'  id='"+resourceName+"_userMedia'>"+resourceName+"</option>";
            $("#onIframeMediaResources option[id='"+resourceName+"_iframe']").remove();
            $("#onUserMediaResources").append(option);
             selectedMenu=0;
          }
         }
      });
    }
    
    /**
    * Resim değiştirme dialogunda seçilen resimlerin bilgilierini tutan fonksiyon.
    */
    var addOptionOnChange = function () 
    {
    $('#onUserMediaResources').on('change',function()
      { 
        selectedMenu=1;
        userMediaresources=$(this).val();
       }); 
    $('#onIframeMediaResources').on('change',function()
      { 
        selectedMenu=2;
        iframeMediaresources=$(this).val();
       });    
    }
    var addCloseImageModal = function ()
    {
      $("#closeImageModal").click(function()
      {
        $("#onIframeMediaResources").empty();
        $("#onUserMediaResources").empty();
        
        $("#imagesConfigModal").modal("hide");
      });
    }
    /**
    * Config js yüklenme kısmında yüklenmesi gereken fonksiyonlar.
    */
    this.initialize = function()
    {
      $("#templateUrl").load(function()
      {
        doubleClickFunctions();
      });
      
      addMoveLeftButtonClick();
      addMoveRightButtonClick();
      addOptionOnChange();
      addSaveTextValue();
      addSaveImages();
      addCloseImageModal();
    }
  }
$( document ).ready(function() 
{	 
  var config = new Config();
  config.initialize();
});
