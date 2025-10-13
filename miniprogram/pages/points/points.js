const DataManager = require('../../utils/dataManager');

Page({
  data: {
    totalPoints: 0,
    pointsHistory: [],
    loading: false,
    showExchangeModal: false,
    selectedReward: null,
    rewards: [
      {
        id: 'vip_formulas',
        title: '高级公式解锁',
        desc: '解锁所有高级数学公式',
        points: 100,
        icon: '📚'
      },
      {
        id: 'custom_report',
        title: '个性化学习报告',
        desc: '生成详细的学习分析报告',
        points: 50,
        icon: '📊'
      },
      {
        id: 'remove_ads',
        title: '去除广告',
        desc: '享受无广告的学习体验',
        points: 200,
        icon: '🚫'
      }
    ]
  },

  onLoad: function (options) {
    this.loadPointsData();
  },

  onShow: function () {
    this.refreshPointsData();
  },

  // 加载积分数据
  loadPointsData() {
    this.setData({ loading: true });
    
    const pointsData = DataManager.getStorage('pointsData', {
      totalPoints: 0,
      pointsHistory: []
    });
    
    this.setData({
      totalPoints: pointsData.totalPoints,
      pointsHistory: pointsData.pointsHistory.reverse(), // 最新的在前面
      loading: false
    });
  },

  // 刷新积分数据
  refreshPointsData() {
    const pointsData = DataManager.getStorage('pointsData', {
      totalPoints: 0,
      pointsHistory: []
    });
    
    this.setData({
      totalPoints: pointsData.totalPoints,
      pointsHistory: pointsData.pointsHistory.reverse()
    });
  },

  // 显示兑换模态框
  showExchange(e) {
    const index = e.currentTarget.dataset.index;
    const reward = this.data.rewards[index];
    
    if (this.data.totalPoints < reward.points) {
      wx.showToast({
        title: '积分不足',
        icon: 'none'
      });
      return;
    }
    
    this.setData({
      selectedReward: reward,
      showExchangeModal: true
    });
  },

  // 隐藏兑换模态框
  hideExchangeModal() {
    this.setData({
      showExchangeModal: false,
      selectedReward: null
    });
  },

  // 确认兑换
  confirmExchange() {
    const reward = this.data.selectedReward;
    
    if (this.data.totalPoints < reward.points) {
      wx.showToast({
        title: '积分不足',
        icon: 'none'
      });
      return;
    }
    
    // 扣除积分
    DataManager.addPoints(-reward.points, `兑换${reward.title}`);
    
    // 记录兑换
    this.recordExchange(reward);
    
    this.hideExchangeModal();
    this.refreshPointsData();
    
    wx.showToast({
      title: '兑换成功！',
      icon: 'success'
    });
  },

  // 记录兑换历史
  recordExchange(reward) {
    let exchanges = DataManager.getStorage('exchanges', []);
    exchanges.push({
      id: reward.id,
      title: reward.title,
      points: reward.points,
      date: new Date().toISOString()
    });
    DataManager.setStorage('exchanges', exchanges);
  },

  // 格式化时间
  formatTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) { // 1分钟内
      return '刚刚';
    } else if (diff < 3600000) { // 1小时内
      return Math.floor(diff / 60000) + '分钟前';
    } else if (diff < 86400000) { // 1天内
      return Math.floor(diff / 3600000) + '小时前';
    } else {
      return date.toLocaleDateString();
    }
  },

  // 分享积分页面
  onShareAppMessage() {
    return {
      title: `我在「小小考研公式」已获得${this.data.totalPoints}积分！`,
      path: '/pages/invite/invite'
    };
  }
});