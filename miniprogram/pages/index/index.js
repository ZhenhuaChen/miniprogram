const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0';
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
    openId:''
  },
  
  getRemainData(){
    // 获取当前日期
    const currentDate = new Date();

    // 指定日期，例如 2024 年 12 月 31 日
    const specifiedDate = new Date('2024-12-31');

    // 计算两个日期之间的差值（以毫秒为单位）
    const timeDifference = specifiedDate - currentDate;

    // 将差值转换为天数
    const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
    return daysDifference;
  },

  goStuday: function(event) {
    const param = event.currentTarget.dataset.param;
    console.log(param,'pppp')
    app.globalData.tabBarParam = param;  
    wx.switchTab({
      url: '/pages/quit/quit'
    })
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 进入小程序获取缓存
    var value = wx.getStorageSync('user')
    this.setData({
      remainDays: this.getRemainData(),
    })
    if(value){
      this.setData({
        userInfo: value,
        hasUserInfo: true
      })
    }
    if(!this.data.openId){
      wx.showLoading({
        title:'登录中'
      });
      wx.cloud.callFunction({
        name:'quickstartFunctions',
        data:{
          typs:'getOpenId'
        },
        success:res=>{
          wx.setStorageSync('openId',res.result.openId)
          this.setData({
            havsGetOpenId:true,
            openId:res.result.openId
          })
          wx.hideLoading()
        },
        fail:err=>{
          console.log(err,'失败')
        }
      })
    }
   
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