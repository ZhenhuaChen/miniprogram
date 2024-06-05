// pages/quit/quit.js
import parse from "@rojer/katex-mini";
import { getMath2Data } from "../../service/api";
const katexOption = {
  displayMode: true,
};
Page({
  /**
   * 页面的初始数据
   */
  data: {
    formulaMap: [],
    remainIndex: 0,
    currentIndex: 0,
    formula: {},
    nodes: [],
    showAnswer: false,
    currentPage: 1,
    finish: false
  },

  getData() {
    let that = this;
    const itemIndex = wx.getStorageSync("math2currentIndex") | 0;
    getMath2Data()
      .then((res) => {
        that.setData({
          formulaMap: res.data,
          formula: res.data[itemIndex],
          remainIndex: itemIndex,
          currentIndex: itemIndex,
        });
      })
      .catch((err) => {
        console.log(err, "eeee");
      });
  },

  handleShowAnswer() {
    console.log(this.data.formula, "8888888");
    this.setData({
      showAnswer: true,
      nodes: parse(this.data.formula.formula, {
        throwError: true,
        ...katexOption,
      }),
    });
  },

  handleNo() {
    const disabledMathMap = wx.getStorageSync("disabledMathMap") || [];
    wx.setStorageSync(
      "disabledMathMap",
      disabledMathMap.concat(this.data.formula.id)
    );
    this.handleShowAnswer();
  },
  handleYes() {
    this.setData({
      showAnswer: true,
    });
    this.handleShowAnswer();
  },
  handleNext() {
    if (this.data.currentIndex < this.data.formulaMap.length) {
      const tempIndex = this.data.currentIndex + 1;
      this.setData({
        currentIndex: tempIndex,
        formula: this.data.formulaMap[tempIndex],
        showAnswer: false,
      });
    }else{
        this.setData({
            finish: true
        });
    }
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
