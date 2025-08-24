import parse from "@rojer/katex-mini";
const katexOption = { throwError: true };
Page({
  data: {
    formulas: [],
    isLoading: true,
    isEmpty: false
  },
  async onShow() {
    await this.loadFormulas();
  },
  async loadFormulas() {
    this.setData({ isLoading: true });
    // 获取 openid
    const { result: { openid } } = await wx.cloud.callFunction({ name: 'quickstartFunctions', data: { type: 'getOpenId' } });
    const db = wx.cloud.database();
    const res = await db.collection('customFormulas').where({ openid }).get();
    const data = res.data || [];
    this.setData({
      formulas: data.map(item => ({
        ...item,
        subNameHtml: parse(item.subName, katexOption),
        // 只有文本类型的答案才解析LaTeX
        formulaHtml: item.answerType === 'text' ? parse(item.formula, katexOption) : ''
      })),
      isLoading: false,
      isEmpty: data.length === 0
    });
  },
  async onDelete(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认删除',
      content: '确定要删除该自制公式吗？',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '删除中...' });
          try {
            const result = await wx.cloud.callFunction({
              name: 'quickstartFunctions',
              data: {
                type: 'deleteCustomFormula',
                id
              }
            });
            wx.hideLoading();
            if (result.result && result.result.success) {
              wx.showToast({ title: '删除成功', icon: 'success' });
              this.loadFormulas();
            } else {
              wx.showToast({ title: result.result.error || '删除失败', icon: 'none' });
            }
          } catch (err) {
            wx.hideLoading();
            wx.showToast({ title: '删除失败', icon: 'none' });
          }
        }
      }
    });
  },
  goToDiy() {
    wx.navigateTo({
      url: '/pages/customFormula/customFormula',
    });
  },
  
  // 预览图片
  onPreviewImage(e) {
    const src = e.currentTarget.dataset.src;
    wx.previewImage({
      current: src,
      urls: [src]
    });
  },

  // 跳转到测试页面
  goToTest() {
    wx.navigateTo({
      url: '/pages/customFormulaTest/customFormulaTest'
    });
  }
}); 