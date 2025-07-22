import parse from "@rojer/katex-mini";
const katexOption = { throwError: true };
Page({
  data: {
    formulaMap: [],
    currentIndex: 0,
    formula: {},
    nodes: [],
    showAnswer: false,
    finish: false,
    subName: '',
    description: '',
    needMorePractice: false,
    isEmpty: false
  },
  async onLoad() {
    console.log('自制公式测试')
    wx.showLoading({ title: '加载中' });
    // 获取当前用户openid
    const { result: { openid } } = await wx.cloud.callFunction({ name: 'quickstartFunctions', data: { type: 'getOpenId' } });
    // 查询自制公式集合
    const db = wx.cloud.database();
    const res = await db.collection('customFormulas').where({ openid }).get();
    const data = res.data || [];
    if (data.length === 0) {
      this.setData({ isEmpty: true });
      wx.hideLoading();
      return;
    }
    // 初始化第一个公式
    const formula = data[0];
    this.setData({
      formulaMap: data,
      formula,
      subName: formula.subName ? parse(formula.subName, katexOption) : '',
      description: formula.description ? parse(formula.description, katexOption) : '',
      currentIndex: 0,
      showAnswer: false,
      finish: false,
      isEmpty: false
    });
    wx.hideLoading();
  },
  handleShowAnswer() {
    this.setData({
      showAnswer: true,
      nodes: parse(this.data.formula.formula, katexOption),
    });
  },
  handleNo() {
    this.setData({ needMorePractice: true });
    this.handleShowAnswer();
  },
  handleYes() {
    this.handleShowAnswer();
  },
  handleNext(event) {
    this.setData({ needMorePractice: false });
    const param = event?.currentTarget?.dataset?.param;
    if (param === 'restart') {
      this.setData({
        currentIndex: 0,
        formula: this.data.formulaMap[0],
        showAnswer: false,
        finish: false,
        subName: this.data.formulaMap[0].subName ? parse(this.data.formulaMap[0].subName, katexOption) : '',
        description: this.data.formulaMap[0].description ? parse(this.data.formulaMap[0].description, katexOption) : ''
      });
    } else {
      if (this.data.currentIndex < this.data.formulaMap.length - 1) {
        const tempIndex = this.data.currentIndex + 1;
        this.setData({
          currentIndex: tempIndex,
          formula: this.data.formulaMap[tempIndex],
          showAnswer: false,
          subName: this.data.formulaMap[tempIndex].subName ? parse(this.data.formulaMap[tempIndex].subName, katexOption) : '',
          description: this.data.formulaMap[tempIndex].description ? parse(this.data.formulaMap[tempIndex].description, katexOption) : '',
          finish: false
        });
      } else {
        this.setData({ finish: true });
      }
    }
  },
  goToDiy() {
    console.log('goToDiy')
    wx.switchTab({
      url: '/pages/customFormula/customFormula',
    });
  }
}); 