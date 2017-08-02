# QUI 灵活的JS控件

- 组件参数使用元素的data-xxx属性传递

## 依赖库

- jquery（强依赖）
- jquery ui(sortable)
- jquery validate(用于表单验证)
- bootstrap(非强制)
- requirejs + (text, json)
- lodash
- handlerbars（模板）
- uuid(非强制)
- md5(非强制)
- zeroclipboard
- query-string(用于路由)

## Notify 通知中心

`window.qui.notifyCenter` 应用全局通知中心

`var notify = new qui.notify()` 创建通知中心

事件订阅与触发

```javascript
notify.on('event1', (data)=>{})
notify.trigger('event1', data)
notify.off('event1')
```

### window.qui.notifyCenter 的 refresh 事件

用于当动态加载完成时，执行相应的操作，如对新页面中的组件进行重新绑定事件

所有控制都依赖notifyCenter，并自动绑定了refresh事件，自动重绘控制

## Datatable 数据网格

依赖：requireJS

绑定方法：`rel=datatable`，未限制只使用在table元素上

参数：

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

### 搜索表单的自动关联

- form添加rel="datatable-query" data-bind="数据网格元素ID"


例子：

```html
<form class="form-inline" action="/freights" method="GET" rel="datatable-query" data-bind="tableFreights" >
</form>

<div class="btn-toolbar" role="toolbar">
    <a data-grant="freight_edit" class="btn btn-default" href="hbs.freights/edit?target=dialog"><span class="glyphicon glyphicon-plus"></span>新增</a>
</div>

<table id="tableFreights" class="table" rel="datatable" data-url="/freights" data-init-load="true" data-template="#row-tpl">
    <thead>
        <tr>
            <th style="width:400px;max-width:400px">发往地区</th>
            <th>首重</th>
            <th>费用</th>
            <th>续重</th>
            <th>费用</th>
            <th style="width:32px"></th>
            <th style="width:32px"></th>
        </tr>
    </thead>
</table>

<script id="row-tpl" type="text/x-handlebars-template">
<tr>
    <td>{{#equal areas 0}}全国{{else}}{{ areas }}{{/equal}}</td>
    <td>{{ firstLevel.weight }} kg</td>
    <td>￥{{money firstLevel.cost }}</td>
    <td>{{ extra.weight }} kg</td>
    <td>￥{{money extra.cost }}</td>
    <td><a class="btn btn-default" data-grant="freight_edit" href="freights/edit?data=/freights/{{ _id }}&target=dialog&title=编辑">编辑</a></td>
    <td>
        <form data-grant="freight_delete" style="display:inline-block;" action="/freights/{{ _id }}" method="DELETE" data-bind="tableFreights" data-callback="loadData" data-confirm="true" data-confirm-message="确认要删除该运费设置吗？"><input type="hidden" name="ids" value="{{ _id }}"/><button class="btn btn-danger">删除</button></form>
    </td>
</tr>
</script>
```

## Repeatable 重复栏目

适用场景：输入元素可动态增加、减少

绑定方法：`rel=repeatable`

参数：

- rowClass: '.repeatable_row', // 行样式
- data: null, // 数据列表
- defaultData: {}, // 默认数据，最终的数据为合并defaultData/data的结果
- rowContainer: '.repeatable_rows', // 行容器
- rowTemplate: '#tpl_row_repeatable', // 行模板
- addButton: '.addRepeatableRow', // 添加按钮样式
- removeButton: '.delRepeatableRow', // 删除行按钮样式
- onready:function(){}, // 初始完成回调, string/function

- 可以默认传递data参数创建组件，可也可以在onready回调函数内，通过代码指定data后，调用load方法填充数据

例子：

```
<div class="form-group">
    <label for="" class="col-sm-2 control-label">货品属性</label>
    <div class="col-sm-5">
      <table id="colors" class="table table-condensed" rel="repeatable" data-row-container="#color_rows" data-row-template="#tpl_color_row" data-add-button="#add_color" data-remove-button=".del_color" data-row-class=".repeatable_color_row">
        <thead>
          <tr>
            <th>颜色</th>
            <th style="width:32px;"></th>
          </tr>
        </thead>
        <tbody id="color_rows"></tbody>
        <tfoot>
          <tr>
            <td colspan="2">
              <button id="add_color" class="btn btn-xs btn-default" type="button">增加</button>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
    <div class="col-sm-5">
      <table id="sizes" class="table table-condensed" rel="repeatable" data-row-container="#size_rows" data-row-template="#tpl_size_row" data-add-button="#add_size" data-remove-button=".del_size" data-row-class=".repeatable_size_row">
        <thead>
          <tr>
            <th>尺码</th>
            <th style="width:32px;"></th>
          </tr>
        </thead>
        <tbody id="size_rows"></tbody>
        <tfoot>
          <tr>
            <td colspan="2">
              <button id="add_size" class="btn btn-xs btn-default" type="button">增加</button>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
</div>
```

