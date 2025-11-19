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
    }else if(param === '6'){
       wx.navigateTo({
        url: "/pages/gailvlun/gailvlun",
      }) 
    }
  },
  goSubject: function(event) {
    const param = event.currentTarget.dataset.subject;
    wx.navigateTo({
      url: `/pages/computer/computer?subject=${param}`,
    });
  },
  goChapter: function(event) {
    wx.navigateTo({
      url: "/pages/chapters/chapters",
    });
  },
  goCustomFormulaTest() {
    wx.navigateTo({
      url: "/pages/customFormulaTest/customFormulaTest",
    });
  },

  goToNewFect() {
    wx.navigateTo({
      url: "/pages/resources/resources",
    });
  },

  // 跳转到分享页面
  goToInvite() {
    wx.navigateTo({
      url: "/pages/invite/invite",
    });
  },

  // 跳转到资源下载页面
  goToResources() {
    wx.navigateTo({
      url: "/pages/resources/resources",
    });
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    // 页面加载时自动同步数据
    await this.checkAndSync();
    await this.updateStudyDays();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: async function () {
    this.setData({
      remainDays: this.getRemainData()
    });
    this.updateProgress();
    this.updatePointsDisplay();
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
    return {
      title: '我在「小小考研公式」学习数学公式，一起来高效备考吧！',
      path: `/pages/index/index`,
      imageUrl: ''
    };
  },

  // 分享到朋友圈
  onShareTimeline: function () {
    return {
      title: '小小考研公式 - 高效学习数学公式，考研必备！',
      query: '',
      imageUrl: ''
    };
  },

  // 更新积分显示
  updatePointsDisplay() {
    const pointsData = DataManager.getPointsData();
    this.setData({
      totalPoints: pointsData.totalPoints
    });
  },

  // 检查并执行自动同步
  async checkAndSync() {
    try {
      // 显示同步状态
      this.setData({ syncStatus: '同步中...' });
      
      if (DataManager.needsSync()) {
        // 智能合并数据，避免数据丢失
        await DataManager.mergeData();
        this.updateProgress();
      }
      
      
      // 处理每日学习奖励
      const rewardResult = DataManager.handleDailyStudyReward();
      if (rewardResult.success) {
        wx.showToast({
          title: rewardResult.message,
          icon: 'success'
        });
        this.updatePointsDisplay();
      }
      
    } catch (error) {
      console.error('自动同步失败:', error);
      this.setData({ syncStatus: '同步失败' });
    }
 }
})