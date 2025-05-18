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
    totalProgress: 0,
    openId:''
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
    const userProgress = wx.getStorageSync('userProgress') || {};
    const formulaIdSet = new Set();
    for (const type in userProgress) {
      if (Array.isArray(userProgress[type])) {
        userProgress[type].forEach(id => formulaIdSet.add(id));
      }
    }
    if(formulaIdSet.size) {
      return parseInt((formulaIdSet.size / 112) * 100)
    }else{
      return 0
    }
  },
  // 获取当前日期（格式：YYYY-MM-DD）
  getCurrentDate() {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
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
    var value = wx.getStorageSync('user')
    if(value){
      this.setData({
        userInfo: value,
        hasUserInfo: true
      })
    }
    const todayDate = this.getCurrentDate(); // 当前日期
    let lastStudy = wx.getStorageSync('lastStudy') || { date: todayDate, studyDays: 1 }; // 获取缓存数据，默认为空

    if (lastStudy.date !== todayDate) {
      lastStudy.date = todayDate;
      lastStudy.studyDays += 1;
      wx.setStorageSync('lastStudy', {
        date: todayDate,
        studyDays: lastStudgoStudayy.studyDays + 1
      })
    }else{
      wx.setStorageSync('lastStudy', {
        date: todayDate,
        studyDays:lastStudy.studyDays
      });
    }
   
    if(!this.data.openId){
      wx.showLoading({
        title:'登录中'
      });
      wx.cloud.callFunction({
        name:'quickstartFunctions',
        data:{
          type:'getOpenId'
        },
        success:res=>{
          this.setData({
            havsGetOpenId:true,
            openId:res.result.openId,
            totalStudyDays: lastStudy.studyDays
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
    this.setData({
      remainDays: this.getRemainData(),
      totalProgress: this.getProgress()
    })
    
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