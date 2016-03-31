  var Config = function ()
  {
    var user;
    var userMediaresources ="";
    var iframeMediaresources = "";
    var selectedMenu=0;
    var url = Util.getWindowUrl();
    var serviceUrl = url +"service/";
    var userselected =[];
    var selected =[];
    var userResources =[];
    var sendedUserResources =[];
    var userResourcesListItem =[];
    
    
    
    /**
    * Kullanıcı menuboard üzerinde dönen resim animasyonlarındaki resimleri değiştirmek için kullanılan fonksiyon.
    */
    var addSaveImages = function ()
    {
      $("#saveImages").click(function()
      { 
         $("#templateUrl").contents().find("#right").empty();
         var images =[];
   
         $("#onIframeMediaResources").find("li").each(function(e)
        { 
          var mediaUrl = this.getAttribute("value");
          
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
          var splitTextHtml = ""+splitText[0]+".<span class='smalltext'>"+splitText[1]+"</span>&nbsp ?";
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
          var iframeMediaResource = "<li value='"+url+"' id='"+resourceName+"_iframe'><span class='my-handle'>::</span>"+resourceName+"</li>";
          $("#onIframeMediaResources").append(iframeMediaResource);
        });

        var userName = Util.getParameterByName('userName');
        
          getUser(userName,function(user){
          getUserMediaResources(user)
            });
        
      });
    };
    
    /** Medya kaynaklarının olduğu dialog daki listeyi draggable ve selectable yapmaya yarayan fonksiyon.
    */
    var addSetSelectableAndDraggableList = function()
    {
      $('ul.sortable').multisortable();
      $('ul#onIframeMediaResources').sortable('option', 'connectWith', 'ul#onUserMediaResources');
      $('ul#onUserMediaResources').sortable('option', 'connectWith', 'ul#onIframeMediaResources');
      $(".selected").click(function()
      {
          $(this).removeClass("selected").addClass("unselected");
        
      });
      $(".unselected").click(function()
      {
          $(this).removeClass("unselected").addClass("selected");
        
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
          userMediaResourceName += "<li value='"+mediaUrl+"' id='"+resourceName+"_userMedia' ><span class='my-handle'>::</span>"+resourceName+"</li>";
          userResources.push(resourceName);
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
        $("#onUserMediaResources li.selected").each(function()
        {
          console.log(this);
          this.removeAttribute("class");
          var resource = this.getAttribute('value');
          var resourceName = resource.substr(resource.lastIndexOf('/') + 1);
          var option = "<li value='"+resource+"' id='"+resourceName+"_iframe'><span class='my-handle'>::</span>"+resourceName+"</li>";
          $("#onIframeMediaResources").append(option);
        });

      });
    }
    
    /**
    * Resim değiştirme dialogunda sağ tarafa atılmak istenen resimleri atayan button.
    */
    var addMoveRightButtonClick = function()
    {
      $("#moveRight").click(function()
      {
        var length = parseInt($("#onIframeMediaResources li.selected").length);
        $("#onIframeMediaResources li.selected").each(function(index)
        {
          var resource = this.getAttribute('value');
          var resourceName = resource.substr(resource.lastIndexOf('/') + 1);
          sendedUserResources.push(resource);
          $("#onIframeMediaResources li[id='"+resourceName+"_iframe']").remove();
          if( length-1 === index)
          { userResourcesListItem = [];
            $.each(sendedUserResources, function(i, el)
            {
              var resName = el.substr(el.lastIndexOf('/') + 1);
              if($.inArray(resName, userResources) === -1)
              {
                var option = "<li value='"+el+"' id='"+resName+"_userMedia'><span class='my-handle'>::</span>"+resName+"</li>";
                userResourcesListItem.push(option);
                userResources.push(resName);
              } 
            });
            
            $("#onUserMediaResources").append(userResourcesListItem);
          }
          
        });

        sendedUserResources=[];

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
        userResources=[];
        sendedUserResources=[];
        userResourcesListItem=[];
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
      addSetSelectableAndDraggableList();
      
    }
  }
$( document ).ready(function() 
{	 
  var config = new Config();
  config.initialize();
});
