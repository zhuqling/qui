// 文件上传
// 依赖：jQuery, Handlebars, UPYun
;(function ($, window, document, undefined) {
	"use strict";

	// singleton system object
	qui = window.qui || {};

	var FileUploader = function (element, options) {
		var self = this
		this.$element  = $(element)
		this.options   = $.extend({}, FileUploader.DEFAULTS, options)

		this.templates = {}
		this.templates.file = Handlebars.compile('<div class="fileinput"><span class="btn btn-xs btn-default btn-file"><span>选择文件</span><input type="hidden" value="{{ value }}" name="{{ name }}"><input type="file" accept="{{ accept }}"></span><span class="fileinput-filename">{{ value }}</span><a href="javascript:void(0)" class="remove" style="float: none">×</a></div>')
		this.templates.fileAdd = Handlebars.compile('<div class="fileinput-add"><span class="add btn btn-xs btn-default glyphicon glyphicon-plus"></span></div>')

		this.templates.image = Handlebars.compile('<div class="fileinput"><div class="thumbnail"><img src="{{thumbnail value }}"/><div class="tool"><span class="zoomin glyphicon glyphicon-zoom-in"></span></div></div><div><span class="btn btn-xs btn-default btn-file">选择图片<input type="hidden" value="{{ value }}" name="{{ name }}"><input type="file" accept="{{ accept }}"></span><span class="remove btn btn-xs btn-warning">清空</span></div></div>')
		this.templates.imageAdd = Handlebars.compile('<div class="fileinput-add"><span class="add btn btn-xs btn-default glyphicon glyphicon-plus"></span></div>')
		
		// 右链菜单
		if(!$('#fuCtxMenu').length){
			$(document.body).append('<div id="fuCtxMenu"><ul class="dropdown-menu" role="menu"><li><a tabindex="-1" href="javascript:void(0)">复制</a></li><li><a tabindex="-1" href="javascript:void(0)">粘贴</a></li></ul></div>')
		}

		// 需定期更新
		this.UPYunConfig = {
			'img-ads':'111',
			'img-base':'222',
			'img-item':'333',
		}
		// 开发测试用
		this.DevUPYunConfig = {
			apiBucket:'img-dev',
			key:'111',
		}

		this.buildlUI()
		this.bindEvent()
	}

	FileUploader.prototype.buildlUI = function(){
		var self = this
		var uploaderClass = this.options.multiple ? (this.options.image ? 'multiple-image-upload' : 'multiple-file-upload') : (this.options.image ? 'single-image-upload' : 'single-file-upload')
		this.$element.addClass(uploaderClass)

		if(this.options.image && !this.options.accept.length) this.options.accept = 'image/jpeg,image/png'

		var values = [this.options.value]
		if(this.options.multiple) values = this.options.value.split('|')

		var tpl = this.options.image ? 'image' : 'file'
		var html = []
		_.forEach(values, function(item){
			html.push(self.templates[tpl]({ name:self.options.name, value:item, accept:self.options.accept }))
		})
		self.$element.append(html.join(''))

		if(this.options.multiple){
			var html = self.templates[(tpl+'Add')]({})
			self.$element.append(html)
		}

		if(this.options.multiple && this.options.sortable){
			this.$element.sortable({
				items: '.fileinput'
			})
			this.$element.disableSelection()
		}

		// 右键菜单
		self.$element.find('.fileinput').contextmenu({ 
			target: '#fuCtxMenu',
			onItem: function(context, e){ self.contextMenu(context, e) }
		})
	}

	FileUploader.prototype.contextMenu = function(context, e) {
		var self = this

		var cmd = $(e.target).text()
		var container = $(context);
		var valueElement = container.find(':hidden')

		switch(cmd){
			case '复制':
				var url = valueElement.val()
				if(url) $(document.body).data('t_imgurl', url)
				break
			case '粘贴':
				if(valueElement.val()){
					if(!confirm('确认要覆盖当前图片吗？覆盖后原图片将无法找回')) return false
				}

				var url = $(document.body).data('t_imgurl')
				if(url){
					valueElement.val(url)
					if(self.options.image) container.find('.thumbnail img').prop('src', url+self.options.thumbnailVersion)
				}
				break
		}
	}

	FileUploader.prototype.bindEvent = function(){
		var self = this
		this.$element.on('click', '.remove', function(){
			// 仅剩下一个的处理
			if(self.$element.find('.fileinput').length <= 1){
				var container = $(this).closest('.fileinput')
				container.find(':hidden').val('')
				container.find('.thumbnail img').prop('src', '')
				container.find('.fileinput-filename').text('')
			} else {
				this.closest('.fileinput').remove()
			}
			return false
		})

		this.$element.on('click', '.zoomin', function(){
			var container = $(this).closest('.fileinput')
			var src = container.find(':hidden').val()
			if(src.length)
				window.open(src)
			else
				alert('未指定图片')
			return false
		})

		this.$element.find('.add').on('click', function(){
			var tpl = self.options.image ? 'image' : 'file'
			var html = self.templates[tpl]({ name:self.options.name, value:'', accept:self.options.accept })
			$(html).insertBefore($(this).parent('.fileinput-add'))

			// 右键菜单
			self.$element.find('.fileinput:last').contextmenu({
				target: '#fuCtxMenu',
				onItem: function(context, e){ self.contextMenu(context, e) }
			})

			return false
		})

		this.$element.on('change', ':file', function(evt){
			var container = $(this).closest('.fileinput')
			var valueElement = container.find(':hidden')
			var fileElement = $(this)

			// 记录正在上传中的数量
			window.fileUploading = window.fileUploading || 0
			window.fileUploading++

			$.each(evt.target.files, function(i, f){
				self.uploadToUPYun(f, function(res){
					window.fileUploading--
					if(window.fileUploading < 0) window.fileUploading = 0

					try {
						res = JSON.parse(res)
						if(res.code != 200){
							alert('上传文件失败，请重试!')
							fileElement.val(null)
							return false
						}

						// console.log(res);

						var apiBucket =  self.DevUPYunConfig.apiBucket
						if(window.env == 'production'){
							apiBucket =  self.options.apiBucket
						}
						var domain = 'http://'+apiBucket+'.b0.upaiyun.com'
						var url =  domain + res.url
						valueElement.val(url) // 隐藏值

						if(self.options.image) container.find('.thumbnail img').prop('src', url+self.options.thumbnailVersion)
					} catch (e){
						alert('上传文件失败，请重试!')
						fileElement.val(null)
					}
				})
			})
		})

		var recycleCb = function(){
			self.$element.off()
			qui.notifyCenter.off('recycle',recycleCb)
		}
		qui.notifyCenter.on('recycle',recycleCb) 
	}

	FileUploader.prototype.uploadToUPYun = function(file, cb) {
		var self = this
		if (!file) {
			console.log('no file is selected')
			return
		}

		if(self.options.dynamicFileName){
			var extName = _.last(file.name.split('.'))
			var seq = uuid.v4() + '.' + extName;
			var fpath = seq;
			if(self.options.dynamicPath){
				fpath = [seq.slice(0,2), seq.slice(2,4), seq.slice(4,6), seq.slice(6,8), seq].join('/')
			}
			var fname = self.options.apiPath + '/' + fpath
		} else {
			var fname = self.options.apiPath + '/' + file.name
		}
		// console.log('fname', fname)

		var apiBucket =  self.DevUPYunConfig.apiBucket
		var key = self.DevUPYunConfig.key
		if(window.env == 'production'){
			apiBucket =  self.options.apiBucket
			key = self.UPYunConfig[apiBucket]
		}
		var options = {
			bucket: apiBucket,
			expiration: Math.floor(new Date().getTime() / 1000) + 86400,
			'save-key': fname
		}
		var policy = window.btoa(JSON.stringify(options))
		var signature = md5(policy + '&' + key)
		var data = new FormData()
		data.append('policy', policy)
		data.append('signature', signature)
		data.append('file', file)
		var req = new XMLHttpRequest()
		req.open('POST', self.options.apiUrl + apiBucket)
		req.onload = function(e) {
			// console.log(req.response)
			cb(req.response)
		};
		req.send(data)
	}

	FileUploader.VERSION  = '1.0.0'

	FileUploader.DEFAULTS = {
		name:'file', // hidden name
		value:'', // 当前值，为多个值时使用|分隔
		multiple:false, // 允许上传多张
		image:true, // 图片类型
		accept:'', // 允许上传文件类型
		sortable:true, // 支持拖拽排序

		apiUrl:'http://v0.api.upyun.com/', // UPYun api endpoint
		apiBucket:'', // UPYun buckets
		apiPath:'', // file path
		dynamicFileName:true, // 自动文件名，不会覆盖以前的文件
		dynamicPath:true, // 自动路径，当开启自动文件名时自动添加拆分路径
		thumbnailVersion:'!200', // 缩略图版本号
	}

	function Plugin() {
		return this.each(function () {
			var $this   = $(this)
			var data    = $this.data('q.fileuploader')
			var options = $this.data()

			if (!data) $this.data('q.fileuploader', (data = new FileUploader(this, options)))

			return $this.data('q.fileuploader')
		})
	}

	$.fn.fup = Plugin
	$.fn.fup.Constructor = FileUploader

	qui.notifyCenter.on('refresh', function () {
		$('div[rel=fileuploader]').fup()
	})

})(jQuery, window, document);