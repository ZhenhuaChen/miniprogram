const DataManager = require('../../utils/dataManager');

Page({
  data: {
    totalPoints: 0,
    resources: [
      { id: '2009', title: '2009年408真题及答案', year: '2009', points: 10, icon: '📄', url: 'cloud://cloud1-8gd6vytq5ac1936a.636c-cloud1-8gd6vytq5ac1936a-1347245059/408exam/2009408.pdf' },
      { id: '2010', title: '2010年408真题及答案', year: '2010', points: 10, icon: '📄', url: 'cloud://cloud1-8gd6vytq5ac1936a.636c-cloud1-8gd6vytq5ac1936a-1347245059/408exam/2010408.pdf' },
      { id: '2011', title: '2011年408真题及答案', year: '2011', points: 10, icon: '📄', url: 'cloud://cloud1-8gd6vytq5ac1936a.636c-cloud1-8gd6vytq5ac1936a-1347245059/408exam/2011408.pdf' },
      { id: '2012', title: '2012年408真题及答案', year: '2012', points: 10, icon: '📄', url: 'cloud://cloud1-8gd6vytq5ac1936a.636c-cloud1-8gd6vytq5ac1936a-1347245059/408exam/2012408.pdf' },
      { id: '2013', title: '2013年408真题及答案', year: '2013', points: 10, icon: '📄', url: 'cloud://cloud1-8gd6vytq5ac1936a.636c-cloud1-8gd6vytq5ac1936a-1347245059/408exam/2013408.pdf' },
      { id: '2014', title: '2014年408真题及答案', year: '2014', points: 10, icon: '📄', url: 'cloud://cloud1-8gd6vytq5ac1936a.636c-cloud1-8gd6vytq5ac1936a-1347245059/408exam/2014408.pdf' },
      { id: '2015', title: '2015年408真题及答案', year: '2015', points: 10, icon: '📄', url: 'cloud://cloud1-8gd6vytq5ac1936a.636c-cloud1-8gd6vytq5ac1936a-1347245059/408exam/2015408.pdf' },
      { id: '2016', title: '2016年408真题及答案', year: '2016', points: 10, icon: '📄', url: 'cloud://cloud1-8gd6vytq5ac1936a.636c-cloud1-8gd6vytq5ac1936a-1347245059/408exam/2016408.pdf' },
      { id: '2017', title: '2017年408真题及答案', year: '2017', points: 10, icon: '📄', url: 'cloud://cloud1-8gd6vytq5ac1936a.636c-cloud1-8gd6vytq5ac1936a-1347245059/408exam/2017408.pdf' },
      { id: '2018', title: '2018年408真题及答案', year: '2018', points: 10, icon: '📄', url: 'cloud://cloud1-8gd6vytq5ac1936a.636c-cloud1-8gd6vytq5ac1936a-1347245059/408exam/2018408.pdf' },
      { id: '2019', title: '2019年408真题及答案', year: '2019', points: 10, icon: '📄', url: 'cloud://cloud1-8gd6vytq5ac1936a.636c-cloud1-8gd6vytq5ac1936a-1347245059/408exam/2019408.pdf' },
      { id: '2020', title: '2020年408真题及答案', year: '2020', points: 10, icon: '📄', url: 'cloud://cloud1-8gd6vytq5ac1936a.636c-cloud1-8gd6vytq5ac1936a-1347245059/408exam/2020408.pdf' },
      { id: '2021', title: '2021年408真题及答案', year: '2021', points: 10, icon: '📄', url: 'cloud://cloud1-8gd6vytq5ac1936a.636c-cloud1-8gd6vytq5ac1936a-1347245059/408exam/2021408.pdf' },
      { id: '202201', title: '2022年408真题', year: '2022', points: 10, icon: '📄', url: 'cloud://cloud1-8gd6vytq5ac1936a.636c-cloud1-8gd6vytq5ac1936a-1347245059/408exam/2022408真题.pdf' },
      { id: '202202', title: '2022年408答案', year: '2022', points: 10, icon: '📄', url: 'cloud://cloud1-8gd6vytq5ac1936a.636c-cloud1-8gd6vytq5ac1936a-1347245059/408exam/2022408解析.pdf' },
      { id: '202301', title: '2023年408真题', year: '2023', points: 10, icon: '📄', url: 'cloud://cloud1-8gd6vytq5ac1936a.636c-cloud1-8gd6vytq5ac1936a-1347245059/408exam/2023408真题.pdf' },
      { id: '202302', title: '2023年408答案', year: '2023', points: 10, icon: '📄', url: 'cloud://cloud1-8gd6vytq5ac1936a.636c-cloud1-8gd6vytq5ac1936a-1347245059/408exam/2023408解析.pdf' },
      { id: '202401', title: '2024年408真题', year: '2024', points: 10, icon: '📄', url: 'cloud://cloud1-8gd6vytq5ac1936a.636c-cloud1-8gd6vytq5ac1936a-1347245059/408exam/2024408真题.pdf' },
      { id: '202402', title: '2024年408答案', year: '2024', points: 10, icon: '📄', url: 'cloud://cloud1-8gd6vytq5ac1936a.636c-cloud1-8gd6vytq5ac1936a-1347245059/408exam/2024408解析.pdf' },
      { id: '202501', title: '2025年408真题', year: '2025', points: 10, icon: '📄', url: 'cloud://cloud1-8gd6vytq5ac1936a.636c-cloud1-8gd6vytq5ac1936a-1347245059/408exam/2025408真题.pdf' },
      { id: '202502', title: '2025年408答案', year: '2025', points: 10, icon: '📄', url: 'cloud://cloud1-8gd6vytq5ac1936a.636c-cloud1-8gd6vytq5ac1936a-1347245059/408exam/2025408解析.pdf' }
    ],
    showDownloadModal: false,
    selectedResource: null
  },

  onLoad: function () {
    this.loadData();
  },

  onShow: function () {
    this.refreshPoints();
  },

  // 加载数据
  loadData() {
    this.refreshPoints();
    this.updateDownloadStatus();
  },

  // 刷新积分
  refreshPoints() {
    const pointsData = DataManager.getPointsData();
    this.setData({
      totalPoints: pointsData.totalPoints
    });
  },

  // 更新下载状态
  updateDownloadStatus() {
    const resources = this.data.resources.map(resource => {
      return {
        ...resource,
        downloaded: DataManager.isResourceDownloaded(resource.id)
      };
    });
    this.setData({ resources });
  },

  // 显示下载确认弹窗
  showDownload(e) {
    const index = e.currentTarget.dataset.index;
    const resource = this.data.resources[index];

    // 检查是否已下载
    if (resource.downloaded) {
      this.downloadFile(resource);
      return;
    }

    // 检查积分是否足够
    if (this.data.totalPoints < resource.points) {
      wx.showToast({
        title: '积分不足',
        icon: 'none'
      });
      return;
    }

    this.setData({
      selectedResource: resource,
      showDownloadModal: true
    });
  },

  // 隐藏下载弹窗
  hideDownloadModal() {
    this.setData({
      showDownloadModal: false,
      selectedResource: null
    });
  },

  // 确认下载
  confirmDownload() {
    const resource = this.data.selectedResource;

    // 扣除积分
    const result = DataManager.deductPoints(resource.points, `下载${resource.title}`);

    if (!result.success) {
      wx.showToast({
        title: result.message || '下载失败',
        icon: 'none'
      });
      return;
    }

    // 记录下载
    DataManager.recordResourceDownload(resource.id, resource.title);

    // 下载文件
    this.downloadFile(resource);

    this.hideDownloadModal();
    this.refreshPoints();
    this.updateDownloadStatus();
  },

  // 下载文件
  downloadFile(resource) {
    wx.showLoading({ title: '准备下载...' });

    // 获取云文件临时链接
    wx.cloud.getTempFileURL({
      fileList: [resource.url],
      success: res => {
        if (res.fileList && res.fileList.length > 0) {
          const tempFileURL = res.fileList[0].tempFileURL;

          // 下载文件
          wx.downloadFile({
            url: tempFileURL,
            success: function (downloadRes) {
              wx.hideLoading();

              if (downloadRes.statusCode === 200) {
                // 打开文档
                wx.openDocument({
                  filePath: downloadRes.tempFilePath,
                  fileType: 'pdf',
                  success: function () {
                    wx.showToast({
                      title: '打开成功',
                      icon: 'success'
                    });
                  },
                  fail: function (err) {
                    console.error('打开文档失败:', err);
                    wx.showToast({
                      title: '打开失败',
                      icon: 'none'
                    });
                  }
                });
              }
            },
            fail: function (err) {
              wx.hideLoading();
              console.error('下载失败:', err);
              wx.showToast({
                title: '下载失败',
                icon: 'none'
              });
            }
          });
        } else {
          wx.hideLoading();
          wx.showToast({
            title: '获取文件失败',
            icon: 'none'
          });
        }
      },
      fail: err => {
        wx.hideLoading();
        console.error('获取临时链接失败:', err);
        wx.showToast({
          title: '下载失败',
          icon: 'none'
        });
      }
    });
  },

  // 跳转到积分页面
  goToPoints() {
    wx.navigateTo({
      url: '/pages/invite/invite'
    });
  },

  // 分享页面
  onShareAppMessage() {
    return {
      title: '408历年真题及答案，快来下载学习吧！',
      path: '/pages/resources/resources'
    };
  }
});
