// 图片下载
// 依赖：jQuery, ZeroClipboard
;(function ($, window, document, undefined) {
	"use strict";

	// singleton system object
	qui = window.qui || {};

	var ImageDownloader = function (element, options) {
		var self = this
		this.element = element
		this.$element  = $(element)
		this.options   = $.extend({}, ImageDownloader.DEFAULTS, options)

		this.buildUI()
	}

	ImageDownloader.prototype.buildUI = function(){
		var url = this.$element.attr('src')

		this.downloadContainer = $('<div class="image-downloader btn-group"></div>')
		var insertTarget = this.$element
		if(this.$element.parent('.thumbnail')) insertTarget = this.$element.parent('.thumbnail')

		this.downloadContainer.insertAfter(insertTarget)
		this.downloadContainer.append('<a class="btn btn-xs btn-default" href="'+url+'" download>下载</a> ')

		// 复制按钮
		this.downloadContainer.append('<a class="btn btn-xs btn-default copy" href="javascript:void(0)">复制</a>')
		this.clippy = new ZeroClipboard($('.copy', this.downloadContainer));
		this.clippy.on( "copy", function (event) {
			var clipboard = event.clipboardData;
			clipboard.setData( "text/plain", url);
		})
	}

	ImageDownloader.prototype.download = function() {
		var canvas = document.createElement("canvas");
		document.body.appendChild(canvas);
		if (typeof canvas.getContext == "undefined" || !canvas.getContext) {
			alert("browser does not support this action, sorry");
			return false;
		}

		try {
			var context = canvas.getContext("2d");
			var width = this.element.width;
			var height = this.element.height;
			canvas.width = width;
			canvas.height = height;
			canvas.style.width = width + "px";
			canvas.style.height = height + "px";
			context.drawImage(this.element, 0, 0, width, height);
			var rawImageData = canvas.toDataURL(); // canvas.toDataURL("image/png;base64");
			rawImageData = rawImageData.replace("image/png", "image/octet-stream");
			document.location.href = rawImageData;
			document.body.removeChild(canvas);
		}
		catch (err) {
			console.log(err)
			document.body.removeChild(canvas);
			alert("Sorry, 下载失败");
		}

		return true;
	}

	ImageDownloader.VERSION  = '1.0.0'

	ImageDownloader.DEFAULTS = {
	}

	function Plugin() {
		return this.each(function () {
			var $this   = $(this)
			var data    = $this.data('q.imgdownloader')
			var options = $this.data()

			if (!data) $this.data('q.imgdownloader', (data = new ImageDownloader(this, options)))

			return $this.data('q.imgdownloader')
		})
	}

	$.fn.imgdn = Plugin
	$.fn.imgdn.Constructor = ImageDownloader

	qui.notifyCenter.on('refresh', function () {
		$('img[rel=downloadable]').imgdn()
	})

})(jQuery, window, document);