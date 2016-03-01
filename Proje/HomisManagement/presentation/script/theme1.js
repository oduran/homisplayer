$( document ).ready(function() {
  var currentGuid;
	animateText();
	setTimeout('removeAllItemClass()',1500);
});

function swapImages(){
  var $active = $('#right .active');
  var $next = ($('#right .active').next().length > 0) ? $('#right .active').next() : $('#right img:first');
  $active.fadeOut(function(){
    $active.removeClass('active');
    $next.fadeIn().addClass('active');
	var logger = new Logger();
	logger.log("Picture at screen 1: " + $next.attr("src"), $next.attr("src"));
  });
 
 animateText() ;	
}

function animateText(){
 
	$( ".menuitemheader" ).each(function( index,value ) {
 		$(this).addClass('marquee');
	});
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
		$( ".menuitemheader" ).each(function( index ) {
		$(this).attr("class","menuitemheader editabletext");		
		});
		$( ".drink" ).each(function( index ) {
		$(this).attr("class","drink editabletext");		
		});
		$( ".item" ).each(function( index ) {
			if($(this).hasClass("small")){
				$(this).attr("class","item small editabletext");			
			}
			if($(this).hasClass("large")){
				$(this).attr("class","item large editabletext");			
			}
		
		});
	 	$("p").attr("class","editabletext");	
}
// Run our swapImages() function every 5secs
setInterval('swapImages()', 60000);