import parse from "@rojer/katex-mini";
const DataManager = require('../../utils/dataManager');

const katexOption = {
  throwError: true,
};
Page({
  data: {
    formulas: [], // 公式列表
    page: 1, // 当前页码
    pageSize: 5, // 每页加载的数量
    isLoading: false, // 是否正在加载
    hasMore: true, // 是否还有更多数据
    keyword: "", // 搜索关键词
    favoriteIds: [], // 用户收藏的 ID 列表
    currentTab: 'math', // 当前选择的标签：'math'、'xiandai' 或 'gailvlun'
    tabs: [
      { id: 'math', name: '高数', collection: 'math2' },
      { id: 'xiandai', name: '线代', collection: 'xiandai' },
      { id: 'gailvlun', name: '概率论', collection: 'gailvlun' }
    ]
  },

  onLoad() {
    // 从本地存储中获取用户收藏的 ID 列表
    const favoriteIds = DataManager.getStorage("favoriteIds", []);
    this.setData({ favoriteIds });
    // 页面加载时初始化数据
    this.loadFormulas();
  },

  onShow() {
    // 每次显示页面时更新收藏状态
    const favoriteIds = DataManager.getStorage("favoriteIds", []);
    this.setData({ favoriteIds });
    // 更新页面中的收藏状态
    this.updateFavoriteStatus();
  },

  // 更新收藏状态
  updateFavoriteStatus() {
    const formulas = this.data.formulas.map((item) => ({
      ...item,
      isFavorite: this.data.favoriteIds.includes(item._id)
    }));
    this.setData({ formulas });
  },

  // 切换标签
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({
      currentTab: tab,
      formulas: [], // 清空当前列表
      page: 1, // 重置页码
      hasMore: true, // 重置是否有更多数据
      keyword: "" // 清空搜索关键词
    });
    this.loadFormulas();
  },

  // 从云数据库加载公式数据
  loadFormulas() {
    if (this.data.isLoading || !this.data.hasMore) return;

    this.setData({ isLoading: true });

    const db = wx.cloud.database();
    const { page, pageSize, keyword, currentTab } = this.data;

    // 根据当前标签选择对应的集合
    const currentCollection = this.data.tabs.find(tab => tab.id === currentTab)?.collection || 'math2';

    // 构建查询条件
    const query = {};
    if (keyword) {
      query.name = db.RegExp({
        regexp: keyword,
        options: "i", // 不区分大小写
      });
    }

    // 从云数据库获取数据
    db.collection(currentCollection)
      .where(query)
      .skip((page - 1) * pageSize) // 跳过已加载的数据
      .limit(pageSize) // 每次加载 5 条
      .get()
      .then((res) => {
        const newFormulas = res.data.map((item) => ({
          ...item,
          hideContent: false,
          isFavorite: this.data.favoriteIds.includes(item._id), // 初始化收藏状态
          subNameHtml: this.parseLaTeX(item.subName),
          formulaHtml: this.parseLaTeX(item.formula), // 解析 LaTeX 公式
          collectionType: currentTab === 'math' ? '高数' : (currentTab === 'xiandai' ? '线代' : '概率论') // 添加集合类型标识
        }));

        // 更新公式列表
        this.setData({
          formulas: this.data.formulas.concat(newFormulas),
          isLoading: false,
          hasMore: res.data.length === pageSize, // 判断是否还有更多数据
        });
      })
      .catch((err) => {
        console.error("加载数据失败", err);
        this.setData({ isLoading: false });
      });
  },

  // 解析 LaTeX 公式
  parseLaTeX(latex) {
    try {
      return parse(latex, katexOption);
    } catch (err) {
      console.error("LaTeX 解析失败", err);
      return latex; // 解析失败时返回原始 LaTeX
    }
  },

  // 搜索功能
  onInput(e) {
    const keyword = e.detail.value;
    this.setData({
      keyword: keyword,
      formulas: [], // 清空当前列表
      page: 1, // 重置页码
      hasMore: true, // 重置是否有更多数据
    });
    this.loadFormulas();
  },

  // 下拉加载更多
  onReachBottom() {
    if (this.data.hasMore) {
      this.setData({ page: this.data.page + 1 });
      this.loadFormulas();
    }
  },

  // 切换记忆模式（隐藏/显示公式内容）
  toggleMemoryMode(e) {
    const formulaId = e.currentTarget.dataset.id;
    const formulas = this.data.formulas.map((item) => {
      if (item._id === formulaId) {
        item.hideContent = !item.hideContent;
      }
      return item;
    });
    this.setData({ formulas: formulas });
  },

  // 切换收藏状态
  async toggleFavorite(e) {
    const formulaId = e.currentTarget.dataset.id;
    let favoriteIds = this.data.favoriteIds;
    const isFavorite = favoriteIds.includes(formulaId);

    // 使用数据管理器更新收藏状态
    const success = await DataManager.updateFavorites(formulaId, !isFavorite, true);
    
    if (success) {
      // 更新本地状态
      if (!isFavorite) {
        favoriteIds.push(formulaId);
      } else {
        favoriteIds = favoriteIds.filter((id) => id !== formulaId);
      }

      // 更新页面数据
      const formulas = this.data.formulas.map((item) => {
        if (item._id === formulaId) {
          item.isFavorite = !isFavorite;
        }
        return item;
      });

      this.setData({
        formulas: formulas,
        favoriteIds: favoriteIds,
      });

      wx.showToast({
        title: isFavorite ? '取消收藏' : '添加收藏',
        icon: 'success',
        duration: 1000
      });
    } else {
      wx.showToast({
        title: '操作失败',
        icon: 'none'
      });
    }
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.setData({
      formulas: [], // 清空当前列表
      page: 1, // 重置页码
      hasMore: true, // 重置是否有更多数据
    });
    this.loadFormulas();
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1000);
  }
});