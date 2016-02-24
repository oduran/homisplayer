$( document ).ready(function() {
  animateText();
});
function swapImages(){
  var $active = $('#middle .active');
  var $next = ($('#middle .active').next().length > 0) ? $('#middle .active').next() : $('#middle img:first');
  $active.fadeOut(function(){
    $active.removeClass('active');
    $next.fadeIn().addClass('active');
	
	var logger = new Logger();
	logger.log("Picture at screen 3: "+$next.attr("src") , $next.attr("src"));
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
		$(this).attr("class","drinkleft");		
		});
		$( ".drinkright" ).each(function( index ) {
		$(this).attr("class","drinkright");		
		});
		$( ".itemleft" ).each(function( index ) {
			if($(this).hasClass("small")){
 				$(this).attr("class","itemleft small");			
			}
			if($(this).hasClass("large")){
				$(this).attr("class","itemleft large");			
			}
		
		});
		$( ".itemright" ).each(function( index ) {
			if($(this).hasClass("small")){
 				$(this).attr("class","itemright small");			
			}
			if($(this).hasClass("large")){
				$(this).attr("class","itemright large");			
			}
		
		});
	 	$("p").attr("class","");	



}


// Run our swapImages() function every 5secs
// Delayed 60 seconds because this one is the second screen.
setTimeout(function(){
	setInterval('swapImages()', 60000);
},40000);