var intervalId = 0;
var iframeInterval=[];
var iframeTimeout=[];
var pictureInterval;
var timeout;

$( document ).ready(function() {
	 animateText();
   intervalId = setInterval('controlIframeLoad()',1000);
});

function controlIframeLoad()
{
  iframeInterval.push(intervalId);
  if($(".bilimtekcontainer").find("iframe"))
  {
    for(var j = 0; j< iframeInterval.length; j++)
    {
      clearInterval(iframeInterval[j]);
    }
    
    iframeInterval=[];
    var intervalTime = parseInt($("#right").attr("data-time")*1000);
    var swapImagesInterval = (intervalTime>0)?intervalTime:60000;
    pictureInterval = swapImagesInterval;
    
    setTimeout(function()
    {
      intervalId = setInterval(function()
      {
        swapImages();
      }, pictureInterval);
    },2000);
  }
}

function swapImages(){
  iframeInterval.push(intervalId);
  var $active = $('#right .active');
  var $next = ($('#right .active').next().length > 0) ? $('#right .active').next() : $('#right img:first');
  $active.fadeOut(function()
  {
    $active.removeClass('active');
    $next.fadeIn().addClass('active');
    var logger = new Logger();
    //if video is visible then start video; if not stop video.
    if($next[0].localName==="video")
    {
      for(var j = 0; j< iframeInterval.length; j++)
      {
        clearInterval(iframeInterval[j]);
      }
      
      iframeInterval=[];
      var videoDuration = $next[0].duration * 1000;
      console.log("videoDuration(ms) = "+videoDuration);
      $next[0].pause();
      $next[0].currentTime = 0;
      $next[0].load();
      $next[0].play();
      logger.log("Playing video at screen 2: "+$next.attr("src"),$next.attr("src"));
      setTimeout(function(){
        swapImages();
      }, videoDuration);
    }
    
    else
    {
      for(var j = 0; j< iframeInterval.length; j++)
      {
        clearInterval(iframeInterval[j]);
      }

      iframeInterval=[];
      intervalId = setInterval(function()
      {
        swapImages();
      }, pictureInterval);
    }
    
    logger.log("Picture at screen 2: "+$next.attr("src"),$next.attr("src"));
  });
 animateText();
 
}

function animateText(){
  
	$( ".drinkleft" ).each(function( index ) {
		$(this).addClass('marqueeleftThenRight');
	});
	$( ".itemleft" ).each(function( index ) {
		$(this).addClass('marqueeleftThenRight');
	});
	$( ".drinkright" ).each(function( index ) {
		$(this).addClass('marqueerightThenLeft');
	});
	
	$( ".itemright" ).each(function( index ) {
		$(this).addClass('marqueerightThenLeft');
	});
	$("p").addClass('marqueerightThenLeft');
	setTimeout('removeAllItemClass()',2500);


}
function removeAllItemClass(){
 	 
		$( ".drinkleft" ).each(function( index ) {
		$(this).attr("class","drinkleft editabletext");		
		});
		$( ".drinkright" ).each(function( index ) {
		$(this).attr("class","drinkright editabletext");		
		});
		$( ".itemleft" ).each(function( index ) {
			if($(this).hasClass("small")){
 				$(this).attr("class","itemleft small editabletext");			
			}
			if($(this).hasClass("large")){
				$(this).attr("class","itemleft large editabletext");			
			}
		
		});
		$( ".itemright" ).each(function( index ) {
			if($(this).hasClass("small")){
 				$(this).attr("class","itemright small editabletext");			
			}
			if($(this).hasClass("large")){
				$(this).attr("class","itemright large editabletext");			
			}
		
		});
	 	$("p").attr("class","editabletext");	



}


// Run our swapImages() function every 5secs
// Delayed 60 seconds because this one is the second screen.
