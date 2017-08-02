window.env = 'dev' // or production

// zero clipboard
ZeroClipboard.config( { swfPath: "/bower_components/zeroclipboard/dist/ZeroClipboard.swf" } )

// 扩展page.js,当为dialog时取消显示URL
page.Context.prototype.pushState = function() {
  var qs = queryString.parse(this.querystring)
  if(qs && qs.target == 'dialog') return

  window.qui.notifCenter.trigger('recycle')
  
  hashbang = true
	page.len = page.len || 0

	// 原始代码
  page.len++
  history.pushState(this.state, this.title, hashbang && this.path !== '/' ? '#!' + this.path : this.canonicalPath);
};

// 页面事件管理

// 默认路由处理
page('*', function(ctx){

	var page = window.page || {}
	page.ctx = ctx

	// 导航栏
	var pageLinkText = $('.page-link[href="'+ ctx.path + '"]').text()
	if(pageLinkText){
		$('.breadcrumb .active').text(pageLinkText)
	}

	var requestType = 'txt'
	if(_.startsWith(ctx.pathname, '/server.')){
		requestType = 'srv'
		ctx.pathname = ctx.pathname.slice('/server.'.length)
	} else if(_.startsWith(ctx.pathname, '/hbs.')){
		requestType = 'hbs'
		ctx.pathname = ctx.pathname.slice('/hbs.'.length)
		ctx.pathname = _.trimLeft(ctx.pathname, '/')
	} else {
		ctx.pathname = _.trimLeft(ctx.pathname, '/')
	}
	if(!ctx.pathname.length) ctx.pathname = 'index'

	if(requestType == 'srv'){
		alert('todo... 返回服务器内容')
		return false
	}
	// 加载静态模板
	var qs = queryString.parse(ctx.querystring)
	page.qs = qs

	var tmpl, preloads = []
	if(qs.data){
		requestType = 'hbs'
		// hbs模板+json动态数据
		dataUrl =  decodeURIComponent(qs.data)+'?t='+(new Date()).getTime()
		preloads.push('json!'+dataUrl)
	} else if(qs.json){
		requestType = 'hbs'
	}
	var tplPath = 'template/'+ctx.pathname+'.hbs'
	preloads.push('text!'+tplPath)

	require(preloads, function(data, tpl){
		var html = data
		if(requestType == 'hbs'){
			if(!qs.data){
				var tpl = data
				if(qs.json && qs.json.length){
					data = JSON.parse(qs.json.replace(/({)([a-zA-Z0-9]+)(:)/,'$1"$2"$3'))
				} else 
					data = {}
			}
			html = Handlebars.compile(tpl)(data)
		}
		// 传递data-bind参数
		if(qs.bind){
			var r = new RegExp('data-bind="(.*?)"', 'gm');
			html = html.replace(r, 'data-bind="'+qs.bind+'"')
		}
		if(!qs.target) qs.target = 'body'
		switch(qs.target){
			case 'body':
				$('#body').html(html)
				break
			case 'dialog': // 弹出窗
				$('#dialog').toggleClass('dialog-fluid', !!qs.big)
				$('#dialog').toggleClass('dialog-middle', !!qs.mid)
				$('#dialog .modal-title').text(qs.title || '编辑')
				$('#dialog .dialog-body').html(html)
				$('#dialog').modal('show')
				break
			default:
				$('#'+qs.target).html(html)
				break
		}

		// 重新绑定
		window.qui.notifCenter.trigger('refresh')
	})
});
page({ hashbang:true })

// 通用出错处理
$(document).ajaxError(function( event, request, settings ) {
	switch(request.status){
		case 401: // 需登录
			if(window.confirm(request.responseText)){
				delete window.sessionStorage.user
				delete window.localStorage.user

				window.location.replace('/signin.html');
			}
			return false;
			break
		case 403: // 无权限
			$.growl.warning({ message: request.responseText });
			break;
		case 400:
			// 非表单编辑状态下直接显示错误提示，否则由FormProxy处理
			var dialogShown = ($("#dialog").data('bs.modal') || {}).isShown
			if(!dialogShown) $.growl.error({ message: request.responseText });
			break;
		case 500:
			$.growl.error({ message: request.responseText });
			break;
	}
});

$('#dialog .error-body').html('').hide()

// 未保存退出提示
$(window).on("beforeunload", function() {
	var dialogShown = ($("#dialog").data('bs.modal') || {}).isShown
	if(dialogShown){
		return '您现在有未提交的修改，确认要退出吗?'
	}
})

// 弹出窗退出时，当有修改数据时，需要确认
$('#dialog').on('hide.bs.modal', function (e) {
	var form = $('form', this)
	if(form){
		var originalValue = form.data('originalValue') || ''
		var newValue = form.serialize()
		if(!_.isEqual(originalValue, newValue)){
			if(!confirm('您有未提交的修改，确认要退出吗?')){
				e.preventDefault()
				return false
			}
		}
	}
})
$('#dialog').on('shown.bs.modal', function (e) {
	var form = $('form', this)
	if(form){
		form.data('originalValue', form.serialize())
	}
})

requirejs.config({
		baseUrl: 'lib',
		paths: {
			app: '../app',
			template: '../app/template',
			hbs: 'hbs'
		},
		hbs: { // optional
			helpers: true,            // default: true
			i18n: false,              // default: false
			templateExtension: 'hbs', // default: 'hbs'
			partialsUrl: 'template/partial'           // default: ''
		}
});