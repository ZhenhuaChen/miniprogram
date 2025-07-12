// pages/favorites/favorites.js
import parse from "@rojer/katex-mini";
const DataManager = require('../../utils/dataManager');

const katexOption = {
  throwError: true,
};

Page({
  data: {
    favoriteFormulas: [],
    isLoading: false,
    isEmpty: false,
    currentTab: 'all', // 'all', 'math', 'xiandai'
    tabs: [
      { id: 'all', name: '全部' },
      { id: 'math', name: '高数' },
      { id: 'xiandai', name: '线代' }
    ]
  },

  onLoad() {
    this.loadFavoriteFormulas();
  },

  onShow() {
    // 每次显示页面时刷新收藏列表
    this.loadFavoriteFormulas();
  },

  // 切换标签
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({
      currentTab: tab
    });
    this.loadFavoriteFormulas();
  },

  // 加载收藏的公式
  async loadFavoriteFormulas() {
    this.setData({ isLoading: true });
    
    try {
      const favoriteIds = DataManager.getStorage('favoriteIds', []);
      
      if (favoriteIds.length === 0) {
        this.setData({
          favoriteFormulas: [],
          isEmpty: true,
          isLoading: false
        });
        return;
      }

      const db = wx.cloud.database();
      const _ = db.command;
      
      // 根据当前选择的标签过滤数据
      let collections = [];
      if (this.data.currentTab === 'all') {
        collections = ['math2', 'xiandai'];
      } else if (this.data.currentTab === 'math') {
        collections = ['math2'];
      } else if (this.data.currentTab === 'xiandai') {
        collections = ['xiandai'];
      }

      const allFormulas = [];
      
      // 从不同的集合中获取数据
      for (const collection of collections) {
        try {
          const res = await db.collection(collection)
            .where({
              _id: _.in(favoriteIds)
            })
            .get();
          
          // 添加集合类型标识
          const formulas = res.data.map(item => ({
            ...item,
            formulaHtml: this.parseLaTeX(item.formula),
            subNameHtml: this.parseLaTeX(item.subName),
            collectionType: collection === 'math2' ? '高数' : '线代'
          }));
          
          allFormulas.push(...formulas);
        } catch (error) {
          console.error(`从${collection}获取数据失败:`, error);
        }
      }

      this.setData({
        favoriteFormulas: allFormulas,
        isEmpty: allFormulas.length === 0,
        isLoading: false
      });
      
    } catch (error) {
      console.error('加载收藏失败:', error);
      this.setData({
        isLoading: false,
        isEmpty: true
      });
      
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    }
  },

  // 解析LaTeX公式
  parseLaTeX(latex) {
    if (!latex) return '';
    try {
      return parse(latex, katexOption);
    } catch (error) {
      console.error('LaTeX解析失败:', error);
      return latex;
    }
  },

  // 取消收藏
  async toggleFavorite(e) {
    const formulaId = e.currentTarget.dataset.id;
    
    const success = await DataManager.updateFavorites(formulaId, false, true);
    
    if (success) {
      wx.showToast({
        title: '取消收藏',
        icon: 'success',
        duration: 1500
      });
      
      // 重新加载收藏列表
      this.loadFavoriteFormulas();
    } else {
      wx.showToast({
        title: '操作失败',
        icon: 'none'
      });
    }
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadFavoriteFormulas().then(() => {
      wx.stopPullDownRefresh();
    });
  }
}); 