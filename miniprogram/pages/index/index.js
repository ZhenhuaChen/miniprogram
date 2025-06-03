const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0';
const DataManager = require('../../utils/dataManager');
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {
      avatarUrl: defaultAvatarUrl,
      nickName: '',
    },
    hasUserInfo: false,
    remainDays: 1,
    totalProgress: 0,
    openId: '',
    totalStudyDays: 1,
    lastSyncTime: null,
    syncStatus: '未同步' // 同步状态显示
  },
  
  getRemainData(){
    // 获取当前日期
    const currentDate = new Date();

    // 指定日期，例如 2024 年 12 月 31 日
    const specifiedDate = new Date('2025-12-21');

    // 计算两个日期之间的差值（以毫秒为单位）
    const timeDifference = specifiedDate - currentDate;

    // 将差值转换为天数
    const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
    return daysDifference;
  },

  getProgress(){
    return DataManager.calculateTotalProgress({
      math: DataManager.getStorage('userProgress', {}),
      xiandai: DataManager.getStorage('userXDProgress', {})
    });
  },

  // 手动同步数据
  async syncData() {
    const result = await DataManager.syncToCloud(true);
    if (result.success) {
      this.updateSyncStatus();
    }
  },

  // 恢复云端数据
  async restoreData() {
    wx.showModal({
      title: '确认恢复',
      content: '从云端恢复数据会覆盖本地数据，确定继续吗？',
      success: async (res) => {
        if (res.confirm) {
          const result = await DataManager.restoreFromCloud(true);
          if (result.success) {
            this.updateProgress();
            this.updateSyncStatus();
          }
        }
      }
    });
  },

  // 合并数据
  async mergeData() {
    const result = await DataManager.mergeData(true);
    if (result.success) {
      this.updateProgress();
      this.updateSyncStatus();
    }
  },

  // 更新同步状态显示
  updateSyncStatus() {
    const lastSync = DataManager.getLastSyncTime();
    if (lastSync) {
      const now = new Date();
      const diff = now - lastSync;
      let syncStatus = '';
      
      if (diff < 60 * 1000) {
        syncStatus = '刚刚同步';
      } else if (diff < 60 * 60 * 1000) {
        syncStatus = `${Math.floor(diff / (60 * 1000))}分钟前`;
      } else if (diff < 24 * 60 * 60 * 1000) {
        syncStatus = `${Math.floor(diff / (60 * 60 * 1000))}小时前`;
      } else {
        syncStatus = `${Math.floor(diff / (24 * 60 * 60 * 1000))}天前`;
      }
      
      this.setData({
        lastSyncTime: lastSync,
        syncStatus
      });
    } else {
      this.setData({
        syncStatus: '未同步'
      });
    }
  },

  // 更新进度显示
  updateProgress() {
    this.setData({
      totalProgress: this.getProgress()
    });
  },

  // 更新打卡天数
  async updateStudyDays() {
    const studyData = await DataManager.updateStudyDays(true);
    if (studyData) {
      this.setData({
        totalStudyDays: studyData.studyDays
      });
    }
  },

  goStuday: function(event) {
    const param = event.currentTarget.dataset.param;
    if(param === '1'){
      wx.navigateTo({
        url: "/pages/chapters/chapters",
      });
    }else if(param === '2'){
      wx.navigateTo({
        url: "/pages/quit/quit?onlyfavorite=true",
      });
    }else if (param === '3'){
      wx.navigateTo({
        url: "/pages/quit/quit",
      });
    }else if(param === '4'){
       wx.navigateTo({
        url: "/pages/chapters/chapters?cate=xiandai",
      }) 
     }else if(param === '5'){
       wx.navigateTo({
        url: "/pages/xiandai/xiandai",
      }) 
    }
  },
  goSubject: function(event) {
    const param = event.currentTarget.dataset.subject;
    console.log(param,'ooooo')
    wx.navigateTo({
      url: `/pages/computer/computer?subject=${param}`,
    });
  },
  goChapter: function(event) {
    wx.navigateTo({
      url: "/pages/chapters/chapters",
    });
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 进入小程序获取缓存
    var value = DataManager.getStorage('user');
    if(value){
      this.setData({
        userInfo: value,
        hasUserInfo: true
      })
    }

    // 更新打卡天数
    this.updateStudyDays();
    
    if(!this.data.openId){
      wx.showLoading({
        title:'登录中'
      });
      wx.cloud.callFunction({
        name:'quickstartFunctions',
        data:{
          type:'getOpenId'
        },
        success: res => {
          this.setData({
            hasGetOpenId: true,
            openId: res.result.openid
          });
          wx.hideLoading();
          
          // 登录成功后，检查是否需要同步数据
          this.checkAndSync();
        },
        fail: err => {
          console.log(err,'失败');
          wx.hideLoading();
        }
      })
    }
  },

  // 检查并执行自动同步
  async checkAndSync() {
    if (DataManager.needsSync()) {
      // 智能合并数据，避免数据丢失
      await DataManager.mergeData();
      this.updateProgress();
    }
    this.updateSyncStatus();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setData({
      remainDays: this.getRemainData()
    });
    this.updateProgress();
    this.updateSyncStatus();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    // 下拉刷新时同步数据
    this.checkAndSync().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    
  }
})