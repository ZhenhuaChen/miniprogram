const DataManager = require('../../utils/dataManager');

Page({
  data: {
    totalPoints: 0,
    pointsHistory: [],
    loading: false
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