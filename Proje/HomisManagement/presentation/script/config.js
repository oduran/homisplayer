

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
        debugger;
        var elements = "<option value='option3' selected='selected'>'"+el.src+"'</option>"
        $("#dual-list-box .demo2").append(elements);
      });
      
    });
     
    
    //Dialogta Açılan Resimleri Değiştirme
    $("#templateUrl").contents().find(".editableimage").on('dblclick', function (e,el)
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


$( document ).ready(function() 
{	 
   $("#templateUrl").load(function(){
      doubleClickFunctions();
    });
    var demo2 = $('.demo2').bootstrapDualListbox({
      nonSelectedListLabel: 'Non-selected',
      selectedListLabel: 'Selected',
      preserveSelectionOnMove: 'moved',
      moveOnSelect: false,
      nonSelectedFilter: 'ion ([7-9]|[1][0-2])'
    });
    addSaveTextValue();
    addSaveImages();
});
