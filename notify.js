// 通知中心
// 依赖：jQuery
;(function($){
	"use strict";
	
	// singleton system object
	qui = window.qui || {};

	// 消息中心 notification center
	qui.notify = function(){
			this.events = {}
			this.userInfoCache = {}

			/*
			# add event observer
			event: event name
			initCall: true/false first init auto trigger event
			*/
			this.on = function(event, initCall, callback){
					if (arguments.length == 2) {
							if (Object.prototype.toString.call(initCall) == "[object Function]") {
									callback = initCall
									initCall = false
							}
					}

					this.events[event] = this.events[event] || []
					this.events[event].push(callback)

					initCall && (this.userInfoCache[event] ? callback(this.userInfoCache[event]) : callback())
			};

			/*
			# fire an event
			event: event name
			userInfo: user data object
			*/
			this.trigger = function(event, userInfo){
					if(userInfo){
						this.userInfoCache[event] = userInfo
					}
					this.events[event] && $.each(this.events[event].slice(), function(i, callback){
							callback(userInfo)
					})
			}

			this.off = function(event, callback){
				var index
				if(callback){
					if((index = this.events[event].indexOf(callback)) !== -1){
						this.events[event].splice(index,1)
						if(!this.events[event].length){
							this.events[event] = null
							delete this.events[event]
						}
					}
				}else{
					this.events[event] = null
					delete this.events[event]
					if(this.userInfoCache[event]){
						this.userInfoCache[event] = null
						delete this.userInfoCache[event]
					}
				}
			}
	}
	qui.notifyCenter = new qui.notify()

})(jQuery);