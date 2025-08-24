const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const { name, subName, formula, description, answerType, imageFileId } = event;
  
  // 基础参数校验
  if (!openid || !name || !subName) {
    return { success: false, error: '参数不完整' };
  }
  
  // 根据答案类型校验
  if (answerType === 'text' && !formula) {
    return { success: false, error: '文本公式不能为空' };
  }
  if (answerType === 'image' && !imageFileId) {
    return { success: false, error: '图片不能为空' };
  }
  
  try {
    // 保存到数据库
    await db.collection('customFormulas').add({
      data: {
        openid,
        name,
        subName,
        formula: answerType === 'text' ? formula : '',
        description: description || '',
        answerType: answerType || 'text',
        imageUrl: imageFileId || '',
        imageFileId: imageFileId || '',
        createTime: Date.now(),
        updateTime: Date.now()
      }
    });
    
    return { success: true };
  } catch (e) {
    console.error('保存到数据库失败:', e);
    
    // 如果数据库保存失败，删除已上传的图片
    if (imageFileId) {
      try {
        await cloud.deleteFile({
          fileList: [imageFileId]
        });
      } catch (deleteError) {
        console.error('删除图片失败:', deleteError);
      }
    }
    
    return { success: false, error: e.message };
  }
}; 