// 监听获取用户信息事件
uni.$emitter.on('sys.getUserInfo.to', function() {
	const page = uni.$getCurrentPage();
	if (page.onLogin) {
		page.onLogin();
	} else {
		uni.navigateTo({
			url: '/pages/user/auth'
		});
	}
});
