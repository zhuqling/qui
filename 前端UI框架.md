# 前端UI框架

## 文件组织结构

- client/ 前端代码
	- bower_components/ 依赖库
	- index.html 默认页
	- signin.html 登录
	- menus.js 系统菜单功能项定义sys_menus
	- app.js APP配置与路由管理脚本
	- app.css 样式扩展
	- app/
		- template/ 模板，使用handlerbars模板
		- main.js 系统扩展脚本，包括：handlerbars扩展

## 依赖库：
- jquery
- jquery ui(sortable)
- jquery validate
- bootstrap
- requirejs + (text, json)
- lodash
- handlerbars
- uuid
- md5
- zeroclipboard
- query-string

## 配置

### 位于app.js文件，配置项：

- window.env 系统运行环境，dev （开发测试） / production （生产环境），环境设置影响到系统的功能，一定要设置正确
- ZeroClipboard.config( { swfPath: "/bower_components/zeroclipboard/dist/ZeroClipboard.swf" } ) zero clipboard的flash文件所在位置，刚合并JS文件需重新设置

### 位于qui.js文件

- 配置云存储的ftp key

### 当前登录用户

```javascript
var user = window.sessionStorage.user || window.localStorage.user;
if(user) user = JSON.parse(user);
```

## 与服务器的数据交互规则

- 通过状态码识别成功与失败，默认错误类型经封装全部自动处理了
- 200 成功
- 400 提交数据有误，当为提交表单时失败，会在表单上显示出错信息
- 401 未登录或登录已经过期，需重新登录
- 403 用户没有当前功能的访问权限

## 路由

- 基于PageJS的路由系统
- 拦截所有链接，自动判断模式加载相应模板，并支持加载动态数据并应用到模板

### 模板规则

1. /server.any_url/... 加载服务器内容，暂时未实现
2. /hbs.any_url/  加载handlebars静态模板
3. /any_url  加载html静态模板
    - 当链接的query string包括json/data参数时，自动识别为handlerbars模板

### querystring参数

- data 服务器数据URL，应返回json数据
- json 当无需调用服务器接口，只传递静态json数据时使用，格式：json={"x":"y"},应注意"在链接里的处理(使用&quot;代替)

- target 内容呈现的位置，不填时为body
    - body 主体内容区域
    - dialog 弹出窗
    - 任何元素ID
- title 弹出窗的标题, 仅当target=dialog有效

- bind 替换模板内的data-bind参数为指定值，可用于共用的弹出窗内表单提交成功后的不同数据网格刷新
- big=true 最大化弹出窗
- mid=true 中等大小弹出窗

### window.page对象

保存当前页面的路由信息

- ctx PageJS的Context对象
- qs 经过解析后query string对象, 除了使用data/json参数传递参数外，也可通过qs传递参数，参照categories类目页的进入二级分类的相关代码

## 组件

源代码: /lib/qui.js
组件参数使用元素的data-xxx属性传递

### 数据网格 datatable

- 绑定方法：`rel=datatable`，未限制只使用在table元素上
- url: '', // 远程 URL
- method: 'get', // 请求类型
- limit: 20, // 默认分页显示数
- initLoad: false, // 初始加载
- rowContainer: null, // 行容器，当为table时，无需指定此参数
- footContainer: null, // 分页容器，当为table时，无需指定此参数
- template: '', // 行模板, 支持页面嵌入静态模板和远程模板, 静态模板直接指定元素选择器，远程模板规则：hbs.template_path/partials/xyz
- checkbox: false, // 拥有复选框
- checkAllElement: '', // 全选复选框元素，默认'#chkAll'
- checkRowElement: '', // 单行复选框元素, 默认'.chkRow'
- onready:function(){}, // 初始完成回调, 可传递函数名，在函数内部this代表datatable
- onDataReady:function(){}, // 数据加载完成回调, string/function, 可传递函数名，在函数内部this代表datatable
- onCheckChange:function(){}, // 复选框切换，通过checkedData访问已选中数据

- 需要动态修改URL再加载数据，需要在onready回调函数内指定url，再调用loadData方法

搜索表单的自动关联
- form添加rel="datatable-query" data-bind="数据网格元素ID"

### 表单代理 FormProxy

- 绑定方法：所有form自动绑定，除了已关联数据网格的form
- 表单内无提交内容时会弹出提示不允许提交
- 需要取消绑定，只需在form上添加样式class="NoProxy"

