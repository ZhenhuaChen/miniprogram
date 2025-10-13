/**
 * 数据管理器 - 统一管理本地存储和云端同步
 */
class DataManager {
  constructor() {
    this.syncInProgress = false;
    this.lastSyncTime = null;
  }

  // 安全的本地存储读取
  static getStorage(key, defaultValue = null) {
    try {
      const value = wx.getStorageSync(key);
      return value || defaultValue;
    } catch (error) {
      console.error(`读取本地存储失败: ${key}`, error);
      return defaultValue;
    }
  }

  // 安全的本地存储写入
  static setStorage(key, data) {
    try {
      wx.setStorageSync(key, data);
      return true;
    } catch (error) {
      console.error(`写入本地存储失败: ${key}`, error);
      return false;
    }
  }

  // 获取用户完整数据
  static getUserData() {
    const userProgress = this.getStorage('userProgress', {});
    const userXDProgress = this.getStorage('userXDProgress', {});
    const favoriteIds = this.getStorage('favoriteIds', []);
    const lastStudy = this.getStorage('lastStudy', {});

    // 统一数据结构
    const studyProgress = {
      math: userProgress,
      xiandai: userXDProgress
    };

    return {
      studyProgress,
      studyDays: lastStudy.studyDays || 1,
      lastStudyDate: lastStudy.date || this.getCurrentDate(),
      favoriteIds,
      totalProgress: this.calculateTotalProgress(studyProgress),
      version: this.getStorage('dataVersion', 1)
    };
  }

  // 保存用户数据到本地
  static saveUserData(userData) {
    try {
      // 分别保存到原有的存储结构中
      if (userData.studyProgress) {
        if (userData.studyProgress.math) {
          this.setStorage('userProgress', userData.studyProgress.math);
        }
        if (userData.studyProgress.xiandai) {
          this.setStorage('userXDProgress', userData.studyProgress.xiandai);
        }
      }
      
      if (userData.favoriteIds) {
        this.setStorage('favoriteIds', userData.favoriteIds);
      }
      
      if (userData.studyDays || userData.lastStudyDate) {
        this.setStorage('lastStudy', {
          studyDays: userData.studyDays || 1,
          date: userData.lastStudyDate || this.getCurrentDate()
        });
      }
      
      if (userData.version) {
        this.setStorage('dataVersion', userData.version);
      }
      
      return true;
    } catch (error) {
      console.error('保存用户数据失败:', error);
      return false;
    }
  }

  // 同步数据到云端
  static async syncToCloud(showLoading = false) {
    if (this.syncInProgress) {
      console.log('数据同步中，跳过本次同步');
      return { success: false, message: '同步中' };
    }

    this.syncInProgress = true;
    
    if (showLoading) {
      wx.showLoading({ title: '同步中...' });
    }

    try {
      const userData = this.getUserData();
      
      const result = await wx.cloud.callFunction({
        name: 'quickstartFunctions',
        data: {
          type: 'syncUserData',
          userData,
          action: 'sync'
        }
      });

      if (showLoading) {
        wx.hideLoading();
      }

      if (result.result.success) {
        this.lastSyncTime = new Date();
        this.setStorage('lastSyncTime', this.lastSyncTime.toISOString());
        
        if (showLoading) {
          wx.showToast({
            title: '同步成功',
            icon: 'success'
          });
        }
      }

      return result.result;
    } catch (error) {
      console.error('云端同步失败:', error);
      
      if (showLoading) {
        wx.hideLoading();
        wx.showToast({
          title: '同步失败',
          icon: 'none'
        });
      }
      
      return { success: false, error: error.message };
    } finally {
      this.syncInProgress = false;
    }
  }

  // 从云端恢复数据
  static async restoreFromCloud(showLoading = false) {
    if (showLoading) {
      wx.showLoading({ title: '恢复数据中...' });
    }

    try {
      const result = await wx.cloud.callFunction({
        name: 'quickstartFunctions',
        data: {
          type: 'syncUserData',
          action: 'get'
        }
      });

      if (showLoading) {
        wx.hideLoading();
      }

      if (result.result.success && result.result.userData) {
        const cloudData = result.result.userData;
        this.saveUserData(cloudData);
        
        if (showLoading) {
          wx.showToast({
            title: '数据恢复成功',
            icon: 'success'
          });
        }
        
        return { success: true, userData: cloudData };
      } else {
        if (showLoading) {
          wx.showToast({
            title: result.result.message || '暂无云端数据',
            icon: 'none'
          });
        }
        return result.result;
      }
    } catch (error) {
      console.error('恢复数据失败:', error);
      
      if (showLoading) {
        wx.hideLoading();
        wx.showToast({
          title: '恢复失败',
          icon: 'none'
        });
      }
      
      return { success: false, error: error.message };
    }
  }

