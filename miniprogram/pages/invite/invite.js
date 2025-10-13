const DataManager = require('../../utils/dataManager');

Page({
  data: {
    userInfo: {},
    shareCount: 0,
    totalPoints: 0,
    todayShared: false,
    loading: false
  },

  onLoad: function (options) {
    this.initShareData();
  },

  onShow: function () {
    this.refreshData();
  },

  // 初始化分享数据
  async initShareData() {
    try {
      this.setData({ loading: true });
      
      // 获取用户信息
      const userInfo = DataManager.getStorage('userInfo', {});
      
      // 获取分享数据
      const shareData = DataManager.getStorage('shareData', {
        shareCount: 0,
        lastShareDate: '',
        todayShared: false
      });
      
      // 获取积分数据
      const pointsData = DataManager.getStorage('pointsData', {
        totalPoints: 0,
        pointsHistory: []
      });

      // 检查今日是否已分享
      const today = DataManager.getCurrentDate();
      const todayShared = shareData.lastShareDate === today;

      this.setData({
        userInfo,
        shareCount: shareData.shareCount,
        totalPoints: pointsData.totalPoints,
        todayShared: todayShared,
        loading: false
      });
    } catch (error) {
      console.error('初始化分享数据失败:', error);
      this.setData({ loading: false });
    }
  },

  // 处理分享奖励
  handleShareReward() {
    if (this.data.todayShared) {
      wx.showToast({
        title: '今日已获得分享奖励',
        icon: 'none'
      });
      return;
    }

    // 给予分享奖励
    const result = DataManager.handleShareReward();
    if (result.success) {
      wx.showToast({
        title: result.message,
        icon: 'success'
      });
      
      // 更新本地状态
      this.setData({
        todayShared: true,
        shareCount: this.data.shareCount + 1
      });
      
      this.refreshData();
    } else {
      wx.showToast({
        title: result.message,
        icon: 'none'
      });
    }
  },

  // 刷新数据
  refreshData() {
    const pointsData = DataManager.getStorage('pointsData', {
      totalPoints: 0,
      pointsHistory: []
    });
    
    const shareData = DataManager.getStorage('shareData', {
      shareCount: 0,
      lastShareDate: '',
      todayShared: false
    });

    // 检查今日是否已分享
    const today = DataManager.getCurrentDate();
    const todayShared = shareData.lastShareDate === today;

    this.setData({
      totalPoints: pointsData.totalPoints,
      shareCount: shareData.shareCount,
      todayShared: todayShared
    });
  },

  // 分享给好友
  shareToFriend() {
    // 先处理分享奖励
    this.handleShareReward();
    
    return {
      title: '我在「小小考研公式」学习数学公式，一起来高效备考吧！',
      path: `/pages/index/index`,
      imageUrl: ''
    };
  },

  // 跳转到积分中心
  goToPoints() {
    wx.navigateTo({
      url: '/pages/points/points'
    });
  },

  // 页面分享配置
  onShareAppMessage() {
    return this.shareToFriend();
  },

  onShareTimeline() {
    // 先处理分享奖励
    this.handleShareReward();
    
    return {
      title: '小小考研公式 - 高效学习数学公式，考研必备！',
      query: '',
      imageUrl: ''
    };
  }
});