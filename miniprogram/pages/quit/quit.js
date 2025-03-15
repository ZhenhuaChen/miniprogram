// pages/quit/quit.js
import parse from "@rojer/katex-mini";
import { getMathBaseData, getHighMathData, getXdData } from "../../service/api";
const app = getApp();
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
    finish: false,
    subName: '',
    description: ''
  },
  
  getData() {
    wx.showLoading()

    const param = app.globalData.tabBarParam || '1';
    let that = this;
    console.log(param,'iiiii')
  
    // 根据参数选择对应的获取数据函数和缓存索引键
    let getDataFunction;
    let storageKey;
  
    switch (param) {
      case '1':
        getDataFunction = getMathBaseData;
        storageKey = "mathBasecurrentIndex";
        break;
      case '2':
        getDataFunction = getHighMathData;
        storageKey = "math2currentIndex";
        break;
      case '3':
        getDataFunction = getXdData;
        storageKey = "xdcurrentIndex";
        break;
      default:
        getDataFunction = getHighMathData;
        storageKey = "math2currentIndex";
        return;
    }
  
    const itemIndex = wx.getStorageSync(storageKey) || 0;
  
    getDataFunction().then((res) => {
      const data = res.data;
      const currentFormula = data[itemIndex];
      that.setData({
        formulaMap: data,
        formula: currentFormula,
        subName: currentFormula.subName ? parse(currentFormula.subName, {
          throwError: true,
          ...katexOption,
        }) : '',
        remainIndex: itemIndex,
        currentIndex: itemIndex,
      });
      wx.hideLoading()
    })
    .catch((err) => {
      console.log(err, "eeee");
    });
  },
  
  

  handleShowAnswer() {
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
        subName: this.data.formulaMap[tempIndex].subName ? parse(this.data.formulaMap[tempIndex].subName, {
          throwError: true,
          ...katexOption,
        }) : '',
        description:this.data.formulaMap[tempIndex].description ? parse(this.data.formulaMap[tempIndex].description, {
          throwError: true,
       
          ...katexOption,
        }) : '',
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
   
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.getData();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
    this.setData({
      showAnswer: false
    })
    const param = app.globalData.tabBarParam;
    const storageKeys = {
      '1': 'mathBasecurrentIndex',
      '2': 'math2currentIndex',
      '3': 'xdcurrentIndex'
    };
  
    const storageKey = storageKeys[param];
  
    if (storageKey) {
      const indexToStore = this.data.finish ? 0 : this.data.currentIndex;
      wx.setStorageSync(storageKey, indexToStore);
    }
  },
  

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
