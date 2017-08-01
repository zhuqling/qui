// 权限控制
// 依赖：jQuery
;(function ($, window, document, undefined) {
	"use strict";

	// singleton system object
	qui = window.qui || {};

	var Grantable = function (element, options) {
		var self = this
		this.$element  = $(element)
		this.options   = (options || '').split('|')

		this.toggle()
	}

	Grantable.prototype.checkAvailable = function(){
		var user = JSON.parse(window.sessionStorage.user || window.localStorage.user)
		if(!user || !user.role) return false

		if(user.role.id === '1') return true
		if(!user.role.permissions) return false
		var exist = _.intersection(user.role.permissions, this.options)
		return exist.length > 0
	}

	Grantable.prototype.toggle = function(){
		var visable = this.checkAvailable()
		this.$element.toggle(visable)
	}

	Grantable.VERSION  = '1.0.0'

	function Plugin() {
		return this.each(function () {
			var $this   = $(this)
			var data    = $this.data('q.grantable')
			var options = $this.data('grant')

			if (!data) $this.data('q.grantable', (data = new Grantable(this, options)))

			return $this.data('q.grantable')
		})
	}

	$.fn.grant = Plugin
	$.fn.grant.Constructor = Grantable

	qui.notifyCenter.on('refresh', function () {
		$('[data-grant]').grant()
	})

})(jQuery, window, document);