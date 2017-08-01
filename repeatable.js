// Repeatable
// 依赖：jQuery, Handlebars
;(function ($, window, document, undefined) {
	"use strict";

	// singleton system object
	qui = window.qui || {};

	var Repeatable = function (element, options) {
		var self = this
		this.$element  = $(element)
		this.options   = $.extend({}, Repeatable.DEFAULTS, options)

		this.rowClass = this.options.rowClass
		this.rowContainer = $(this.options.rowContainer)
		var rowHtml = $(this.options.rowTemplate).html()
		this.rowTemplate = Handlebars.compile(rowHtml)

		this.addButton = $(this.options.addButton)
		this.addButton.on('click', function(){
			self.addRow()
			return false
		})

		var removeHandler = function(){
			this.closest(self.rowClass).remove()

			// 至少保留一行
			if(self.rowContainer.find(self.rowClass).length <= 0) {
				self.addRow()
			}
			return false
		}
		$(document).on('click', this.options.removeButton, removeHandler)

		var enterKeyHandler = function(evt){
			var target = $(evt.target)
			var code = evt.keyCode || evt.which;
			if(target.is(':text') && 13 === code){
				// 当前输入框为行内最后的输入框时，如果下方没有新行，自动增加新行
				var row = target.closest(self.rowClass)
				if(row.find(':text').eq(-1)[0] == evt.target){
					var nextRow = row.next(self.rowClass).length
					if(!nextRow) self.addRow()
				}

				// 转到下一个输入框
				var allTextInput = self.rowContainer.find(':text')
				var currentIndex = allTextInput.index(target)
				allTextInput.eq(currentIndex+1).focus()
				return false
			}
		}
		$(document).on('keypress', this.rowContainer, enterKeyHandler)

		this.$element.trigger('ready',[this])

		var recycleCb = function(){
			self.$element.off()
			$(document).off('click', removeHandler)
			qui.notifyCenter.off('recycle',recycleCb)
		}
		qui.notifyCenter.on('recycle',recycleCb)

		this.load()
	}

	Repeatable.prototype.renderRow = function(data){
		var data = $.extend({}, this.options.defaultData, data || {}) 
		return this.rowTemplate(data)
	}

	Repeatable.prototype.addRow = function(data){
		var html = this.renderRow(data)
		this.rowContainer.append(html)
	}

	Repeatable.prototype.load = function(){
		var self = this
		
		var html = []
		self.options.data = self.options.data || [{}]
		if(self.options.data.length <= 0) self.options.data.push({})

		_.forEach(self.options.data, function(item){
			html.push(self.renderRow(item || {}))
		})
		self.rowContainer.html(html.join(''))
	}

	Repeatable.VERSION  = '1.0.0'

	Repeatable.DEFAULTS = {
		rowClass: '.repeatable_row', // 行样式
		data: null, // 数据列表
		defaultData: {}, // 默认数据
		rowContainer: '.repeatable_rows', // 行容器
		rowTemplate: '#tpl_row_repeatable', // 行模板
		addButton: '.addRepeatableRow', // 添加按钮样式
		removeButton: '.delRepeatableRow', // 删除行按钮样式
	}

	function Plugin() {
		return this.each(function () {
			var $this   = $(this)
			var data    = $this.data('q.repeatable')
			var options = $this.data()

			if (!data) $this.data('q.repeatable', (data = new Repeatable(this, options)))

			return data
		})
	}

	$.fn.rpt = Plugin
	$.fn.rpt.Constructor = Repeatable

	qui.notifyCenter.on('refresh', function () {
		$('[rel=repeatable]').rpt()
	})

})(jQuery, window, document);