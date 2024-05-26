// pages/quit/quit.js
const db = wx.cloud.database();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    formulaMap: [],
    remainIndex:  0,
    currentIndex:  0,
    formula: {},
    showAnswer: false,
  },

  getData() {
    const data = db.collection("math2");
    const itemIndex = wx.getStorageSync('currentIndex') | 0;
    const that = this;
   data.get({
      success: function (res) {
        that.setData({
            formulaMap: res.data,
            formula: res.data[itemIndex],
            remainIndex: itemIndex,
            currentIndex:  itemIndex,
        })
      },
    });
  },

  
  handleNo() {
    console.log('no')
    const disabledMathMap = wx.getStorageSync('disabledMathMap') || [];
    wx.setStorageSync('disabledMathMap', disabledMathMap.concat(this.data.formula.id))
    this.setData({
        showAnswer: true
    })
  },
  handleYes(){
    console.log('yes')
    this.setData({
        showAnswer: true
    })
  },
  handleNext(){
    this.setData({
        currentIndex: this.data.currentIndex + 1,
        formula: this.data.formulaMap[this.data.currentIndex + 1],
        showAnswer: false,
    })
  },
  

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getData();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {},
});