## SelectBox 下拉框

绑定方法：`<select rel=selectbox>`

参数：

- url: null, // 远程URL
- valueField: 'id', // 值属性名 
- textField: 'name', // 文本属性名
- allowEmpty: false, // 可空选
- defaultValue: null // 默认值
- onDataReady:function(){}, // 数据加载完成回调, string/function, 可传递函数名，在函数内部this代表SelectBox

例子：

```html
<div class="form-group">
    <label for="userId" class="col-sm-2 control-label">用户</label>
    <div class="col-sm-10">
      <select class="form-control" name="userId" rel="selectbox" data-url="/api/users" data-text-field="name" data-value-field="id" data-default-value="{{ userId }}"></select>
    </div>
</div>
```

## Form Proxy 表格代理

依赖：jquery.validate

绑定方法：所有form自动绑定，除了已关联数据网格的form

行为：

- 表单内无提交内容时会弹出提示不允许提交
- 需要取消绑定，只需在form上添加样式class="NoProxy"

参数：

- confirm:false, // 是否需要确认
- confirmMessage:'您确认要提交吗?', // 确认显示文本
- bind:null, // 绑定datatable
- callback:null, // 成功回调函数名
    - 当设置了bind时，用于刷新网格，执行datatable的指定方法
    - 当以javascript:开头时，用于执行后面的JS代码
    - 其它情况时，用于调用指定函数
    - 回调函数参数(response, formData)

例子：

```
<form action="/kefus" method="POST" autocomplete="off" class="form-horizontal" data-bind="tableKefus" data-callback="loadData">
  <input type="hidden" name="id" value="{{ _id }}"/>
  <div class="modal-footer">
    <button type="button" class="btn btn-default" data-dismiss="modal">取消</button>
    <button type="submit" class="btn btn-primary">确定</button>
  </div>
</form>
```

```
<form data-grant="freight_delete" style="display:inline-block;" action="/freights/{{ _id }}" method="DELETE" data-bind="tableFreights" data-callback="loadData" data-confirm="true" data-confirm-message="确认要删除该运费设置吗？"><input type="hidden" name="ids" value="{{ _id }}"/><button class="btn btn-danger">删除</button></form>
```

## File Uploader 文件上传

依赖：upyun

绑定方法：`div rel=fileuploader`

参数：

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

### 云存储设置

- FileUploader.UPYunConfig, 生产环境下的空间及ftp key
- FileUploader.DevUPYunConfig, 开发测试用空间及ftp Key

例子：

```
<div class="form-group">
    <label for="imgs" class="col-sm-2 control-label text-primary">图片</label>
    <div class="col-sm-10">
      <div rel="fileuploader" data-name="imgs" data-multiple="true" data-value="{{#if imgs}}{{join imgs '|' }}{{else}}{{/if}}" data-api-bucket="snt-img-item" data-api-path="/main/{{seller-id}}"></div>
    </div>
</div>
```

## Image Downloader 图片下载

依赖：ZeroClipboard

绑定方法：`<img rel=downloadable/>`

- 自动添加下载、复制图片URL按钮
- 下载仅支持chrome/firefox浏览器，使用了html5的download特性
- 复制到剪贴板使用了zero clipboard

## 弹出气泡 Popover

绑定方法：`rel=popover`

参数：

- triggerMethod: 'click', // 触发方式，click | hover | focus
- placement: 'auto', // 放置位置，top | bottom | left | right | auto
- title: '标题', // 标题
- content: '', // 静态内容
- url: null, // 远程URL
- urlTemplate: null, // 动态内容模板，当仅有url无urlTemplate时代表远程直接返回html而非json数据

例子：

```
<a class="btn btn-xs btn-default" role="button" rel="popover" title="包裹进度" data-url="/api/packages/{{this}}/progress" data-url-template="orders/partials/progress"><span class="glyphicon glyphicon-tasks"></span></a>
```

## Grantable 权限控制

绑定方法：`data-grant="xxx|xxx"`

- 属性值为权限代码，当有多个权限代码时使用|进行分隔
- 通常使用在a/button/form上

例子：

```
<a data-grant="freight_edit" class="btn btn-default" href="hbs.freights/edit?target=dialog"><span class="glyphicon glyphicon-plus"></span>新增</a>
```

## Barcode 条形码

依赖：bwip.js

绑定方法：`<img rel=barcode/>`

参数：

- codeType: 'code128', // 条形类型
- text: '', // 条码内容
- height: null, // 高度, 默认：4，最小允许设置为2，小于2时会无法正确显示
- width: null, // 宽度, 默认：1
- rotate: 'N', // 条码方向 N 向上（默认）/ R向右 /L向左 /I向下
- scale: '2', // 缩放，默认：2, 指定不同X,Y值时，使用：1,2


