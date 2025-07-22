const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const { id } = event;
  if (!openid || !id) {
    return { success: false, error: '参数不完整' };
  }
  try {
    // 只允许删除自己的自制公式
    const res = await db.collection('customFormulas').where({ _id: id, openid }).remove();
    if (res.stats.removed > 0) {
      return { success: true };
    } else {
      return { success: false, error: '无权限或数据不存在' };
    }
  } catch (e) {
    return { success: false, error: e.message };
  }
}; 