  // 智能合并数据
  static async mergeData(showLoading = false) {
    if (showLoading) {
      wx.showLoading({ title: '合并数据中...' });
    }

    try {
      const localData = this.getUserData();
      
      const result = await wx.cloud.callFunction({
        name: 'quickstartFunctions',
        data: {
          type: 'syncUserData',
          userData: localData,
          action: 'merge'
        }
      });

      if (showLoading) {
        wx.hideLoading();
      }

      if (result.result.success) {
        const mergedData = result.result.userData;
        this.saveUserData(mergedData);
        
        if (showLoading) {
          wx.showToast({
            title: '数据合并成功',
            icon: 'success'
          });
        }
        
        return { success: true, userData: mergedData };
      }

      return result.result;
    } catch (error) {
      console.error('数据合并失败:', error);
      
      if (showLoading) {
        wx.hideLoading();
        wx.showToast({
          title: '合并失败',
          icon: 'none'
        });
      }
      
      return { success: false, error: error.message };
    }
  }

  // 更新学习进度并同步
  static async updateProgress(type, chapter, formulaId, autoSync = true) {
    try {
      const storageKey = type === 'xiandai' ? 'userXDProgress' : 'userProgress';
      const progress = this.getStorage(storageKey, {});
      
      if (!progress[chapter]) {
        progress[chapter] = [];
      }
      
      if (!progress[chapter].includes(formulaId)) {
        progress[chapter].push(formulaId);
        this.setStorage(storageKey, progress);
        
        // 自动同步到云端
        if (autoSync) {
          await this.syncToCloud();
        }
      }
      
      return true;
    } catch (error) {
      console.error('更新学习进度失败:', error);
      return false;
    }
  }

  // 更新收藏并同步
  static async updateFavorites(formulaId, isFavorite, autoSync = true) {
    try {
      let favoriteIds = this.getStorage('favoriteIds', []);
      
      if (isFavorite && !favoriteIds.includes(formulaId)) {
        favoriteIds.push(formulaId);
      } else if (!isFavorite) {
        favoriteIds = favoriteIds.filter(id => id !== formulaId);
      }
      
      this.setStorage('favoriteIds', favoriteIds);
      
      // 自动同步到云端
      if (autoSync) {
        await this.syncToCloud();
      }
      
      return true;
    } catch (error) {
      console.error('更新收藏失败:', error);
      return false;
    }
  }

  // 更新打卡天数并同步
  static async updateStudyDays(autoSync = true) {
    try {
      const todayDate = this.getCurrentDate();
      let lastStudy = this.getStorage('lastStudy', { date: todayDate, studyDays: 1 });
      
      if (lastStudy.date !== todayDate) {
        lastStudy.date = todayDate;
        lastStudy.studyDays += 1;
      }
      
      this.setStorage('lastStudy', lastStudy);
      
      // 自动同步到云端
      if (autoSync) {
        await this.syncToCloud();
      }
      
      return lastStudy;
    } catch (error) {
      console.error('更新打卡天数失败:', error);
      return null;
    }
  }

  // 工具方法：计算总进度
  static calculateTotalProgress(studyProgress) {
    const allIds = new Set();
    
    Object.values(studyProgress).forEach(subject => {
      if (typeof subject === 'object') {
        Object.values(subject).forEach(ids => {
          if (Array.isArray(ids)) {
            ids.forEach(id => allIds.add(id));
          }
        });
      }
    });
    
    return Math.floor((allIds.size / 112) * 100);
  }

