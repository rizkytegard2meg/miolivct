import $ from "../../../bootstrap/$";

/**
 * 是否登录中...
 * @type {Promise}
 */
let loginPromise = null;

/**
 * 最后登录时间
 * @type {number}
 */
let lastTime = 0;

/**
 * 最后登录失败原因
 * @type {*}
 */
let lastError = null;

export default function(options) {
	// 如果请求时间小于登录时间周期，则直接复用最近一次登录结果
	if (options.requestTime < lastTime) {
		// 如果存在失败原因，则认为失败结果
		if (lastError) {
			return Promise.reject(lastError);
		}

		return Promise.resolve();
	}


	if (!loginPromise) {
		$.showNavigationBarLoading();
		loginPromise = $.$http.defaults.login(options).then((res) => {
			$.hideLoading();
			$.hideNavigationBarLoading();

			const app = getApp();
			const globalData = app.globalData;
			globalData.userInfo = res.data;
			globalData.sessionId = res.session_id;

			$.setStorageSync('userInfo', globalData.userInfo);
			$.setStorageSync('session_id', globalData.sessionId);

			complete();

			return options;
		}, (err) => {
			$.hideLoading();
			$.hideNavigationBarLoading();

			if (err.isAuthDeny) {
				$.$hintError(
					$.$http.defaults.authFailedMsg || "请先授权后再重试~"
				)
			} else {
				const data = err.data;
				const errMsg = err.errMsg || $.$http.defaults.loginFailedMsg;
				if (data && data.tips_type === 'alert') {
					$.showModal({ content: errMsg, showCancel: false });
				} else {
					$.$hintError(errMsg);
				}
			}

			// #ifdef MP-WEIXIN
			wx.getLogManager().warn('user login fail', err);
			// #endif

			complete(err);
			return Promise.reject(err);
		});
	}

	return loginPromise.then(function() {
		return options;
	}, function(err) {
		err.config = options;
		return Promise.reject(err);
	});
}

// 登录完成
function complete(err) {
	lastError = err;
	lastTime = Math.floor(new Date().getTime() / 1000);

	setTimeout(function() {
		loginPromise = null;
	}, 100);
}
