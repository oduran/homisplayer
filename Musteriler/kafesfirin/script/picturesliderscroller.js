var PictureSliderScroller = function (container,scrollInterval,propertyToFindWidth)
{
	var container = container;
	var scrollInterval = scrollInterval;
	var propertyToFindWidth = propertyToFindWidth;
    var calculatedPosition=0;
    var childElements = $(container).find(propertyToFindWidth);
	var totalTimeToShowAllPictures = childElements.length * scrollInterval;
	var imageObjectsArray = new Array();
	

    childElements.each(function(index) {
        var currentElement = childElements[index];
		var imageObject = {element:currentElement, offsetTop: currentElement.offsetTop, height: currentElement.height};
		imageObjectsArray.push(imageObject);
		console.log(imageObject.offsetTop+" "+imageObject.height);
    });
	
	var addScrollAnimations = function()
	{
			jQuery.each(imageObjectsArray,function(index, value){
				calculatedPosition = value.offsetTop - (($(window).height() - value.element.height)/2);
				if(calculatedPosition > 0){
					$(container).animate({
					  scrollTop: calculatedPosition
					}, "slow").delay(scrollInterval);

					if(index === imageObjectsArray.length-1){
						$(container).animate({ scrollTop: 0 }, "slow").delay(scrollInterval);
					}
				}
			});
	}
	
	this.run = function(){
		addScrollAnimations();
		setInterval(function () {
			addScrollAnimations();
		}, totalTimeToShowAllPictures);
	}
	
	self = this;
}
