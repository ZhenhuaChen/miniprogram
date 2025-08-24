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
    latexUrl: 'https://www.latexlive.com/',
    showSuccessModal: false,
    // 新增字段
    answerType: 'image',       // 'text' | 'image' - 默认为图片
    imageUrl: '',              // 预览图片URL
    tempImagePath: '',         // 临时图片路径
    uploading: false           // 上传状态
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
    const { name, subName, formula, answerType, imageUrl } = this.data;
    let formulaValid = false, subNameValid = false;
    
    // subName latex 校验
    try {
      subNameValid = !!subName && !!parse(subName, katexOption);
    } catch (e) {
      subNameValid = false;
    }
    
    // 答案校验 - 根据类型不同校验不同字段
    if (answerType === 'text') {
      try {
        formulaValid = !!formula && !!parse(formula, katexOption);
      } catch (e) {
        formulaValid = false;
      }
    } else if (answerType === 'image') {
      formulaValid = !!imageUrl;
    }
    
    const canSave = !!name && !!subName && formulaValid && subNameValid;
    this.setData({ formulaValid, subNameValid, canSave });
  },
  onPreview() {
    const { answerType, formula, subName, imageUrl } = this.data;
    let formulaHtml = '', subNameHtml = '';
    let formulaValid = true, subNameValid = true;
    
    // 提问预览
    try {
      subNameHtml = parse(subName, katexOption);
    } catch (e) {
      subNameValid = false;
    }
    
    // 答案预览 - 根据类型处理
    if (answerType === 'text') {
      try {
        formulaHtml = parse(formula, katexOption);
      } catch (e) {
        formulaValid = false;
      }
    } else if (answerType === 'image') {
      formulaValid = !!imageUrl;
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
      const { name, subName, formula, description, answerType, tempImagePath } = this.data;
      let imageFileId = '';
      
      // 如果是图片类型，先上传图片
      if (answerType === 'image' && tempImagePath) {
        // 获取openid用于文件路径
        const { result: { openid } } = await wx.cloud.callFunction({ 
          name: 'quickstartFunctions', 
          data: { type: 'getOpenId' } 
        });
        
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2, 11);
        const fileExtension = tempImagePath.split('.').pop() || 'jpg';
        const cloudPath = `custom-formula-images/${openid}/${timestamp}-${randomId}.${fileExtension}`;
        
        const uploadResult = await wx.cloud.uploadFile({
          cloudPath: cloudPath,
          filePath: tempImagePath
        });
        
        imageFileId = uploadResult.fileID;
      }
      
      // 保存到数据库
      await wx.cloud.callFunction({
        name: 'quickstartFunctions',
        data: {
          type: 'saveCustomFormula',
          name,
          subName,
          formula: answerType === 'text' ? formula : '',
          description,
          answerType,
          imageFileId
        }
      });
      
      wx.hideLoading();
      this.setData({ showSuccessModal: true });
    } catch (err) {
      wx.hideLoading();
      wx.showToast({ title: '保存失败', icon: 'none' });
      console.error('保存失败:', err);
    }
  },
  onNextFormula() {
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
      canSave: false,
      showSuccessModal: false,
      // 重置新增字段
      answerType: 'image',
      imageUrl: '',
      tempImagePath: '',
      uploading: false
    });
  },
  onGoToCustomList() {
    wx.switchTab({
      url: '/pages/customFormulaList/customFormulaList',
    });
  },

  // 答案类型切换
  onAnswerTypeChange(e) {
    const answerType = e.detail.value;
    this.setData({ 
      answerType,
      showPreview: false 
    });
    // 切换时清空对方数据
    if (answerType === 'text') {
      this.setData({ imageUrl: '', tempImagePath: '' });
    } else {
      this.setData({ formula: '' });
    }
    this.validateForm();
  },

  // 选择图片
  async onChooseImage() {
    if (this.data.uploading) {
      wx.showToast({ title: '正在处理中...', icon: 'none' });
      return;
    }

    this.setData({ uploading: true });
    
    try {
      // 第一步：选择图片（保持现有配置）
      const res = await wx.chooseImage({
        count: 1,
        sizeType: ['compressed'], // 基础压缩
        sourceType: ['album', 'camera']
      });
      
      let tempImagePath = res.tempFilePaths[0];
      
      // 第二步：检查文件大小
      const fileInfo = await wx.getFileInfo({ filePath: tempImagePath });
      console.log('原始文件大小:', (fileInfo.size / 1024).toFixed(2) + 'KB');

      // 第三步：如果超过200KB，使用wx.compressImage进一步压缩
      if (fileInfo.size > 200 * 1024) {
        wx.showLoading({ title: '压缩中...' });
        
        const compressResult = await this.compressImageWithRetry(tempImagePath);
        tempImagePath = compressResult.tempFilePath;
        
        // 显示压缩效果
        const compressedFileInfo = await wx.getFileInfo({ filePath: tempImagePath });
        console.log('压缩后大小:', (compressedFileInfo.size / 1024).toFixed(2) + 'KB');
        
        wx.hideLoading();
        wx.showToast({ 
          title: `压缩完成 ${(compressedFileInfo.size / 1024).toFixed(0)}KB`, 
          icon: 'success' 
        });
      }
      
      this.setData({ 
        tempImagePath,
        imageUrl: tempImagePath,
        uploading: false
      });
      this.validateForm();
      
    } catch (error) {
      console.error('选择图片失败:', error);
      wx.hideLoading();
      wx.showToast({ title: '选择图片失败', icon: 'none' });
      this.setData({ uploading: false });
    }
  },

  // 删除图片
  onDeleteImage() {
    this.setData({
      imageUrl: '',
      tempImagePath: ''
    });
    this.validateForm();
  },

  // 智能压缩函数 - 自动调整压缩质量
  async compressImageWithRetry(filePath, targetSize = 200 * 1024) {
    const qualities = [70, 50, 30, 20]; // 压缩质量梯度
    
    for (let quality of qualities) {
      try {
        const result = await new Promise((resolve, reject) => {
          wx.compressImage({
            src: filePath,
            quality: quality,
            success: resolve,
            fail: reject
          });
        });
        
        // 检查压缩后文件大小
        const fileInfo = await wx.getFileInfo({ filePath: result.tempFilePath });
        
        if (fileInfo.size <= targetSize) {
          return result; // 达到目标大小，返回结果
        }
        
        // 如果是最后一个质量等级，无论大小都返回
        if (quality === qualities[qualities.length - 1]) {
          return result;
        }
        
      } catch (error) {
        console.error(`压缩失败 quality=${quality}:`, error);
        continue;
      }
    }
    
    // 所有压缩都失败，返回原图
    return { tempFilePath: filePath };
  }
}); 