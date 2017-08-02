// 菜单
// 层级一：菜单组
// 层级二：页面
// 层级三：功能项
var sys_menus = [
	{
		menu: { code: 'users', name: '用户' },
		views: 
		[
			{ 
				code: 'role', 
				name: '角色',
				url: '/roles',
				items: [
					{ code: 'role_edit', name: '编辑' },
					{ code: 'role_grant', name: '授权' },
				]
			},
			{ 
				code: 'user', 
				name: '用户',
				url: '/users',
				items: [
					{ code: 'user_edit', name: '编辑' },
					{ code: 'user_alter_password', name: '修改密码' },
					{ code: 'user_alter_email', name: '修改邮箱' },
					{ code: 'user_lock', name: '锁定' },
				]
			},
		] 
	},
	{
		menu: { code: 'sys', name: '系统' },
		views: 
		[
			{
				code: 'category',
				name: '品类',
				url: '/categories',
				items: [
					{ code: 'category_edit', name: '编辑' },
				]
			},
			{
				code: 'brand',
				name: '品牌',
				url: '/brands',
				items: [
					{ code: 'brand_edit', name: '编辑' },
				]
			},
			{
				code: 'system',
				name: '控制面板',
				url: '/sys_control',
				items: [
					{ code: 'sys_sync', name: '同步数据' },
					{ code: 'sys_force_sync', name: '强制同步所有' },
					{ code: 'sys_update_app', name: '升级APP版本' },
					{ code: 'sys_reindex', name: '重建搜索索引' },
				]
			},
			{
				code: 'notify_send',
				name: '推广',
				url: '/notify',
				items: [
				],
			},
		] 
	},
	{
		menu: { code: 'seller', name: '卖家' },
		views: 
		[
			{
				code: 'seller_request_view',
				name: '卖家审核',
				url: '/sellers/request',
				items: [
					{ code: 'seller_edit', name: '生成卖家' },
					{ code: 'seller_request_refuse', name: '拒绝' },
				]
			},
			{
				code: 'seller',
				name: '在线卖家',
				url: '/sellers',
				items: [
					{ code: 'seller_delete', name: '删除' },
				]
			},
		] 
	},
];