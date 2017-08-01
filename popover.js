// Popover
// 依赖：jQuery, requireJS, Handlebars
;(function ($, window, document, undefined) {
	"use strict";

	// singleton system object
	qui = window.qui || {};

	var Popover = function (element, options) {
		var self = this
		this.$element  = $(element)
		this.options   = $.extend({}, Popover.DEFAULTS, options)

		if(self.options.triggerMethod === 'hover'){
			self.$element.hover(self.load.bind(this), self.load.bind(this))
		} else {
			self.$element.on(self.options.triggerMethod, self.load.bind(this))
		}

		var opt = {
			trigger : 'manual',
			placement : self.options.placement,
			title: self.options.title,
			content: self.options.content,
		};
		if(self.options.url) opt.html = true;
		self.$element.popover(opt)

		var recycleCb = function(){
			self.$element.off()
			qui.notifyCenter.off('recycle',recycleCb)
		}
		qui.notifyCenter.on('recycle',recycleCb)
	}

	Popover.prototype.load = function(){
		var self = this
		if(self.pover_shown){
			self.$element.popover('hide')
			self.pover_shown = false
			return true
		}

		if(!self.options.url) {
			self.$element.popover('show')
			self.pover_shown = true
			return true
		}

		var preloads = []
		var sep = (self.options.url.indexOf('?') === -1) ? '?' : '&'
		var dataUrl = self.options.url + sep + 't='+(new Date()).getTime()
		preloads.push('json!'+dataUrl)
		if(self.options.urlTemplate){
			var tplPath = 'template/'+self.options.urlTemplate+'.hbs'
			preloads.push('text!'+tplPath)
		}
		require(preloads, function(data, tpl){
			var html = data
			if(tpl)
				html = Handlebars.compile(tpl)(data)

			self.$element.attr('data-content', html)
			self.$element.popover('show')
			self.pover_shown = true
		})
	}

	Popover.VERSION  = '1.0.0'

	Popover.DEFAULTS = {
		triggerMethod: 'click', // 触发方式，click | hover | focus
		placement: 'auto', // 放置位置，top | bottom | left | right | auto
		title: '标题', // 标题
		content: '', // 静态内容
		url: null, // 远程URL
		urlTemplate: null, // 动态内容模板
	}

	function Plugin() {
		return this.each(function () {
			var $this   = $(this)
			var data    = $this.data('q.popover')
			var options = $(this).data()

			if (!data) $this.data('q.popover', (data = new Popover(this, options)))
			return $this.data('q.popover')
		})
	}

	$.fn.pover = Plugin
	$.fn.pover.Constructor = Popover

	qui.notifyCenter.on('refresh', function () {
		$('[rel=popover]').pover() 
	})

})(jQuery, window, document);