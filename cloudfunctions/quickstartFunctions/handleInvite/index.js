const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const { action, inviteCode, inviterOpenId, invitedOpenId } = event;
  
  try {
    switch (action) {
      case 'register':
        return await handleInviteRegister(inviteCode, invitedOpenId);
      case 'reward':
        return await handleInviteReward(inviterOpenId, invitedOpenId);
      case 'rewardImmediate':
        return await handleImmediateReward(inviteCode);
      case 'getStats':
        return await getInviteStats(inviterOpenId);
      default:
        return { success: false, message: '未知的操作类型' };
    }
  } catch (error) {
    console.error('邀请处理失败:', error);
    return { success: false, message: '服务器错误', error: error.message };
  }
};

// 处理邀请注册
async function handleInviteRegister(inviteCode, invitedOpenId) {
  try {
    // 查找邀请者
    const inviterQuery = await db.collection('inviteCodes').where({
      inviteCode: inviteCode
    }).get();
    
    if (inviterQuery.data.length === 0) {
      return { success: false, message: '邀请码不存在' };
    }
    
    const inviter = inviterQuery.data[0];
    
    // 检查被邀请者是否已经注册过
    const existingInvite = await db.collection('inviteRecords').where({
      invitedOpenId: invitedOpenId
    }).get();
    
    if (existingInvite.data.length > 0) {
      return { success: false, message: '您已经使用过邀请码了' };
    }
    
    // 不能邀请自己
    if (inviter.openId === invitedOpenId) {
      return { success: false, message: '不能使用自己的邀请码' };
    }
    
    // 创建邀请记录
    await db.collection('inviteRecords').add({
      data: {
        inviterOpenId: inviter.openId,
        invitedOpenId: invitedOpenId,
        inviteCode: inviteCode,
        registerTime: new Date(),
        rewardGiven: false,
        status: 'registered'
      }
    });
    
    return { 
      success: true, 
      message: '邀请码使用成功！',
      inviterOpenId: inviter.openId 
    };
  } catch (error) {
    console.error('处理邀请注册失败:', error);
    return { success: false, message: '邀请注册失败' };
  }
}

// 处理邀请奖励
async function handleInviteReward(inviterOpenId, invitedOpenId) {
  try {
    // 查找邀请记录
    const recordQuery = await db.collection('inviteRecords').where({
      inviterOpenId: inviterOpenId,
      invitedOpenId: invitedOpenId,
      rewardGiven: false
    }).get();
    
    if (recordQuery.data.length === 0) {
      return { success: false, message: '邀请记录不存在或已发放奖励' };
    }
    
    const record = recordQuery.data[0];
    
    // 更新奖励状态
    await db.collection('inviteRecords').doc(record._id).update({
      data: {
        rewardGiven: true,
        rewardTime: new Date(),
        status: 'rewarded'
      }
    });
    
    // 更新邀请者统计
    const inviteStatsQuery = await db.collection('inviteStats').where({
      openId: inviterOpenId
    }).get();
    
    if (inviteStatsQuery.data.length === 0) {
      // 创建邀请统计
      await db.collection('inviteStats').add({
        data: {
          openId: inviterOpenId,
          totalInvites: 1,
          successfulInvites: 1,
          totalRewards: 70, // 邀请奖励50 + 新用户完成首次学习奖励20
          lastInviteTime: new Date()
        }
      });
    } else {
      // 更新邀请统计
      const stats = inviteStatsQuery.data[0];
      await db.collection('inviteStats').doc(stats._id).update({
        data: {
          successfulInvites: stats.successfulInvites + 1,
          totalRewards: stats.totalRewards + 70,
          lastInviteTime: new Date()
        }
      });
    }
    
    return { success: true, message: '邀请奖励发放成功', rewards: 70 };
  } catch (error) {
    console.error('处理邀请奖励失败:', error);
    return { success: false, message: '奖励发放失败' };
  }
}

// 立即奖励邀请者
async function handleImmediateReward(inviteCode) {
  try {
    // 查找邀请者 - 由于邀请码是本地生成的，我们需要通过用户数据来查找
    // 这里我们简化处理，直接记录邀请码被使用的情况
    // 在实际应用中，可以建立一个邀请码到openId的映射表
    
    console.log(`邀请码 ${inviteCode} 被使用`);
    
    // 创建邀请使用记录
    const inviteRecord = {
      inviteCode: inviteCode,
      usedTime: new Date(),
      rewardAmount: 50,
      status: 'used'
    };
    
    // 创建邀请记录
    const inviteRecord = {
      inviterOpenId: inviterOpenId,
      inviteCode: inviteCode,
      rewardTime: new Date(),
      rewardAmount: 50,
      status: 'rewarded'
    };
    
    await db.collection('inviteRecords').add({
      data: inviteRecord
    });
    
    // 更新邀请者统计
    const inviteStatsQuery = await db.collection('inviteStats').where({
      openId: inviterOpenId
    }).get();
    
    if (inviteStatsQuery.data.length === 0) {
      // 创建邀请统计
      await db.collection('inviteStats').add({
        data: {
          openId: inviterOpenId,
          totalInvites: 1,
          successfulInvites: 1,
          totalRewards: 50,
          lastInviteTime: new Date()
        }
      });
    } else {
      // 更新邀请统计
      const stats = inviteStatsQuery.data[0];
      await db.collection('inviteStats').doc(stats._id).update({
        data: {
          totalInvites: stats.totalInvites + 1,
          successfulInvites: stats.successfulInvites + 1,
          totalRewards: stats.totalRewards + 50,
          lastInviteTime: new Date()
        }
      });
    }
    
    return { success: true, message: '邀请奖励发放成功', inviterOpenId: inviterOpenId };
  } catch (error) {
    console.error('立即奖励失败:', error);
    return { success: false, message: '奖励发放失败' };
  }
}

// 获取邀请统计
async function getInviteStats(openId) {
  try {
    const statsQuery = await db.collection('inviteStats').where({
      openId: openId
    }).get();
    
    if (statsQuery.data.length === 0) {
      return { 
        success: true, 
        stats: {
          totalInvites: 0,
          successfulInvites: 0,
          totalRewards: 0
        } 
      };
    }
    
    return { success: true, stats: statsQuery.data[0] };
  } catch (error) {
    console.error('获取邀请统计失败:', error);
    return { success: false, message: '获取统计失败' };
  }
}