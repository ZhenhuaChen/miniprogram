// pages/chapters/chapters.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        chapters:[{
            title: '等价无穷小',
            progress: 50,
            id: 1
        },
        {
            title: '基本求导公式',
            progress: 0.5,
            id: 2
        },
        {
            title: '莱布尼兹公式',
            progress: 0.5,
            id: 3
        },
        {
            title: '复合求导',
            progress: 0.5,
            id: 4
        },
        {
            title: '反函数求导',
            progress: 0.5,
            id: 5
        },
        ]

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {

    },
    onChapterTap(e){
        const id = e.currentTarget.dataset.id;
        console.log(id, 'iioooo')
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