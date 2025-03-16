// pages/quit/quit.js
import parse from "@rojer/katex-mini";
import { getMathBaseData } from "../../service/api";
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
    currentIndex: 20,
    formula: {},
    nodes: [],
    showAnswer: false,
    currentPage: 1,
    finish: false,
    subName: '',
    description: '',
    onlyfavorite: false
  },
  
  getData() {
    wx.showLoading()

    const param = '1';
    let that = this;
    const lastRember = this.data.onlyfavorite ? 'onlyfavoriteIndex' : 'mathBasecurrentIndex';
  
    // 根据参数选择对应的获取数据函数和缓存索引键
    const itemIndex = wx.getStorageSync(lastRember) || 0;
  
    getMathBaseData(this.data.onlyfavorite).then((res) => {
      const data = res.data;
      if(res.data.length > 0) {
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
      }
      
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

  goToCollection(){
    wx.switchTab({
      url: "/pages/list/list",
    });
  },

  // 没有记住
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
  handleNext(event) {
    const param = event.currentTarget.dataset.param;
    if (param === "restart") {
      this.setData({
        currentIndex: 0,
        formula: this.data.formulaMap[0],
        showAnswer: false,
        subName: this.data.formulaMap[0].subName
          ? parse(this.data.formulaMap[0].subName, {
              throwError: true,
              ...katexOption,
            })
          : "",
        description: this.data.formulaMap[0].description
          ? parse(this.data.formulaMap[0].description, {
              throwError: true,
              ...katexOption,
            })
          : "",
        finish: false, // 重置完成状态
      });
    } else {
    if (this.data.currentIndex < this.data.formulaMap.length - 1) {
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
        finish: false
      });
    }else{
        this.setData({
            finish: true
        });
    }}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      onlyfavorite: options.onlyfavorite 
    })
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
  onHide() {},
  

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    const indexToStore = this.data.finish ? 0 : this.data.currentIndex;
    const lastRember = this.data.onlyfavorite ? 'onlyfavoriteIndex' : 'mathBasecurrentIndex';
    wx.setStorageSync(lastRember, indexToStore);
    this.setData({
      showAnswer: false
    })
  },

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
