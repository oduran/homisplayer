var addSaveImages = function ()
{
  $("#saveImages").click(function()
  { 
    $("#right").empty();
     var images =[];
    $("#images .right-image").each(function(e)
    { 
      images.push($("#images .right-image")[e]);
       if(e==0)
      {
        images[e].setAttribute("class","right-image active");
      }
      else
      {
        images[e].setAttribute("class","right-image");
      }
      images[e].removeAttribute("style");
    });
     $("#imagesConfigModal").modal("hide");
     $("#right").append(images);

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
      $("#"+currentGuid).html(splitTextHtml);
    }
    
    else
    {
      $("#"+currentGuid).text($("#textValue").val());
    }
    
    $("#textConfigModal").modal("hide");

    currentGuid="";
  })
}

var doubleClickFunctions = function()
{
  //Menu Itemleri Düzenleme İşlemi
  $(".editabletext").on('dblclick', function () {
   $("#textConfigModal").modal("show");
   currentGuid = createguid();
   $(this).attr("id",currentGuid);
   $("#textValue").val($(this).text());
  });
    
  
  //Resim Animasyonu Değiştirme
  $(".editablemultipleimages").on('dblclick' ,function () {
    $("#imagesConfigModal").modal("show");     
    var images =[];
    $("#images").empty();
    
    $("#right .right-image").each(function(e,el)
    {
     if(el.localName=="video")
     {  
       debugger;
       images[e] = "<video class='right-image' src='"+el.src+"' type='video/webm' style='width:250px;margin-left:20px'></video>";
     }
     else
     {
      images[e] = "<img  class='right-image' src='"+el.src+"' style='width:250px;margin-left:20px' />"; 
     }
      
      $("#images").append(images[e]);
    });
    
  });
  
  //Dialogta Açılan Resimleri Değiştirme
  $(".editableimage").on('dblclick', function (e,el)
  {
    debugger;
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

function createguid() 
{
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

$( document ).ready(function() {
  var currentGuid;
  doubleClickFunctions();
  addSaveTextValue();
  addSaveImages();
});
