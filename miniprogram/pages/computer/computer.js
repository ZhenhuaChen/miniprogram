// pages/memorize/memorize.js
import { getComputerData } from "../../service/api";

Page({
  data: {
    knowledgePoints: [], 
    currentItem: null,   
    currentIndex: 0,     
    totalItems: 0,       
    showDetails: false,  
    isLoading: true,    
    type: 'jz',    
  },

  onLoad: function (options) {
    this.fetchKnowledgePoints();
  },

  fetchKnowledgePoints: function () {
    this.setData({ isLoading: true });
    getComputerData(this.data.type).then((res) => {
      if (res.data && res.data.length > 0) {
        this.setData({
          knowledgePoints: res.data,
          totalItems: res.data.length,
          currentIndex: 0, // Start with the first item
          isLoading: false,
        });
        this.displayCurrentItem();
      } else {
        this.setData({
          knowledgePoints: [],
          totalItems: 0,
          currentItem: null,
          isLoading: false,
        });
      }
    }).catch(err => {
      console.error('Failed to fetch knowledge points:', err);
      wx.showToast({
        title: '加载失败，请重试',
        icon: 'none'
      });
      this.setData({ isLoading: false, currentItem: null });
    });
  },

  displayCurrentItem: function () {
    if (this.data.knowledgePoints.length > 0 && this.data.currentIndex < this.data.totalItems) {
      this.setData({
        currentItem: this.data.knowledgePoints[this.data.currentIndex],
        showDetails: false // Reset details visibility for the new item
      });
    } else {
        this.setData({ currentItem: null}); // Should not happen if logic is correct
    }
  },

  toggleDetails: function () {
    this.setData({
      showDetails: !this.data.showDetails
    });
  },

  nextItem: function () {
    if (this.data.currentIndex < this.data.totalItems - 1) {
      this.setData({
        currentIndex: this.data.currentIndex + 1
      });
      this.displayCurrentItem();
    } else {
      // Optionally, loop back to the first item or show a message
      wx.showToast({ title: '已经是最后一个啦！', icon: 'none' });
      // To loop:
      // this.setData({ currentIndex: 0 });
      // this.displayCurrentItem();
    }
  },

  prevItem: function () {
    if (this.data.currentIndex > 0) {
      this.setData({
        currentIndex: this.data.currentIndex - 1
      });
      this.displayCurrentItem();
    } else {
       // Optionally, loop back to the last item or show a message
      wx.showToast({ title: '已经是第一个啦！', icon: 'none' });
      // To loop:
      // this.setData({ currentIndex: this.data.totalItems - 1 });
      // this.displayCurrentItem();
    }
  },

  randomItem: function () {
    if (this.data.totalItems > 0) {
      let newIndex = this.data.currentIndex;
      if (this.data.totalItems > 1) { // Prevent infinite loop if only one item
        while (newIndex === this.data.currentIndex) {
          newIndex = Math.floor(Math.random() * this.data.totalItems);
        }
      }
      this.setData({
        currentIndex: newIndex
      });
      this.displayCurrentItem();
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
  // ... other lifecycle methods if needed
})