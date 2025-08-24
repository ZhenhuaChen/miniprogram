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
    // 先查询要删除的记录，获取图片信息
    const queryResult = await db.collection('customFormulas').where({ _id: id, openid }).get();
    
    if (queryResult.data.length === 0) {
      return { success: false, error: '无权限或数据不存在' };
    }
    
    const formula = queryResult.data[0];
    
    // 删除数据库记录
    const deleteResult = await db.collection('customFormulas').where({ _id: id, openid }).remove();
    
    if (deleteResult.stats.removed > 0) {
      // 如果有关联的图片，删除云存储中的图片
      if (formula.imageFileId) {
        try {
          await cloud.deleteFile({
            fileList: [formula.imageFileId]
          });
          console.log('图片删除成功:', formula.imageFileId);
        } catch (deleteFileError) {
          console.error('删除图片失败:', deleteFileError);
          // 图片删除失败不影响整体操作，只记录日志
        }
      }
      
      return { success: true };
    } else {
      return { success: false, error: '删除失败' };
    }
  } catch (e) {
    console.error('删除公式失败:', e);
    return { success: false, error: e.message };
  }
}; 