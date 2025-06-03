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
}

module.exports = DataManager; 