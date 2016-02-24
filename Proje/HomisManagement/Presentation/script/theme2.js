$( document ).ready(function() {
	 animateText();
});

var intervalId = 0;
var pictureInterval = 60000;

function swapImages(){
  var $active = $('#right .active');
  var $next = ($('#right .active').next().length > 0) ? $('#right .active').next() : $('#right img:first');
  $active.fadeOut(function(){
    $active.removeClass('active');
    $next.fadeIn().addClass('active');
	var logger = new Logger();
	//if video is visible then start video; if not stop video.
	$('video').each(function(){
		if ($(this).is(".active")) {
			if(intervalId != 0)
			{
				console.log("clearing interval running video. interval id="+intervalId);

				clearInterval(intervalId);
				intervalId = 0;
			}
			
			var videoDuration = $(this).get(0).duration * 1000;
			console.log("videoDuration(ms) = "+videoDuration);
			$(this).get(0).pause();
			$(this).get(0).currentTime = 0;
			$(this).get(0).load();
			$(this).get(0).play();
			logger.log("Playing video at screen 2: "+$next.attr("src"),$next.attr("src"));
			setTimeout(function(){
				swapImages();
			}, videoDuration);
		} else {
			$(this).get(0).pause();
			if(intervalId == 0)
			{
				intervalId = setInterval(
				function(){
					swapImages();
				}, pictureInterval);
				console.log("Video stopped. new interval id="+intervalId);
			}
		}
	});
	

	logger.log("Picture at screen 2: "+$next.attr("src"),$next.attr("src"));
  });
 animateText();
 
}

function animateText(){
 
	 
	$( ".drink" ).each(function( index ) {
		$(this).addClass('marquee');
	});
	$( ".item" ).each(function( index ) {
		$(this).addClass('marquee');
	});
	$("p").addClass('marquee');
	setTimeout('removeAllItemClass()',2500);


}
function removeAllItemClass(){
 	
 		$( ".drink" ).each(function( index ) {
		$(this).attr("class","drink");		
		});
		$( ".item" ).each(function( index ) {
			if($(this).hasClass("small")){
 				$(this).attr("class","item small");			
			}
			if($(this).hasClass("large")){
				$(this).attr("class","item large");			
			}
		
		});
	 	$("p").attr("class","");	
}

setTimeout(function(){
	intervalId = setInterval(
	function(){
		swapImages();
	}, pictureInterval);
},20000);