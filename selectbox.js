// Selectbox
// 依赖：jQuery, Handlebars
;(function ($, window, document, undefined) {
	"use strict";

	// singleton system object
	qui = window.qui || {};

	var Selectbox = function (element, options) {
		var self = this
		this.$element  = $(element)
		this.options   = $.extend({}, Selectbox.DEFAULTS, options)

		this.rowTemplate = Handlebars.compile('<option value="{{ value }}" {{#if selected}}selected="selected"{{/if}}>{{ text }}</option>')
		if(self.options.valueTemplate){
			this.valueTemplate = Handlebars.compile(self.options.valueTemplate);
		}
		if(self.options.textTemplate){
			this.textTemplate = Handlebars.compile(self.options.textTemplate);
		}

		var recycleCb = function(){
			self.$element.off()
			qui.notifyCenter.off('recycle',recycleCb)
		}
		qui.notifyCenter.on('recycle',recycleCb)

		this.load()
	}

	Selectbox.prototype.load = function(){
		var self = this
		$.ajax({
			url: self.options.url,
			type: 'get',
			dataType: 'json',
		}).done(function(res){
			var html = []
			if(self.options.allowEmpty){
				html.push(self.rowTemplate({ value:'', text:'请选择', selected:false }))
			}
			_.forEach(res, function(item){
				var val = self.valueTemplate ? self.valueTemplate(item) : item[self.options.valueField]
				var txt = self.textTemplate ? self.textTemplate(item) : item[self.options.textField]

				var selected = (val == self.options.defaultValue)
				html.push(self.rowTemplate({ value:val, text:txt, selected:selected }))
			})
			self.$element.html(html.join(''))

			self.$element.trigger('dataready',[self])
		}).error(function(xhr, status, err){
			
		})
	}

	Selectbox.VERSION  = '1.0.0'

	Selectbox.DEFAULTS = {
		url: null, // 远程URL
		valueField: 'id', // 值属性名 
		textField: 'name', // 文本属性名
		valueTemplate:null, // 值属性模板
		textTemplate:null, // 文本属性模板
		allowEmpty: false, // 可空选
		defaultValue: null, // 默认值
	}

	function Plugin() {
		return this.each(function () {
			var $this   = $(this)
			var data    = $this.data('q.selectbox')
			var options = $(this).data()

			if (!data) $this.data('q.selectbox', (data = new Selectbox(this, options)))
			return $this.data('q.selectbox')
		})
	}

	$.fn.sbox = Plugin
	$.fn.sbox.Constructor = Selectbox

	qui.notifyCenter.on('refresh', function () {
		$('select[rel=selectbox]').sbox() 
	})

})(jQuery, window, document);