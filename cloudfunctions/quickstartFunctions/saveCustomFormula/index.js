const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const { name, subName, formula, description } = event;
  if (!openid || !name || !subName || !formula) {
    return { success: false, error: '参数不完整' };
  }
  try {
    await db.collection('customFormulas').add({
      data: {
        openid,
        name,
        subName,
        formula,
        description,
        createTime: Date.now()
      }
    });
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}; 