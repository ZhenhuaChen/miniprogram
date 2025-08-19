// pages/quit/quit.js
import parse from "@rojer/katex-mini";
import { getMathBaseData, getCombinedFavoriteData } from "../../service/api";
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
    currentIndex: 20,
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
  
    // 根据参数选择对应的获取数据函数和缓存索引键
    let itemIndex = 0;

    // 如果是收藏模式，使用合并收藏数据
    if (this.data.onlyfavorite) {
      getCombinedFavoriteData().then((res) => {
        const data = res.data;
        wx.hideLoading();
        
        if (data.length === 0) {
          wx.showToast({
            title: '暂无收藏题目',
            icon: 'none'
          });
          return;
        }
        
        const currentFormula = data[itemIndex];
        that.setData({
          formulaMap: data,
          formula: currentFormula,
          subName: currentFormula.subName ? parse(currentFormula.subName, katexOption) : '',
          remainIndex: itemIndex,
          currentIndex: itemIndex,
        });
        that.checkFavoriteStatus();
      })
      .catch((err) => {
        console.log(err, "获取收藏数据失败");
        wx.hideLoading();
        wx.showToast({
          title: '获取数据失败',
          icon: 'none'
        });
      });
    } else {
      // 原有逻辑：非收藏模式
      getMathBaseData(this.data.onlyfavorite, this.data.type).then((res) => {
        const data = res.data;
        if(itemIndex >= data.length) {
          itemIndex = 0;
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
            that.checkFavoriteStatus();
          }else{
            const currentFormula = data[itemIndex];
            that.setData({
              formulaMap: data,
              formula: currentFormula,
              subName: currentFormula.subName ? parse(currentFormula.subName, katexOption) : '',
              remainIndex: itemIndex,
              currentIndex: itemIndex,
            });
            that.checkFavoriteStatus();
          }
        }
        
        wx.hideLoading()
      })
      .catch((err) => {
        console.log(err, "eeee");
        wx.hideLoading();
      });
    }
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
  async handleNo() {
    const formulaId = this.data.formula.id;
    const formulaType = this.data.formula.type;
    
    // 如果是收藏模式下的合并数据，根据 subject 字段来确定更新哪个进度
    if (this.data.onlyfavorite && this.data.formula.subject) {
      const subject = this.data.formula.subject;
      await DataManager.updateProgress(subject, formulaType, formulaId, false);
      
      // 从对应的进度中移除（因为回答错误）
      if (subject === 'math') {
        const userProgress = wx.getStorageSync("userProgress") || {};
        const typeKey = `type_${formulaType}`;
        if (userProgress[typeKey] && userProgress[typeKey].includes(formulaId)) {
          userProgress[typeKey] = userProgress[typeKey].filter(id => id !== formulaId);
          wx.setStorageSync('userProgress', userProgress);
        }
      } else if (subject === 'xiandai') {
        const userXDProgress = wx.getStorageSync("userXDProgress") || {};
        const typeKey = `type_${formulaType}`;
        if (userXDProgress[typeKey] && userXDProgress[typeKey].includes(formulaId)) {
          userXDProgress[typeKey] = userXDProgress[typeKey].filter(id => id !== formulaId);
          wx.setStorageSync('userXDProgress', userXDProgress);
        }
      }
    } else {
      // 原有逻辑：非收藏模式
      const userProgress = wx.getStorageSync("userProgress") || {};
      const typeKey = `type_${formulaType}`;

      // 如果对应 type 的数组存在且包含 formulaId，则删除
      if (userProgress[typeKey] && userProgress[typeKey].includes(formulaId)) {
          userProgress[typeKey] = userProgress[typeKey].filter(id => id !== formulaId);
          wx.setStorageSync('userProgress', userProgress);
      }
    }

    // 设置需要更多练习的状态
    this.setData({
        needMorePractice: true,
    });

    // 显示答案
    this.handleShowAnswer();
  },
  async handleYes() {
    const formulaId = this.data.formula.id;
    const formulaType = this.data.formula.type;
    
    // 如果是收藏模式下的合并数据，根据 subject 字段来确定更新哪个进度
    if (this.data.onlyfavorite && this.data.formula.subject) {
      const subject = this.data.formula.subject;
      await DataManager.updateProgress(subject, formulaType, formulaId, false);
      
      // 同时更新本地存储
      if (subject === 'math') {
        const userProgress = wx.getStorageSync("userProgress") || {};
        const typeKey = `type_${formulaType}`;
        if (!userProgress[typeKey]) {
          userProgress[typeKey] = [];
        }
        if (!userProgress[typeKey].includes(formulaId)) {
          userProgress[typeKey].push(formulaId);
        }
        wx.setStorageSync('userProgress', userProgress);
      } else if (subject === 'xiandai') {
        const userXDProgress = wx.getStorageSync("userXDProgress") || {};
        const typeKey = `type_${formulaType}`;
        if (!userXDProgress[typeKey]) {
          userXDProgress[typeKey] = [];
        }
        if (!userXDProgress[typeKey].includes(formulaId)) {
          userXDProgress[typeKey].push(formulaId);
        }
        wx.setStorageSync('userXDProgress', userXDProgress);
      }
    } else {
      // 原有逻辑：非收藏模式
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
    }
    
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
