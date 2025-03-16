import parse from "@rojer/katex-mini";

const katexOption = {
  displayMode: true,
};
Page({
  data: {
    formulas: [], // 公式列表
    page: 1, // 当前页码
    pageSize: 5, // 每页加载的数量
    isLoading: false, // 是否正在加载
    hasMore: true, // 是否还有更多数据
    keyword: "", // 搜索关键词
  },

  onLoad() {
    // 页面加载时初始化数据
    this.loadFormulas();
  },

  // 从云数据库加载公式数据
  loadFormulas() {
    if (this.data.isLoading || !this.data.hasMore) return;

    this.setData({ isLoading: true });

    const db = wx.cloud.database();
    const { page, pageSize, keyword } = this.data;

    // 构建查询条件
    const query = {};
    if (keyword) {
      query.name = db.RegExp({
        regexp: keyword,
        options: "i", // 不区分大小写
      });
    }

    // 从云数据库获取数据
    db.collection("math2")
      .where(query)
      .skip((page - 1) * pageSize) // 跳过已加载的数据
      .limit(pageSize) // 每次加载 5 条
      .get()
      .then((res) => {
        const newFormulas = res.data.map((item) => ({
          ...item,
          hideContent: false,
          isFavorite: false,
          subNameHtml: this.parseLaTeX(item.subName),
          formulaHtml: this.parseLaTeX(item.formula), // 解析 LaTeX 公式
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
      return parse(latex, {
        throwError: true,
        ...katexOption,
      });
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
  toggleFavorite(e) {
    const formulaId = e.currentTarget.dataset.id;
    const formulas = this.data.formulas.map((item) => {
      if (item._id === formulaId) {
        item.isFavorite = !item.isFavorite;
      }
      return item;
    });
    this.setData({ formulas: formulas });
  },
});