var scrollDivImage = function(xdiv,scrollInterval,propertyToFindWith,imageMode){
    //imageMode= 0:top 1: ekranin ortasi
    var dir;
    var ch;
    var arr;
    var arr2=[];
    arrImgHeight=[];
    var temppos=0;

    var temparr = $(xdiv).find(propertyToFindWith); // child elementleri al
	var totalTimeToExecute = scrollInterval * temparr.length;
    temparr.each(function( index ) {
        arr = temparr.slice(index);
        arr2.push(arr.offset().top);
        arrImgHeight.push(arr.height());
    });
	setTimeout(function()
	{
		setInterval(function () {
			console.log("interval executed");
			jQuery.each( arr2,function(ind,value){
				temppos = value- (($(window).height()-arrImgHeight[ind])/2);
				if(temppos>0){
					$(xdiv).animate({
					  scrollTop: temppos
					}, "slow").delay(scrollInterval);

					if(ind===arr2.length-1){
						$(xdiv).animate({ scrollTop: 0 }, "slow").delay(scrollInterval);
					}
				}
			});
		}, totalTimeToExecute);	
	}, scrollInterval);
};




