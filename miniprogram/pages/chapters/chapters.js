// pages/chapters/chapters.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        mathChapters:[{
            title: '极限公式',
            total: 6,
            progress: 0,
            type: 1
        },
        {
            title: '等价无穷小',
            total: 8,
            progress: 0,
            type: 2
        },
        {
            title: '基本求导公式',
            total: 16,
            progress: 0,
            type: 3
        },
        {
            title: '莱布尼茨公式',
            total: 1,
            progress: 0,
            type: 4
        },
        {
            title: '复合函数求导',
            total: 1,
            progress: 0,
            type: 5
        },
        {
            title: '反函数求导',
            total: 1,
            progress: 0,
            type: 6
        },
        {
            title: '参数方程求导',
            total: 1,
            progress: 0,
            type: 7
        },
        {
            title: '麦克劳林公式',
            total: 5,
            progress: 0,  
            type: 8
        },
        {
            title: '渐近线',
            total: 3,
            progress: 0,
            type: 9
        },
        {
            title: '曲率与曲率半径',
            total: 2,
            progress: 0,
            type: 10
        },
        {
            title: '积分公式',
            total: 22,
            progress: 0,
            type: 11
        },
        {
            title: '变限积分求导',
            total: 1,
            progress: 0,
            type: 12
        },
        {
            title: '定积分的常用结论',
            total: 3,
            progress: 0,
            type: 13
        },
        {
            title: '敛散性判别法',
            total: 3,
            progress: 0,
            type: 14
        },
        {
            title: '定积分的应用',
            total: 5,
            progress: 0,
            type: 15
        },
        {
            title: '弧长公式',
            total: 3,
            progress: 0,
            type: 16
        },
        {
            title: '旋转体侧面积',
            total: 1,
            progress: 0,
            type: 17
        },
        {
            title: '质心公式',
            total: 4,
            progress: 0,
            type: 18
        },
        {
            title: ' 二元函数极值问题',
            total: 3,
            progress: 0,
            type: 19
        },
        {
            title: '二重积分',
            total: 6,
            progress: 0,
            type: 20
        },
        {
            title: '可分离变量',
            total: 3,
            progress: 0,
            type: 21
        },
        {
            title: '齐次方程',
            total: 3,
            progress: 0,              
            type: 22
        },
        {
            title: '一阶线性微分方程',
            total: 2,
            progress: 0,  
            type: 23
        },
        {
            title: '二阶常系数齐次微分方程',
            total: 5,
            progress: 0,
            type: 24
        }, 
        {
            title: '二阶常系数非齐次微分方程',
            total: 4,
            progress: 0,
            type: 25
        }
        ],
        xdChapters: [{
            title: '行列式',
            total: 13,
            progress: 0,
            type: 101
        },
        {
            title: '矩阵',
            total: 56,
            progress: 0,
            type: 102
        },
        {
            title: '向量组',
            total: 26,
            progress: 0,
            type: 103
        },
         {
            title: '线性方程组',
            total: 34,
            progress: 0,
            type: 105
        }
        ],
        targetChapters: [],

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        console.log(options.cate, 'dddd')
        this.setData({
            cate: options.cate,
            targetChapters: options.cate === 'xiandai' ? this.data.xdChapters : this.data.mathChapters,
            storageKey: options.cate === 'xiandai' ? 'userXDProgress' : 'userProgress',
        })
    },
    onChapterTap(e){
        const storageKey = this.data.storageKey;
        const {type,progress} = e.currentTarget.dataset
        if(progress >= 100){
            // 如果进程已经完成，删除缓存中的对应type的数据
            wx.setStorageSync(storageKey, {
                ...wx.getStorageSync(storageKey),
                [`type_${type}`]: []
            });
        }
        if(this.data.cate === 'xiandai'){
            wx.navigateTo({
                url: `/pages/xiandai/xiandai?type=${type}`,
            });
        }else{
            wx.navigateTo({
                url: `/pages/quit/quit?type=${type}`,
            });
        }
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {
        console.log('章节数据', this.data.storageKey);
        const knownFormulas =  wx.getStorageSync(this.data.storageKey) || {}; 
        const progress = {};

        for (const type in knownFormulas) {
            const knownCount = knownFormulas[type].length; // 当前 type 已掌握的公式数量

            const totalCount = this.data.targetChapters.find((item) => item.type == type.split('_')[1])?.total || 0;

            const percentage = parseInt((knownCount / totalCount) * 100);
            progress[type] = percentage; // 存储当前 type 的掌握进度

            const chapterIndex = this.data.targetChapters.findIndex((item) => item.type == type.split('_')[1]);
            if (chapterIndex !== -1) {
                this.data.targetChapters[chapterIndex].progress = percentage;
            }
        }

        // 更新页面数据
        this.setData({
            targetChapters: this.data.targetChapters
        });

        console.log('掌握进度', progress);

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    }
})