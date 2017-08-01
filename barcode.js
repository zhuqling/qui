// 条形码
// 依赖：jQuery, bwip-js
;(function ($, window, document, undefined) {
	"use strict";

	// singleton system object
	qui = window.qui || {};

	var Barcode = function (element, options) {
		var self = this
		this.element  = element
		this.$element  = $(element)
		this.options   = $.extend({}, Barcode.DEFAULTS, options)

		var scale = this.options.scale.toString()
		var scales = scale.split(',')
		if(scales.length == 2){
			this.scaleX = parseFloat(scales[0])
			this.scaleY = parseFloat(scales[1])
		} else {
			scale = parseFloat(scale)
			this.scaleX = scale
			this.scaleY = scale
		}

		this.render()
	}

	Barcode.prototype.render = function(){
		var self = this
		var opts = {}

		var bw = new BWIPJS

		// Add the alternate text
		// opts.alttext = bw.value('altx')

		// Anti-aliased or monochrome fonts?
		// This hooks directly into the FreeType library.
		if(this.options.height)	opts.height = parseFloat(this.options.height)
		if(this.options.width)	opts.width = parseFloat(this.options.width)
		bw.bitmap(new Bitmap)
		bw.scale(this.scaleX, this.scaleY)

		bw.push(this.options.text.toString())
		bw.push(opts)

		bw.call(symdesc[this.options.codeType].sym, function(e) {
			bw.bitmap().show(self.element, self.options.rotate)
		})
	}

	Barcode.VERSION  = '1.0.0'

	Barcode.DEFAULTS = {
		codeType: 'code128', // 条形类型
		text: '', // 条码内容
		height: null, // 高度, 默认：4，最小允许设置为2，小于2时会无法正确显示
		width: null, // 宽度, 默认：1
		rotate: 'N', // 条码方向 N 向上（默认）/ R向右 /L向左 /I向下
		scale: '2', // 缩放，默认：2, 指定不同X,Y值时，使用：1,2
	}

	function Plugin() {
		return this.each(function () {
			var $this   = $(this)
			var data    = $this.data('q.barcode')
			var options = $this.data()

			if (!data) $this.data('q.barcode', (data = new Barcode(this, options)))

			return $this.data('q.barcode')
		})
	}

	$.fn.barcode = Plugin
	$.fn.barcode.Constructor = Barcode

	qui.notifyCenter.on('refresh', function () {
		$('[rel=barcode]').barcode()
	})

})(jQuery, window, document);