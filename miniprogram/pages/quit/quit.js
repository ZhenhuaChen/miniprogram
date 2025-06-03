// pages/quit/quit.js
import parse from "@rojer/katex-mini";
import { getMathBaseData } from "../../service/api";
const app = getApp();
const katexOption = {
  throwError: true,
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
    const lastRember = that.data.onlyfavorite ? 'onlyfavoriteIndex' : 'mathBasecurrentIndex';
  
    // 根据参数选择对应的获取数据函数和缓存索引键
    let itemIndex = wx.getStorageSync(lastRember) || 0;
  
    getMathBaseData(this.data.onlyfavorite, this.data.type).then((res) => {
      const data = res.data;
      if(itemIndex >= data.length) {
        itemIndex = 0;
        wx.setStorageSync(lastRember, 0);
      }
      if(res.data.length > 0) {
        const knownFormulas = wx.getStorageSync('userProgress') || {};
        if(this.data.type && knownFormulas[`type_${this.data.type}`]){
          const resultData = data.filter((item) => !knownFormulas[`type_${this.data.type}`].includes(item.id));
          const currentFormula = resultData.length > 0 ? resultData[0] : data[itemIndex];
          that.setData({
            formulaMap: resultData.length > 0 ? resultData : data,
            formula: currentFormula,
            subName: currentFormula.subName ? parse(currentFormula.subName, katexOption) : '',
            remainIndex: itemIndex,
            currentIndex: itemIndex,
          });
        }else{
          const currentFormula = data[itemIndex];
          that.setData({
            formulaMap: data,
            formula: currentFormula,
            subName: currentFormula.subName ? parse(currentFormula.subName, katexOption) : '',
            remainIndex: itemIndex,
            currentIndex: itemIndex,
          });
        }
        
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
      nodes: parse(this.data.formula.formula, katexOption),
    });
  },

  goToCollection(){
    wx.switchTab({
      url: "/pages/list/list",
    });
  },

  // 没有记住
  handleNo() {
    const formulaId = this.data.formula.id;
    const formulaType = this.data.formula.type;
    const userProgress = wx.getStorageSync("userProgress") || {};
    const typeKey = `type_${formulaType}`;

    // 如果对应 type 的数组存在且包含 formulaId，则删除
    if (userProgress[typeKey] && userProgress[typeKey].includes(formulaId)) {
        userProgress[typeKey] = userProgress[typeKey].filter(id => id !== formulaId);
        wx.setStorageSync('userProgress', userProgress);
    }

    // 设置需要更多练习的状态
    this.setData({
        needMorePractice: true,
    });

    // 显示答案
    this.handleShowAnswer();
  },
  handleYes() {
    const formulaId = this.data.formula.id;
    const formulaType = this.data.formula.type;
    const userProgress = wx.getStorageSync("userProgress") || {} ;
    const typeKey = `type_${formulaType}`;
    
    // 初始化对应 type 的数组（如果不存在）
    if (!userProgress[typeKey]) {
      userProgress[typeKey] = [];
    }

    // 如果 formulaId 不存在于数组中，则添加
    if (!userProgress[typeKey].includes(formulaId)) {
      userProgress[typeKey].push(formulaId);
    }
    wx.setStorageSync('userProgress', userProgress);
    this.handleShowAnswer();
  },
  handleNext(event) {
    this.setData({
        needMorePractice: false,
    });
    const param = event.currentTarget.dataset.param;
    if (param === "restart") {
      wx.setStorageSync('userProgress', {
        ...wx.getStorageSync('userProgress'),
        [`type_${this.data.type}`]: []
      });
      this.setData({
        showAnswer: false,
        finish: false
      })
      this.getData();
    } else {
      if (this.data.currentIndex < this.data.formulaMap.length - 1) {
        const tempIndex = this.data.currentIndex + 1;
        this.setData({
          currentIndex: tempIndex,
          formula: this.data.formulaMap[tempIndex],
          showAnswer: false,
          subName: this.data.formulaMap[tempIndex].subName ? parse(this.data.formulaMap[tempIndex].subName, katexOption) : '',
          description:this.data.formulaMap[tempIndex].description ? parse(this.data.formulaMap[tempIndex].description, katexOption) : '',
          finish: false
        });
      }else{
          this.setData({
              finish: true
          });
      }
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      onlyfavorite: options.onlyfavorite,
      type: options.type
    }, () => {
      this.getData()
    });
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
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
