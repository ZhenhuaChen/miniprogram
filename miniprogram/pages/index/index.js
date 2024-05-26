const db = wx.cloud.database()
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0';
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
    openId:''
  },

  getData(){

    const tt = db.collection("vip");
    tt.get().then(res=>{
      console.log(res,'ppppp')
    })
    //doc()只用来查询id
    // // 查询
    // db.collection('vip').get().then(res=>{
    //   console.log(res)
    // })
  },
  addData(userInfo){
    const tt = db.collection("vip");
    tt.add({
      data:{
        phone:'18362986358',
      },
      success:function(){
        console.log("添加成功")
      },
      fail:function(){
        console.log("添加失败")
      }
    })
  },



  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 进入小程序获取缓存
    var value = wx.getStorageSync('user')
    console.log(value,'youshuju')
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
          console.log(res,'结果')
          wx.setStorageSync('openId',res.result.userInfo.openId)
          this.setData({
            havsGetOpenId:true,
            openId:res.result.userInfo.openId
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