  // 工具方法：获取当前日期
  static getCurrentDate() {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  // 获取上次同步时间
  static getLastSyncTime() {
    const syncTime = this.getStorage('lastSyncTime');
    return syncTime ? new Date(syncTime) : null;
  }

  // 判断是否需要同步
  static needsSync() {
    const lastSync = this.getLastSyncTime();
    if (!lastSync) return true;
    
    const now = new Date();
    const timeDiff = now - lastSync;
    // 如果超过30分钟未同步，则需要同步
    return timeDiff > 30 * 60 * 1000;
  }

  // ========== 积分系统相关方法 ==========
  
  // 添加积分
  static addPoints(points, description = '获得积分') {
    try {
      let pointsData = this.getStorage('pointsData', {
        totalPoints: 0,
        pointsHistory: []
      });
      
      pointsData.totalPoints += points;
      pointsData.pointsHistory.push({
        points: points,
        description: description,
        date: new Date().toISOString(),
        timestamp: Date.now()
      });
      
      // 只保留最近100条记录
      if (pointsData.pointsHistory.length > 100) {
        pointsData.pointsHistory = pointsData.pointsHistory.slice(-100);
      }
      
      this.setStorage('pointsData', pointsData);
      return true;
    } catch (error) {
      console.error('添加积分失败:', error);
      return false;
    }
  }
  
  // 获取积分数据
  static getPointsData() {
    return this.getStorage('pointsData', {
      totalPoints: 0,
      pointsHistory: []
    });
  }
  
  // 检查积分是否足够
  static hasEnoughPoints(requiredPoints) {
    const pointsData = this.getPointsData();
    return pointsData.totalPoints >= requiredPoints;
  }
  
  // ========== 分享系统相关方法 ==========
  
  // 处理分享奖励
  static handleShareReward() {
    try {
      const today = this.getCurrentDate();
      let shareData = this.getStorage('shareData', {
        shareCount: 0,
        lastShareDate: '',
        todayShared: false
      });
      
      // 检查今日是否已分享
      if (shareData.lastShareDate === today) {
        return { success: false, message: '今日已获得分享奖励' };
      }
      
      // 更新分享数据
      shareData.shareCount += 1;
      shareData.lastShareDate = today;
      shareData.todayShared = true;
      this.setStorage('shareData', shareData);
      
      // 给予分享奖励
      this.addPoints(20, '每日分享奖励');
      
      return { success: true, message: '分享成功！获得20积分奖励！' };
    } catch (error) {
      console.error('处理分享奖励失败:', error);
      return { success: false, message: '分享奖励发放失败' };
    }
  }
  
  // 获取分享数据
  static getShareData() {
    return this.getStorage('shareData', {
      shareCount: 0,
      lastShareDate: '',
      todayShared: false
    });
  }
  
  // ========== 学习奖励相关方法 ==========
  
  // 处理每日学习奖励
  static handleDailyStudyReward() {
    try {
      const today = this.getCurrentDate();
      let rewardData = this.getStorage('dailyRewardData', {
        lastRewardDate: '',
        rewardedDays: 0
      });
      
      // 如果今天还没有奖励过
      if (rewardData.lastRewardDate !== today) {
        rewardData.lastRewardDate = today;
        rewardData.rewardedDays += 1;
        this.setStorage('dailyRewardData', rewardData);
        
        // 给予每日学习奖励
        this.addPoints(5, '每日学习奖励');
        
        return { success: true, points: 5, message: '获得每日学习奖励5积分！' };
      }
      
      return { success: false, message: '今日已获得学习奖励' };
    } catch (error) {
      console.error('处理每日学习奖励失败:', error);
      return { success: false, message: '奖励发放失败' };
    }
  }
  
  // 处理章节完成奖励
  static handleChapterCompleteReward(chapterName) {
    try {
      let chapterRewards = this.getStorage('chapterRewards', []);
      
      // 检查是否已经奖励过这个章节
      if (chapterRewards.includes(chapterName)) {
        return { success: false, message: '该章节已获得奖励' };
      }
      
      chapterRewards.push(chapterName);
      this.setStorage('chapterRewards', chapterRewards);
      
      // 给予章节完成奖励
      this.addPoints(10, `完成章节《${chapterName}》`);
      
      return { success: true, points: 10, message: '恭喜完成章节！获得10积分奖励！' };
    } catch (error) {
      console.error('处理章节完成奖励失败:', error);
      return { success: false, message: '奖励发放失败' };
    }
  }
}

module.exports = DataManager; 