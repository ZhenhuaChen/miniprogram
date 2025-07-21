// miniprogram/pages/customFormula/customFormula.js
import parse from "@rojer/katex-mini";
const katexOption = { throwError: true };
Page({
  data: {
    name: '',
    subName: '',
    formula: '',
    description: '',
    showPreview: false,
    formulaValid: false,
    subNameValid: false,
    subNameHtml: '',
    formulaHtml: '',
    canSave: false,
    latexUrl: 'https://www.latexlive.com/'
  },
  onInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ [field]: e.detail.value }, this.validateForm);
    if (field === 'formula' || field === 'subName') {
      this.setData({ showPreview: false });
    }
  },
  onCopyLatexUrl() {
    wx.setClipboardData({
      data: this.data.latexUrl,
      success: () => {
        wx.showToast({ title: '已复制', icon: 'success' });
      },
      fail: () => {
        wx.showToast({ title: '复制失败', icon: 'none' });
      }
    });
  },
  validateForm() {
    // 必填校验
    const { name, subName, formula } = this.data;
    let formulaValid = false, subNameValid = false;
    // latex 校验
    try {
      formulaValid = !!formula && !!parse(formula, katexOption);
    } catch (e) {
      formulaValid = false;
    }
    try {
      subNameValid = !!subName && !!parse(subName, katexOption);
    } catch (e) {
      subNameValid = false;
    }
    const canSave = !!name && !!subName && !!formula && formulaValid && subNameValid;
    this.setData({ formulaValid, subNameValid, canSave });
  },
  onPreview() {
    let formulaHtml = '', subNameHtml = '';
    let formulaValid = true, subNameValid = true;
    try {
      formulaHtml = parse(this.data.formula, katexOption);
    } catch (e) {
      formulaValid = false;
    }
    try {
      subNameHtml = parse(this.data.subName, katexOption);
    } catch (e) {
      subNameValid = false;
    }
    if (!formulaValid || !subNameValid) {
      wx.showToast({ title: '公式或提问不合法', icon: 'none' });
    }
    this.setData({
      showPreview: formulaValid && subNameValid,
      formulaValid,
      subNameValid,
      formulaHtml,
      subNameHtml
    }, this.validateForm);
  },
  async onSubmit(e) {
    if (!this.data.canSave) {
      wx.showToast({ title: '请填写完整且合法的内容', icon: 'none' });
      return;
    }
    wx.showLoading({ title: '保存中...' });
    try {
      await wx.cloud.callFunction({
        name: 'quickstartFunctions',
        data: {
          type: 'saveCustomFormula',
          name: this.data.name,
          subName: this.data.subName,
          formula: this.data.formula,
          description: this.data.description
        }
      });
      wx.hideLoading();
      wx.showToast({ title: '保存成功', duration: 2000 });
      this.setData({
        name: '',
        subName: '',
        formula: '',
        description: '',
        showPreview: false,
        formulaValid: false,
        subNameValid: false,
        formulaHtml: '',
        subNameHtml: '',
        canSave: false
      });
    } catch (err) {
        console.log(err,'iiiooo');
      wx.hideLoading();
      wx.showToast({ title: '保存失败', icon: 'none' });
    }
  }
}); 