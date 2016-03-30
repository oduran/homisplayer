 var PlayerManager = function()
 {
  var url = "http://www.bilimtek.com:8080";
  var fileManager = new FileManager();
  var playerUI = new PlayerUI(url);
  var downloading = false; 
  var playerId="";
  var directories =
  {
    presentation : "presentation",
    media : "presentation/media",
    css : "presentation/css",
    script : "presentation/script",
    public : "presentation/public",
    font : "presentation/media/font",
    weather : "presentation/media/weatherimages"
  };
  
  /** Sayfa açıldığında playerId.txt dosyası varsa playerId yi alır ve o id ye sahip olan playerı getirir.
  */
  
  this.initializePlayer = function()
  {
    if(downloading)
    {
      return;
    }
    
    var getPlayerIdFromServer = getPlayerId();
    playerId = getPlayerIdFromServer;
    if(!playerId)
    {
      location.href="register.html";
    }
    
    var connectionExist = checkConnection();
    if(connectionExist)
    {
      createDirectories(function()
      {
        getPlayer(playerId,getPlayerSuccess,getPlayerError);  
      });  
    }
    updatePlayerInterval();
  };

  /** PlayerId'yi txt dosyasından okuyan fonksiyon.
  *{return} {string} fileContent - playerId.
  */
  var getPlayerId = function()
  {
    var fileContent = "";
    fileContent = fileManager.getFile("playerId.txt");
    return fileContent;
  };
  
  /** Serverla bağlantı kesildiğinde dizine yazdırılan player.txt dosyasından player'a ait bilgilerin en son halini çeken fonksiyon.
  */
  var getPlayerError = function()
  {
    console.log("connection error");
    var previousPlayerFile = getPlayerFromFile();
    if(previousPlayerFile.toString())
    {
      for(var i=0;i<previousPlayerFile.workspace.walls.length;i++)
      {
        for(var j = 0;j<previousPlayerFile.workspace.walls[i].screens.length;j++)
        {
          previousPlayerFile.workspace.walls[i].screens[j].html = changeHtmlUrls(previousPlayerFile.workspace.walls[i].screens[j].html);
        }
      }
      
      playerUI.showWorkspace(previousPlayerFile);
    }
    else
    {
      return;
    }
  }
  
  /** Serverdan player'ı başarılı bir şekilde çekildiğinde çalışan fonksiyon.
  *{param} {object} response - Serverdan dönen player objesi.
  */
  var getPlayerSuccess = function(response)
  {
    var player = response.player;
    if(!player.workspace)
    {
      return;
    }
    
    var previousPlayerFile = getPlayerFromFile();
    if(!Util.deepEquals(previousPlayerFile.workspace,player.workspace)&&player)
    {
      downloading = true;
      savePlayerToFile(player);
      var fileUrls = [];
      for(var i=0;i<player.workspace.walls.length;i++)
      {
        for(var j = 0;j<player.workspace.walls[i].screens.length;j++)
        {
          var newFileUrls = getFileUrls(player.workspace.walls[i].screens[j].html);
          fileUrls = mergeArrays(fileUrls,newFileUrls);
          player.workspace.walls[i].screens[j].html = changeHtmlUrls(player.workspace.walls[i].screens[j].html);
        }
      }
      getFiles(fileUrls,player,getFilesSuccess);
    }
    else if(previousPlayerFile.toString())
    {
      for(var i=0;i<previousPlayerFile.workspace.walls.length;i++)
      {
        for(var j = 0;j<previousPlayerFile.workspace.walls[i].screens.length;j++)
        {
          previousPlayerFile.workspace.walls[i].screens[j].html = changeHtmlUrls(previousPlayerFile.workspace.walls[i].screens[j].html);
        }
      }
      
      playerUI.showWorkspace(previousPlayerFile);
    }
  };

  /** Player'ın durumunu update eden fonksiyon.
  */
  var updatePlayerInterval = function()
  { 
    setInterval(function(){updatePlayerState("running",getPlayerError)},20000);
  };
  
  /** Player'ın durumunu update eden fonksiyon.
  *{param} {string} playerState - Playerın durumunu.
  *{param} {function} callbackerror - Serverla bağlantı kesildiğinde getPlayerError fonksiyonunu çağırır.
  */
  var updatePlayerState = function(playerState,callbackerror)
  {
    var data = { playerId : playerId,playerState : playerState,playerLastSeen:(new Date()).toString()};
    $.ajax({
      type: "POST",
      url: url+"/service/updateplayer",
      data: data,
      success:function(){},
      error: callbackerror
    });    
  } 
  
  /** Player'ın durumunu update eden fonksiyon.
  *{param} {array} files - İndirilecek dosyaların tutulduğu array.
  *{param} {object} player - Ekranda oynatılacak player objesi.
  */
  var getFilesSuccess = function(files,player)
  {
    var cssFiles = [];
    
    for(var i = 0 ; i<files.length ; i++)
    {
      if(files[i].indexOf("css")>0)
      {     
        cssFiles.push(files[i]);
      }
    }
    
    var downloadedCssFiles=0;
    for(var i = 0 ; i<cssFiles.length ; i++)
    {
        var cssContent = getCssFile(cssFiles[i]);
        cssContent = changeCssUrls(cssContent);
        saveCssToFile(cssContent,cssFiles[i]);
        downloadCssMedia(cssContent,function()
        { 
          
          downloadedCssFiles++;
          if(downloadedCssFiles===cssFiles.length)
          {
            playerUI.showWorkspace(player);  
            downloading = false;
          }
        });
    }
  };
  
  /** Internet bağlantısı kontrol eden fonksiyon.
  * {return} {boolean} true.
  */
  var checkConnection = function()
  {
      return true;
  };
  
  /** Css dosyalarının alındığı fonksiyon.
  *{param} {string} fileUrl - Getirilecek olan css dosya url'i.
  *{return} {string} result - Css içeriği.
  */
  var getCssFile = function(fileUrl)
  {
    var result = fileManager.getFile("presentation"+fileUrl);
    return result;  
  };
  
  /** PlayerId ye göre player objesinin çekildiği fonksiyon.
  *{param} {string} playerId - Serverdan çekilecek olan playerın idsi.
  *{param} {function} callback - İşlem başarılı olduğunda çalıştırılacak fonksiyon.
  *{param} {function} callbackerror - İşlem başarısız olduğunda çalıştırılacak fonksiyon.
  */
  var getPlayer = function(playerId,callback,callbackerror)
  { 
    var data = { playerId:playerId };
    $.ajax({
      type: "POST",
      url: url+"/service/getplayer",
      data: data,
      success:callback,
      error: callbackerror
    });
  };
  
  /** Playerın son halinin dosyaya yazdırıldığı fonksiyon.
  *{param} {object} player - Ekranda oynatılacak player objesi.
  */
  var savePlayerToFile = function(player){
    fileManager.writeToFile("player.txt",JSON.stringify(player),false,true);
  };
  
  /** Playerın son halinin dosyadan çekildiği fonksiyon.
  *{return} {boolean} result - True/false.
  */
  var getPlayerFromFile = function()
  {
    var result = fileManager.loadFileToJSON("player.txt");
    return result;
  };
  
  /** Playerda oynatılacak içeriklerin regex kullanılarak dosya url'lerinin alındığı fonksiyon.
  *{param} {string} htmlContent - Ekranda oynatılacak içerik.
  *{return} {array} fileUrls - İçeriklerin regex ile alınmış olduğu dosya url'leri.
  */
  var getFileUrls = function(htmlContent)
  {
    var fileUrls=[];
    var regex = /(href=|src=)\"(.*?)(\.css|\.js|\.webm|\.jpeg|\.jpg|\.png)"|(href=|src=)\'(.*?)(\.css|\.js|\.webm|\.jpeg|\.jpg|\.png)'/g;
    var result = htmlContent.match(regex);
    if(!result)
    {
      return fileUrls;
    }
    
    for(var i = 0 ;i<result.length ; i++)
    {
      result[i] = result[i].replace("href=","").replace("src=","").replace(/\"/g,"");
    }

    fileUrls = mergeArrays(fileUrls,result);
    return fileUrls;
  };
  
  /** Dosyaların url'lere göre çekildiği fonksiyon.
  *{param} {array} fileUrls - İçeriklerden parse edilmiş dosya url'leri.
  *{param} {object} player - Ekranda oynatılacak player objesi.
  *{param} {function} callback - Dosya indirilmesi tamamlandığında çalışacak olan fonksiyon.
  */
  var getFiles = function(fileUrls,player,callback)
  {
    var completedFiles = 0;
    for(var i = 0; i<fileUrls.length;i++)
    {
      getFile(fileUrls[i],function(response)
      {
        completedFiles++;
        if(completedFiles == fileUrls.length)
        {
          callback(fileUrls,player);
        }
      });
    }  
  };
  
  /** İçeriklerin regex ile eşleştirilip, eşleşen urllerin değiştirildiği fonksiyon.
  *{param} {string} htmlContent - Ekran içeriği.
  *{return} {string} htmlContent - Değiştirilmiş içerik url'leri.
  */
  var changeHtmlUrls = function(htmlContent)
  {
    var regex = (/(?=([\w&./\-]+)(script|css|media)\/)/gm);
    var replaceString = '../presentation';
    debugger;
    var htmlContent = htmlContent.replace(/("\/(script|css|media)\/)/gm,'"../presentation$1').replace(/presentation"/gm,'presentation').replace(/\/mediaresources\/.*?\//g,"../presentation/media/").replace(/http?:\/\/(.*?)\/\/?/g,"../presentation/").replace(/\.\.\/presentation\/themes\//,"http://www.bilimtek.com:8080/themes/").replace(/\.\.\/presentation\/presentation\//,"../presentation/");
    return htmlContent;
  };
  
  /** Serverdan dosyanın indirildiği fonksiyon.
  *{param} {string} fileUrl - Dosya url.
  *{param} {function} callback - Dosya indirilme işlemi tamamlandığında veya aynı dosya daha önce indirildiğinde çalışan fonksiyon.
  */
  var getFile = function(fileUrl,callback)
  {
    var fileUrl = fileUrl.replace(/'|"/g,"").replace(/\http:\/\/.*?:8080/,"").replace(/\/themes\//,"http://www.bilimtek.com:8080/themes/");
    var filePath = "presentation" + fileUrl.replace(/\/mediaresources\/.*?\//,"/media/").replace(/\http:\/\/.*?:8080/,"").replace(/\/themes\//,"http://www.bilimtek.com:8080/themes/");
    var http = require('http');
    var fs = require('fs');
    if(fs.existsSync(filePath))
    {
      callback("");
      return;
    }

    var file = fs.createWriteStream(filePath);
    var request = http.get(url+fileUrl, function(response) {
      file.on("finish", function()
      {
        file.close();
        callback(response);
      });
      file.on('error', function(err) {
          console.log(err.message);
      });
      
      response.pipe(file);
    });
    
    request.on('error', function(e) {
      console.log('problem with request: ' + e.message);
    });
  };
  
  /** Css dosyalarının içeriğinde dosya urllerinin değiştirildiği fonksiyon.
  *{param} {string} cssContent - Css içeriği.
  *{return} {string} cssContent - Dosya urllerinin değiştirilmiş css içeriği.
  */
  var changeCssUrls = function(cssContent)
  {
    var regex = /(?:([\w&./\-]+)media\/)/gm;
    var replaceString = '../media/';
    cssContent = cssContent.replace(regex, replaceString);
    return cssContent;
  };
  
  /** Css dosyalarının içeriğinde bulunan medyaların indirildiği fonksiyon.
  *{param} {string} cssContent - Css içeriği.
  *{param} {function} callback - Dosya indirilme işlemi tamamlandığında çalışan fonksiyon.
  */
  var downloadCssMedia = function (cssContent,callback)
  {
    var regex = cssContent.match(/(?:([\/\-]+)media.*")/gm);
    if(regex)
    {
      var completedDownloads = 0;
      var numberOfCssMediaFiles = regex.length;
      for(var i = 0; i<numberOfCssMediaFiles;i++)
      {
        var fileUrl = regex[i].slice(0,-1);
        getFile(fileUrl,function(response)
        {
          completedDownloads++;
          if(numberOfCssMediaFiles===completedDownloads)
          {
            callback();
          }
        });
      }
    }
    else
    {
      callback();
    }
  };
  
  /** Css dosyaları dosya dizinine yazıldığı fonksiyon.
  *{param} {string} cssContent - Css içeriği.
  *{param} {string} filePath - Yazdırılacak dosya dizini.
  */
  var saveCssToFile = function(cssContent,filePath)
  {
    var result = fileManager.writeToFile("presentation"+filePath,cssContent,false,true);      
  };
  
  /** Player'ın indirilecek dosyaların kaydedilmesi ve buna bağlı olarak oynatılması için gerekli dosya dizinlerin oluşturulduğu fonksiyon.
  *{param} {function} callback - Dosya dizinleri oluşturulduğunda çalışacak fonksiyon.
  */
  var createDirectories = function(callback)
  {
    var numOfCreatedDirs = 0;
    for (key in directories){
      fileManager.ensureDirectoryExists(directories[key], 777, function(err) {
        if (err) 
        {
          console.log("alarm alarm: "+ err.message);
          return;
        }
        
        numOfCreatedDirs++;
        if(numOfCreatedDirs === Object.keys(directories).length)
        {
          callback();
        }
      });
    }
  };
  
  /** Arraylerin birleştirildiği fonksiyon.
  *{param} {array} array1 - Array.
  *{param} {array} array2 - İlk array'e eklenecek array.
  *{return} {array} array1 - Birleştirilmiş array.
  */
  var mergeArrays = function(array1,array2)
  {
    for(var i = 0; i<array2.length;i++)
    {
      array1.push(array2[i]);
    }
    
    return array1;
  };
  
  var self =this;
}

$( document ).ready(function() 
{
  var playerManager = new PlayerManager();
  var playerInterval = setInterval(function(){
    playerManager.initializePlayer();
  },60000);
  
  playerManager.initializePlayer();
});