- confirm:false, // 是否需要确认
- confirmMessage:'您确认要提交吗?', // 确认显示文本
- bind:null, // 绑定datatable
- callback:null, // 成功回调函数名
    - 当设置了bind时，用于刷新网格，执行datatable的指定方法
    - 当以javascript:开头时，用于执行后面的JS代码
    - 其它情况时，用于调用指定函数
    - 回调函数参数(response, formData)

### 下拉框 SelectBox

- 绑定方法：`<select rel=selectbox>`
- url: null, // 远程URL
- valueField: 'id', // 值属性名 
- textField: 'name', // 文本属性名
- allowEmpty: false, // 可空选
- defaultValue: null // 默认值
- onDataReady:function(){}, // 数据加载完成回调, string/function, 可传递函数名，在函数内部this代表SelectBox

### 弹出气泡 Popover

- 绑定方法：`rel=popover`
- triggerMethod: 'click', // 触发方式，click | hover | focus
- placement: 'auto', // 放置位置，top | bottom | left | right | auto
- title: '标题', // 标题
- content: '', // 静态内容
- url: null, // 远程URL
- urlTemplate: null, // 动态内容模板，当仅有url无urlTemplate时代表远程直接返回html而非json数据

### 文件上传 FileUploader

- 绑定方法：`div rel=fileuploader`
- name:'file', // hidden元素的name
- value:'', // 当前值，为多个值时使用|分隔
- multiple:false, // 允许上传多张
- image:true, // 图片类型/普通文件类型
- accept:'', // 允许上传文件类型，当为图片时默认只允许上传jpg/png类型
- sortable:true, // 支持拖拽排序，仅当multiple=true时

- apiUrl:'http://v0.api.upyun.com/', // UPYun api endpoint
- apiBucket:'', // UPYun 空间
- apiPath:'', // 文件夹路径，如: /a/b
- fileName:'', // 指定文件名，没有后缀名时使用上传的文件后缀名, 需dynamicFileName=false才生效, 如：'icon', 'icon.png', ''
- dynamicFileName:true, // 自动文件名(使用uuid算法)，不会覆盖以前的文件
- dynamicPath:true, // 自动路径，当开启自动文件名时自动添加拆分路径
- thumbnailVersion:'!200', // 缩略图版本号
- contextMenu:true, // 启用右键复制菜单
- maxFileSize:null, // 最大文件Size, 单位M

- callback: '', // 上传完成回调, 可以为函数名或javascript:xxx代码

#### 云存储设置

- FileUploader.UPYunConfig, 生产环境下的空间及ftp key
- FileUploader.DevUPYunConfig, 开发测试用空间及ftp Key

### 动态增减 Repeatable

- 适用场景：输入元素可动态增加、减少
- 绑定方法：`rel=repeatable`
- rowClass: '.repeatable_row', // 行样式
- data: null, // 数据列表
- defaultData: {}, // 默认数据，最终的数据为合并defaultData/data的结果
- rowContainer: '.repeatable_rows', // 行容器
- rowTemplate: '#tpl_row_repeatable', // 行模板
- addButton: '.addRepeatableRow', // 添加按钮样式
- removeButton: '.delRepeatableRow', // 删除行按钮样式
- onready:function(){}, // 初始完成回调, string/function

- 可以默认传递data参数创建组件，可也可以在onready回调函数内，通过代码指定data后，调用load方法填充数据

### 权限控制 Grantable

- 绑定方法：`data-grant="xxx|xxx"`
- 属性值为权限代码，当有多个权限代码时使用|进行分隔
- 通常使用在a/button/form上

### 图片下载

- 绑定方法：`<img rel=downloadable/>`
- 自动添加下载、复制图片URL按钮
- 下载仅支持chrome/firefox浏览器，使用了html5的download特性
- 复制到剪贴板使用了zero clipboard

### 条形码

- 绑定方法：`<img rel=barcode/>`
- codeType: 'code128', // 条形类型
- text: '', // 条码内容
- height: null, // 高度, 默认：4，最小允许设置为2，小于2时会无法正确显示
- width: null, // 宽度, 默认：1
- rotate: 'N', // 条码方向 N 向上（默认）/ R向右 /L向左 /I向下
- scale: '2', // 缩放，默认：2, 指定不同X,Y值时，使用：1,2

### window.qui.notifCenter 的 refresh 事件

用于当动态加载完成时，执行相应的操作，如对新页面中的组件进行绑定

