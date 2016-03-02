  var user;
  var userMediaresources ="";
  var iframeMediaresources = "";
  var selectedMenu=0;
  var url = Util.getWindowUrl();
  var addSaveImages = function ()
  {
    $("#saveImages").click(function()
    { 
       $("#templateUrl").contents().find("#right").empty();
       var images =[];
               debugger;

       $("#onIframeMediaResources").find("option").each(function(e)
      { 
        var mediaUrl = $("#onIframeMediaResources").find("option")[e].text

        if(e==0)
        {
          var element = "<img class='right-image active' src = '"+url+"media/"+mediaUrl+"'></img>"
        }
        else
        {
          var element = "<img src = '"+url+"media/"+mediaUrl+"'></img>"
        }
                  images.push(element);

      });
       $("#imagesConfigModal").modal("hide");
       $("#templateUrl").contents().find("#right").append(images);
    });
  }

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

  var doubleClickFunctions = function()
  {
    //Menu Itemleri Düzenleme İşlemi
    
     $("#templateUrl").contents().find(".editabletext").on('dblclick', function () {
     $("#textConfigModal").modal("show");
     currentGuid = createguid();
     $(this).attr("id",currentGuid);
     $("#textValue").val($(this).text());
    });
      
    
    //Resim Animasyonu Değiştirme
    $("#templateUrl").contents().find(".editablemultipleimages").on('dblclick' ,function () {
    $("#imagesConfigModal").modal("show");   
 
      var images =[];
      $("#images").empty();
          
      $("#templateUrl").contents().find("#right .right-image").each(function(e,el)
      {
        var url = el.src;
        var resourceName = url.substr(url.lastIndexOf('/') + 1);
        var iframeMediaResource = "<option id='"+resourceName+"_iframe'>"+resourceName+"</option>"
        $("#onIframeMediaResources").append(iframeMediaResource);
       
        
      });
       var userName = Util.getParameterByName('userName');
        
       user = getUser(userName)
       
    });
     
    
    //Dialogta Açılan Resimleri Değiştirme
    $("#templateUrl").contents().find(".editableimage").on('dblclick', function (e,el)
    {
      if(e.target.tagName==="VIDEO")
      {
        $("<input id='file' type='file' accept='video/*'>").insertAfter(e.currentTarget.firstChild).focus();
      }
      if(e.target.tagName==="IMG")
      {
        $("<input id='file' type='file' accept='image'>").insertAfter(e.currentTarget.firstChild).focus();
      }
        var fileInput = document.querySelector('#file');
        var img = e.target;
        
        function previewImage(file)
        {
          var image = file;
          var name = file.name;
          
          var reader = new FileReader();
          reader.onload = (function(aImg) {
              return function(e) {
                  img.src = "http://localhost:8080/mediaresources/"+name;
                  };
          })(img);
          reader.readAsDataURL(file);
          $('#file').remove();
        }
        fileInput.addEventListener("change", handleFiles, false);
        
        function handleFiles()
        {
            var fileList = this.files; /* now you can work with the file list */
            previewImage(fileList[0]);
        } 
     
      
    });
  }
  
  var getUser = function(userName)
  {
    if(!userName)
    {
      
      return;
    }
    
     var data = {};
    $.ajax({
    type: "POST",
    url: url+"service/getuser",
    data: data,
    success: function(response)
    {
      return getUserMediaResources(response.user);

    },
    error: function(error){ }
    });
  };
  
  var getUserMediaResources = function(user)
    { 
     
      if(!user.mediaResources)
      {
        return;
      }
       
      if(user.mediaResources)
      {
        for(var i = 0 ;i<user.mediaResources.length; i++)
        {
          debugger;
          var mediaUrl = url + user.mediaResources[i].url;
          var resourceName = mediaUrl.substr(mediaUrl.lastIndexOf('/') + 1);
          var mediaResourceName = "<option id='"+resourceName+"_userMedia' >"+resourceName+"</option>";
          $("#onUserMediaResources").append(mediaResourceName); 
        }
      }
      else
      {
        return;
      }
    }

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
  
  var addMoveLeftButtonClick = function()
  {
    $("#moveLeft").click(function()
    {
      if(selectedMenu===1)
      {
        for(var i =0 ; i<userMediaresources.length;i++)
        {
          var option = "<option id='"+userMediaresources[i]+"_iframe'>"+userMediaresources[i]+"</option>";
          $("#onUserMediaResources option[id='"+userMediaresources[i]+"_userMedia']").remove();
          $("#onIframeMediaResources").append(option);
        }
       }
    });
  }
  
  var addMoveRightButtonClick = function()
  {
    $("#moveRight").click(function()
    {
      if(selectedMenu===2)
      {
         for(var i =0 ; i<iframeMediaresources.length;i++)
        {
          var option = "<option id='"+iframeMediaresources[i]+"_userMedia'>"+iframeMediaresources[i]+"</option>";
          $("#onIframeMediaResources option[id='"+iframeMediaresources[i]+"_iframe']").remove();
          $("#onUserMediaResources").append(option);
        }
       }
    });
  }
  
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

$( document ).ready(function() 
{	 
   $("#templateUrl").load(function(){
      doubleClickFunctions();
    });
    addMoveLeftButtonClick();
    addMoveRightButtonClick();
    addOptionOnChange();
    addSaveTextValue();
    addSaveImages();
});
