const getOpenId = require('./getOpenId/index');
const syncUserData = require('./syncUserData/index');
const saveCustomFormula = require('./saveCustomFormula/index');

// 云函数入口函数
exports.main = async (event, context) => {
  switch (event.type) {
    case 'getOpenId':
      return await getOpenId.main(event, context);
    case 'syncUserData':
      return await syncUserData.main(event, context);
    case 'saveCustomFormula':
      return await saveCustomFormula.main(event, context);
    default:
      return {
        success: false,
        error: '未知的功能类型'
      };
  }
};