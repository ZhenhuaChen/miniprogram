// pages/gailvlun/gailvlun.js
import parse from "@rojer/katex-mini";
import { getGailvlunData } from "../../service/api";
const DataManager = require('../../utils/dataManager');
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
    currentIndex: 0,
    formula: {},
    nodes: [],
    showAnswer: false,
    currentPage: 1,
    finish: false,
    subName: '',
    description: '',
    onlyfavorite: false,
    isFavorite: false
  },
  
  getData() {
    wx.showLoading()
    let that = this;
    getGailvlunData(this.data.onlyfavorite).then((res) => {
      const data = res.data;
      console.log(res.data, 'gailvlun data');
      if(res.data.length > 0) {
        const knownFormulas = wx.getStorageSync('userGailvlunProgress') || {};
        if(knownFormulas.all){
          const resultData = data.filter((item) => !knownFormulas.all.includes(item.id));
          const currentFormula = resultData.length > 0 ? resultData[0] : data[0];
          that.setData({
            formulaMap: resultData.length > 0 ? resultData : data,
            formula: currentFormula,
            subName: currentFormula.subName ? parse(currentFormula.subName, katexOption) : '',
            remainIndex: 0,
            currentIndex:0,
          });
          that.checkFavoriteStatus();
        }else{
          const currentFormula = data[0];
          that.setData({
            formulaMap: data,
            formula: currentFormula,
            subName: currentFormula.subName ? parse(currentFormula.subName, katexOption) : '',
            remainIndex: 0,
            currentIndex: 0,
          });
          that.checkFavoriteStatus();
        }
      }
      
      wx.hideLoading()
    })
    .catch((err) => {
      console.log(err, "获取概率论数据失败");
      wx.hideLoading();
    });
  },
  
  checkFavoriteStatus() {
    const favoriteIds = DataManager.getStorage('favoriteIds', []);
    const isFavorite = favoriteIds.includes(this.data.formula._id);
    this.setData({
      isFavorite: isFavorite
    });
  },

  async toggleFavorite() {
    const formulaId = this.data.formula._id;
    const currentFavoriteStatus = this.data.isFavorite;
    
    // 使用数据管理器更新收藏状态
    const success = await DataManager.updateFavorites(formulaId, !currentFavoriteStatus, true);
    
    if (success) {
      this.setData({
        isFavorite: !currentFavoriteStatus
      });
      
      wx.showToast({
        title: currentFavoriteStatus ? '取消收藏' : '收藏成功',
        icon: 'success',
        duration: 1500
      });
    } else {
      wx.showToast({
        title: '操作失败',
        icon: 'none'
      });
    }
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
    const userGailvlunProgress = wx.getStorageSync("userGailvlunProgress") || {};
    
    // 概率论没有按章节分类，使用 'all' 键
    if (userGailvlunProgress.all && userGailvlunProgress.all.includes(formulaId)) {
        userGailvlunProgress.all = userGailvlunProgress.all.filter(id => id !== formulaId);
        wx.setStorageSync('userGailvlunProgress', userGailvlunProgress);
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
    const userGailvlunProgress = wx.getStorageSync("userGailvlunProgress") || {};
    
    // 概率论没有按章节分类，使用 'all' 键
    if (!userGailvlunProgress.all) {
      userGailvlunProgress.all = [];
    }

    // 如果 formulaId 不存在于数组中，则添加
    if (!userGailvlunProgress.all.includes(formulaId)) {
      userGailvlunProgress.all.push(formulaId);
    }
    wx.setStorageSync('userGailvlunProgress', userGailvlunProgress);
    this.handleShowAnswer();
  },
  
  handleNext(event) {
    this.setData({
        needMorePractice: false,
    });
    const param = event.currentTarget.dataset.param;
    if (param === "restart") {
      wx.setStorageSync('userGailvlunProgress', {
        all: []
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
        this.checkFavoriteStatus();
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
    console.log(options, 'gailvlun options')
    this.setData({
      onlyfavorite: options.onlyfavorite
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