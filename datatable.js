// 网格
// 依赖：jQuery, requireJS, Handlebars
;(function ($, window, document, undefined) {
	"use strict";

	// singleton system object
	qui = window.qui || {};

	var DataTable = function (element, options) {
		var self = this
		this.$element  = $(element)
		this.options   = $.extend({}, DataTable.DEFAULTS, options)
		
		this.page = 1
		this.pages = this.total = 0
		this.data = []

		this.colspan = $('thead th', this.$element).length
		if(this.options.rowContainer) {
			this.rowContainer = $(this.options.rowContainer)
			this.foot = $(this.options.footContainer)
		} else {
			$('<tbody></tbody><tfoot><tr><td colspan="'+this.colspan+'"></td></tr></tfoot>').appendTo(this.$element)
			this.rowContainer = $('tbody', this.$element)
			this.foot = $('tfoot td', this.$element)
		}

		this.pageInfoTemplate = Handlebars.compile('<div class="pull-right"><span>当前第{{ page }}页 共{{ pages }}页 共{{ totals }}条记录</span></div>')

		// 搜索表单
		this.query = { limit: this.options.limit }
		this.queryForm = $('form[rel="datatable-query"][data-bind="'+element.id+'"]')
		this.queryForm.on('submit', function(e){
			e.preventDefault()

			var filter = {};
			$(this).serializeArray().map(function(x){filter[x.name] = x.value}) 
			self.query = $.extend(self.query, filter, { page:1 })
			self.loadData()
		})

		// 分页切换
		this.foot.on('click', 'nav li a', function(e){
			e.preventDefault()
			
			var $this = $(this)
			if(!$this.attr('rel')) return

			var page = parseInt($this.attr('rel'), 10)
			self.query = $.extend(self.query, { page:page })
			self.loadData()
		})

		if(self.options.checkbox){
			if(!this.options.checkAllElement) this.options.checkAllElement = '#chkAll'
			if(!this.options.checkRowElement) this.options.checkRowElement = '.chkRow'
		}
		// 全选复选框
		if(this.options.checkAllElement){
			this.$element.on('change', this.options.checkAllElement, function(){
				self.checkedData = this.checked ? _.clone(self.data) : []
				$(self.options.checkRowElement, self.rowContainer).prop('checked', this.checked)
				self.$element.trigger('checkchange',[self])
			})
		}

		this.$element.trigger('ready',[self])

		if(this.options.initLoad) this.loadData()

		var recycleCb = function(){
			self.$element.off()
			qui.notifyCenter.off('recycle',recycleCb)
		}
		qui.notifyCenter.on('recycle',recycleCb)
	}

	DataTable.VERSION  = '1.0.0'

	DataTable.DEFAULTS = {
		url: '', // 远程 URL
		method: 'get', // 请求类型
		limit: 20, // 默认分页显示数
		initLoad: false, // 初始加载
		rowContainer: null, // 行容器
		footContainer: null, // 分页容器
		template: '', // 行模板
		checkbox: false, // 拥有复选框
		checkAllElement: '', // 全选复选框元素
		checkRowElement: '', // 单行复选框元素
	}

	DataTable.prototype.loadData = function(){
		var self = this

		self.$element.addClass('disabled')

		$.ajax({
			url: this.options.url,
			type: this.options.method,
			data: this.query
		}).done(function(res){
			if(_.isArray(res)){
				self.data = res
				self.totals = res.length
				self.pages = 1
				self.page = 1
			} else {
				self.data = res.result
				self.totals = res.pagination.totals
				self.pages = res.pagination.pages
				self.page = parseInt(res.pagination.page, 10)
			}
			self.checkedData = [] // 选中项
			self.$element.trigger('checkchange',[self])

			self.render()
			self.$element.removeClass('disabled')

			self.$element.trigger('dataready',[self])
		})
	}

	DataTable.prototype.render = function(){
		var self = this
		if(self.data && self.data.length){
			// 支持页面嵌入模板和远程模板文件
			if(_.startsWith(self.options.template, 'hbs.')){
				var url = 'template/' + self.options.template.slice('hbs.'.length)+'.hbs'
				var preloads = [ 'text!'+url ];
				require(preloads, self._render.bind(this))
			}else{
				var tplHtml = $(self.options.template).html()
				self._render.bind(this)(tplHtml)
			}
		} else {
			self._render.bind(this)()
		}
	}

	// 加载模板
	DataTable.prototype._render = function(tplHtml){
		var self = this
		if(self.data && self.data.length){
			self.rowsTemplate = Handlebars.compile(tplHtml)

			var html = self.data.map(function(data, i){
				data.row_index = i+1
				return self.rowsTemplate(data)
			})
			html = html.join('')
			var foot = ['<div class="row">']
			foot.push(self.pageInfoTemplate({totals: self.totals, pages: self.pages, page: self.page}))
			foot.push('<nav class="pull-left"><ul style="margin:0 12px" class="pagination pagination-sm">')

			var cls = '', rel = ''
			var from = Math.max(1, self.page-3),
				to = Math.min(self.pages, self.page+3)
			if(from>1){
				foot.push('<li><a href="javascript:void(0)" rel="1">1</a></li>')
				if(from>2)
					foot.push('<li class="disabled"><a href="javascript:void(0)">...</a></li>')
			}
			for(var i=from;i<=to;i++){
				cls = i==self.page ? 'active' : ''
				rel = i==self.page ? '' : ('rel='+i)
				foot.push('<li class="'+cls+'"><a href="javascript:void(0)" '+rel+'">'+i+'</a></li>')
			}
			if(to<self.pages){
				if(to<self.pages-1)
					foot.push('<li class="disabled"><a href="javascript:void(0)">...</a></li>')
				foot.push('<li><a href="javascript:void(0)" rel="'+self.pages+'">'+self.pages+'</a></li>')
			}

			foot.push('</ul></nav></div>')
		} else {
			if(this.colspan > 0)
				var html = '<tr><td class="well" colspan='+self.colspan+'>没有查找到任何记录</td></tr>'
			else
				var html = '<div class="well">没有查找到任何记录</div>'
			var foot = []
		}
		if(self.options.checkRowElement) self.rowContainer.off('change', self.options.checkRowElement)

		self.rowContainer.html(html)
		self.foot.html(foot.join(''))

		// 复选框事件
		if(self.options.checkRowElement){
			self.rowContainer.on('change', self.options.checkRowElement, function(){
				var idx = $(self.options.checkRowElement, self.rowContainer).index(this)
				var selectedData = self.data[idx]
				if(this.checked)
					self.checkedData.push(selectedData)
				else
					_.pull(self.checkedData, selectedData)

				self.$element.trigger('checkchange',[self])
			})
		}

		// 重新绑定事件
		qui.notifyCenter.trigger('refresh')
	}

	function Plugin(option) {
		return this.each(function () {
			var $this   = $(this)
			var data    = $this.data('q.datatable')
			var options = $(this).data()

			if (!data) $this.data('q.datatable', (data = new DataTable(this, options)))

			if(typeof option === 'string'){
				return data[option]
			}
		})
	}

	$.fn.datatable = Plugin
	$.fn.datatable.Constructor = DataTable

	qui.notifyCenter.on('refresh', function(){
		$('[rel="datatable"]').datatable()
	})
})(jQuery, window, document);