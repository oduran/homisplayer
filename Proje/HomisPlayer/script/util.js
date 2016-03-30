var Util =
{
  /** Window'un bulunduğu origin urli getirir.
  */ 
  getWindowUrl: function()
  {
    if (!window.location.origin) 
    {
      window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port: '');
    }
    console.log(window.location.origin)
    return window.location.origin+"/";
  },
  
  /** Cookie yi isme göre çekmeye yarayan fonksiyon.
  *{param} {string} name - Çekilecek olan cookienin ismi.
  *{return} {string} result[1] - Cookie değeri.
  */
  getCookieValue : function (name) 
  {
   var result = document.cookie.match(new RegExp(name + '=([^;]+)'));
   if(!result)
   {
     return null;
   }
   
   return result[1];
  },
  
  /** Cookie yi isme göre silmeye yarayan fonksiyon.
  *{param} {string} name - Silinecek olan cookienin ismi.
  */
  deleteCookie : function (name)
  {
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  },
  
  /** Urlde istenen parametre ismine göre değerini çekmeye yarayan fonksiyon.
  *{param} {string} name - Urlden istenilen parametre ismi.
  *{param} {string} url - Parametrenin çekilecegi url.
  *{return} {string} parameter - İstenilen parametre.
  */
  getParameterByName : function(name, url)
  {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    var parameter =  decodeURIComponent(results[2].replace(/\+/g, " "));
    return parameter;
  },
  
  /** İki objeyi birleştirmeye yarayan fonksiyon.
  *{param} {object} o1 - İlk obje.
  *{param} {object} o2 - İlk objeye eklenecek obje.
  *{return} {object} o1 - Birleştirilmiş obje.
  */
  mergeObjects : function (o1, o2) 
  {
    if (o1 == null || o2 == null)
    {
      return o1;
    }
    
    for (var key in o2)
    {
      if (o2.hasOwnProperty(key))
      {
        o1[key] = o2[key];
      }
    }
        
    return o1;
  },

  /** İki objenin eşit olup olmadığına fonksiyon.
  *{param} {object} player1 - Kontrol edilecek ilk obje.
  *{param} {object} player2 - Kontrol edilecek ikinci obje.
  *{return} {boolean} bool - true/false.
  */
  deepEquals : function(player1,player2)
  {
    return JSON.stringify(player1)=== JSON.stringify(player2);
  },
  
  /** Loading dialogun oluşturulduğu fonksiyon.
  */
  loadingDialog : (function ($) {
    'use strict';

	// Creating modal dialog's DOM
	var $dialog = $(
		'<div class="modal fade" data-backdrop="static" data-keyboard="false" tabindex="-1" role="dialog" aria-hidden="true" style="padding-top:15%; overflow-y:visible;">' +
		'<div class="modal-dialog modal-m">' +
		'<div class="modal-content">' +
			'<div class="modal-header"><h3 style="margin:0;"></h3></div>' +
			'<div class="modal-body">' +
				'<div class="progress progress-striped active" style="margin-bottom:0;"><div class="progress-bar" style="width: 100%"></div></div>' +
			'</div>' +
		'</div></div></div>');

	return {
	
		show: function (message, options) {
			// Assigning defaults
			if (typeof options === 'undefined') {
				options = {};
			}
			if (typeof message === 'undefined') {
				message = 'Yükleniyor';
			}
			var settings = $.extend({
				dialogSize: 'm',
				progressType: '',
				onHide: null // This callback runs after the dialog was hidden
			}, options);

			// Configuring dialog
			$dialog.find('.modal-dialog').attr('class', 'modal-dialog').addClass('modal-' + settings.dialogSize);
			$dialog.find('.progress-bar').attr('class', 'progress-bar');
			if (settings.progressType) {
				$dialog.find('.progress-bar').addClass('progress-bar-' + settings.progressType);
			}
			$dialog.find('h3').text(message);
			// Adding callbacks
			if (typeof settings.onHide === 'function') {
				$dialog.off('hidden.bs.modal').on('hidden.bs.modal', function (e) {
					settings.onHide.call($dialog);
				});
			}
			// Opening dialog
			$dialog.show();
		},
		/**
		 * Closes dialog
		 */
		hide: function () {
			$dialog.hide();
		}
	};
  })(jQuery)
} 
 