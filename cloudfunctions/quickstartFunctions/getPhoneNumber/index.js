const cloud = require("wx-server-sdk");

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

// 获取用户手机号
exports.main = async (event, context) => {
  const resp = await openapi.phonenumber.getPhoneNumber({
		code: event.code
	});
  return resp
};
