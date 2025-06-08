const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = db.command;

// 同步用户数据到云端
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openId = wxContext.OPENID;
  
  try {
    const { userData, action = 'sync' } = event;
    
    if (!openId) {
      return {
        success: false,
        error: '用户身份验证失败'
      };
    }

    // 数据验证
    if (action === 'sync' && !userData) {
      return {
        success: false,
        error: '同步数据不能为空'
      };
    }

    const userDataCollection = db.collection('userData');
    const now = new Date();

    switch (action) {
      case 'sync':
        // 同步数据到云端
        const syncData = {
          openId,
          studyProgress: userData.studyProgress || {},
          studyDays: userData.studyDays || 1,
          lastStudyDate: userData.lastStudyDate || now.toISOString().split('T')[0],
          favoriteIds: userData.favoriteIds || [],
          totalProgress: userData.totalProgress || 0,
          lastSyncTime: now,
          version: userData.version || 1
        };

        // 尝试更新，如果不存在则创建
        const updateResult = await userDataCollection.where({
          openId
        }).update({
          data: syncData
        });

        if (updateResult.stats.updated === 0) {
          // 记录不存在，创建新记录
          await userDataCollection.add({
            data: {
              ...syncData,
              createTime: now
            }
          });
        }

        return {
          success: true,
          message: '数据同步成功',
          syncTime: now
        };

      case 'get':
        // 获取云端数据
        const getUserResult = await userDataCollection.where({
          openId
        }).get();

        if (getUserResult.data.length === 0) {
          return {
            success: true,
            userData: null,
            message: '云端暂无数据'
          };
        }

        return {
          success: true,
          userData: getUserResult.data[0],
          message: '获取云端数据成功'
        };

      case 'merge':
        // 智能合并本地和云端数据
        const getCloudResult = await userDataCollection.where({
          openId
        }).get();

        if (getCloudResult.data.length === 0) {
          // 云端无数据，直接上传本地数据
          await userDataCollection.add({
            data: {
              openId,
              ...userData,
              createTime: now,
              lastSyncTime: now,
              version: 1
            }
          });
          
          return {
            success: true,
            userData: userData,
            message: '首次同步完成'
          };
        }

        const cloudData = getCloudResult.data[0];
        const mergedData = mergeUserData(userData, cloudData);
        
        // 更新合并后的数据
        await userDataCollection.where({
          openId
        }).update({
          data: {
            ...mergedData,
            lastSyncTime: now,
            version: (cloudData.version || 0) + 1
          }
        });

        return {
          success: true,
          userData: mergedData,
          message: '数据合并完成'
        };

      default:
        return {
          success: false,
          error: '无效的操作类型'
        };
    }

  } catch (error) {
    console.error('同步数据失败:', error);
    return {
      success: false,
      error: error.message || '同步失败，请稍后重试'
    };
  }
};

// 智能合并用户数据
function mergeUserData(localData, cloudData) {
  // 学习进度合并：取并集
  const mergedProgress = {};
  const localProgress = localData.studyProgress || {};
  const cloudProgress = cloudData.studyProgress || {};
  console.log('localProgress:', localProgress);
  console.log('cloudProgress:', cloudProgress);
  
  // 合并所有科目的学习进度
  const allSubjects = new Set([
    ...Object.keys(localProgress),
    ...Object.keys(cloudProgress)
  ]);
  
  allSubjects.forEach(subject => {
    const localSubjectData = localProgress[subject] || {};
    const cloudSubjectData = cloudProgress[subject] || {};
    
    mergedProgress[subject] = {};
    const allChapters = new Set([
      ...Object.keys(localSubjectData),
      ...Object.keys(cloudSubjectData)
    ]);
    
    allChapters.forEach(chapter => {
      const localIds = localSubjectData[chapter] || [];
      const cloudIds = cloudSubjectData[chapter] || [];
      // 取并集
      mergedProgress[subject][chapter] = [...new Set([...localIds, ...cloudIds])];
    });
  });

  // 收藏列表合并：取并集
  const localFavorites = localData.favoriteIds || [];
  const cloudFavorites = cloudData.favoriteIds || [];
  const mergedFavorites = [...new Set([...localFavorites, ...cloudFavorites])];

  // 学习天数：取最大值
  console.log('2222' ,localData.studyDays , cloudData.studyDays)
  const mergedStudyDays = Math.max(
    localData.studyDays || 0,
    cloudData.studyDays || 0
  );

  // 最后学习日期：取最新的
  const localDate = new Date(localData.lastStudyDate || 0);
  const cloudDate = new Date(cloudData.lastStudyDate || 0);
  const mergedLastStudyDate = localDate > cloudDate ? 
    localData.lastStudyDate : cloudData.lastStudyDate;

  return {
    studyProgress: mergedProgress,
    studyDays: mergedStudyDays,
    lastStudyDate: mergedLastStudyDate,
    favoriteIds: mergedFavorites,
    totalProgress: calculateTotalProgress(mergedProgress)
  };
}

// 计算总进度
function calculateTotalProgress(studyProgress) {
  const allIds = new Set();
  Object.values(studyProgress).forEach(subject => {
    Object.values(subject).forEach(ids => {
      if (Array.isArray(ids)) {
        ids.forEach(id => allIds.add(id));
      }
    });
  });
  return Math.floor((allIds.size / 112) * 100); // 假设总共112个公式
} 