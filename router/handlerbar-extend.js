// handlerbars 扩展
!function(handlerbar_extend) {
    if ("object" == typeof exports) module.exports = handlerbar_extend();
    else if ("function" == typeof define && define.amd) define(handlerbar_extend);
    else {
        var b;
        "undefined" != typeof window ? b = window : "undefined" != typeof global ? b = global : "undefined" != typeof self && (b = self), b.handlerbar_extend = handlerbar_extend()
    }
}(function() {
	var editStatusMap = {
		'0': '处理中',
		'1': '审核中',
		'-1': '已撤回',
		'8': '已审核',
	};

	var orderChannelMap = {
		'0': 'App',
		'1': '微信',
		'2': '移动网站',
		'3': 'Web网站',
	};

	var payChannelMap = {
		'alipay': '支付宝',
		'tenpay': '财付通',
		'unionpay': '银联',
	};

	var orderStatusMap = {
		'1': '待付款',
	  '2': '待发货',
	  '3': '待收货',
	  '4': '待评价',

	  '0': '交易成功',
	  '-1': '交易已取消',
	  '-2': '退款完成',

	  '-3': '退款中',
	};

	var packageStatusMap = {
		'1': '已创建',

    '2': '海外仓库待收货',
    '3': '海外仓库待发货',
    '4': '海关中转待收货',
    '5': '海关中转待发货',

    '8': '国内仓库待发货',

    '15': '买家待收货',

    '0': '已完成',
	};

	var packageTypeMap = {
		'0': '正常发货',
		'1': '重发',
	};

	var warehouseDomesticMap = {
		'0': '国际',
	  '1': '国内',
	};

	var sellerKindMap = {
		'0': '买手',
	  '1': '商城',
	};

	var helpers = {
		// 输出JSON
		'json': function(context) {
				return JSON.stringify(context);
		},

		// raw-helper
		'raw-helper': function(options) {
			return options.fn();
		},

		// 格式化金额
		'money': function(context) {
			if(!_.isNumber(context)) return '';
			return context.toFixed(2);
		},

		// 付款渠道
		'pay-channel': function(context) {
			return payChannelMap[context.toString()];
		},

		// 状态显示文本
		'edit-status': function(context) {
			if(!_.isNumber(context)) return '';
			return editStatusMap[context.toString()];
		},

		// 订单来源渠道显示文本
		'order-channel': function(context) {
			if(!_.isNumber(context)) return '';
			return orderChannelMap[context.toString()];
		},

		// 订单状态显示文本
		'order-status': function(context) {
			return orderStatusMap[context.toString()];
		},

		// 包裹状态显示文本
		'package-status': function(context) {
			return packageStatusMap[context.toString()];
		},

		// 包裹类型显示文本
		'package-type': function(context) {
			return packageTypeMap[(context || 0).toString()];
		},

		// 仓库位置
		'wh-location': function(context) {
			return warehouseDomesticMap[context === true ? 1 : 0];
		},

		// 卖家类型 
		'seller-kind': function(context) {
			return sellerKindMap[context.toString()];
		},

		// 地址显示
		// @line int 显示模式， null/0 三行, 1 单行
		'address-format': function(context, inline, options){
			if(!options) {
				options = inline;
				inline = null;
			}

			var sep = ', ';
			var addr = ['<address>'];
			addr.push('<strong>'+context.name+'</strong> ');
			addr.push('<abbr title="电话">Tel:</abbr>'), addr.push(context.phone);
			if(!inline || inline === 0) addr.push('<br>');

			if(context.country){ // 国际
				addr.push(context.country), addr.push(sep), addr.push(context.postcode);
				if(!inline || inline === 0) addr.push('<br>');

				addr.push(context.province), addr.push(sep), addr.push(context.city), addr.push(sep), addr.push(context.zone);
				if(!inline || inline === 0) addr.push('<br>'), 

				addr.push(context.address_line);
			} else { // 国内
				sep = '';
				addr.push(context.province), addr.push(sep), addr.push(context.city), addr.push(sep), addr.push(context.zone);
				addr.push(context.address_line);
				addr.push(' 邮编: '), addr.push(context.postcode);
			}

			addr.push('</address>');
			return new Handlebars.SafeString(addr.join(''));
		},

		// 换行转br
		'nl2br': function(text) {
			var nl2br = (text + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + '<br>' + '$2');
			return new Handlebars.SafeString(nl2br);
		},

		// 缩略图
		'thumbnail': function(url, version) {
			if('string' != typeof version) version = '!100'
			if(url)
				return url + version;
			else
				return url;
		},

		// 提取所有图片URL
		'eachImage': function(context, options){
			var ret = "";

			// 提取图片URL
			var m,
				urls = [],
				rex = /<img[^>]+src="?([^"\s]+)"?\s*\/>/g;

			while(m = rex.exec(context)){
				urls.push(m[1]);
			}

			for(var i=0, j=urls.length; i<j; i++) {
				ret = ret + options.fn(urls[i]);
			}

			return ret;
		},
	};

	return {
		help: function( Handlebars ){
			for( var name in helpers ){
				 Handlebars.registerHelper(name, helpers[name] );
			}
		},
		helpers: helpers,
	};
});