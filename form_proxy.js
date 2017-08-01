// Form proxy
// 依赖：jQuery, Handlebars, jquery.Validate
;(function ($, window, document, undefined) {
	"use strict";

	// singleton system object
	qui = window.qui || {};

	var FormProxy = function (element, options) {
		var self = this
		this.$element  = $(element)
		this.options   = $.extend({}, FormProxy.DEFAULTS, options)

		$('#dialog .error-body').html('').hide()
		this.errorTemplate = Handlebars.compile('<div><span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span> {{msg}}</div>')

		this.$element.submit(function(e){
			e.preventDefault()
			if(!self.$element.valid()) return false

			// 现在上传文件时提交会导致上传文件没法保存到表单
			if(window.fileUploading > 0){
				if(!confirm('您现在上传文件, 现在提交会导致上传结果无法保存, 确认要继续提交吗?')) return false
			}

			$('#dialog .error-body').html('').hide()

			var data = self.$element.serialize()
			if(!data){
				alert('没有数据需要提交')
				return false
			}

			if(self.options.confirm && !confirm(self.options.confirmMessage)) return false

			self.$element.find('.form-group').removeClass('has-error')
			$.ajax({
				url: self.$element.attr('action'),
				type: self.$element.attr('method') || 'post',
				data: data
			}).done(function(res){
				// 提交成功后，将新值保存为原始值
				self.$element.data('originalValue', data)

				if(self.options.callback && self.options.callback.length){
					if(self.options.bind){
						var dt = $('#'+self.options.bind).data('q.datatable')
						dt[self.options.callback]()
					} else if(_.startsWith(self.options.callback, 'javascript:')){
						var code = self.options.callback.slice('javascript:'.length)
						eval(code)
					} else {
						window[self.options.callback]()
					}
				}
				$('#dialog').modal('hide')
			}).error(function(xhr, status, err){
				if(xhr.status == 400){
					if(_.isArray(xhr.responseJSON)){
						var errMsg = []
						_.forEach(xhr.responseJSON, function(obj){
							_.forEach(obj, function(text, key){
								errMsg.push(self.errorTemplate({ msg:text }))
								if(key.length){
									self.$element.find('[name="'+key+'"]').closest('.form-group').addClass('has-error')
								}
							})
						})
						$('#dialog .error-body').html(errMsg.join('')).show()
					} else {
						alert(xhr.responseText)
					}
				}
			})
		})
	}

	FormProxy.VERSION  = '1.0.0'

	FormProxy.DEFAULTS = {
		confirm:false,
		confirmMessage:'您确认要提交吗?',
		bind:null, // 绑定datatable
		callback:null, // 成功回调
	}

	function Plugin(option) {
		return this.each(function () {
			var $this   = $(this)
			var data    = $this.data('q.form')
			var options = $this.data()

			if($this.attr('rel') == 'datatable-query') return

			if (!data) $this.data('q.form', (data = new FormProxy(this, options)))

			return $this.data('q.form')
		})
	}

	$.fn.fp = Plugin
	$.fn.fp.Constructor = FormProxy

	qui.notifyCenter.on('refresh', function () {
		$('form').fp()
	})

})(jQuery, window, document);