// components/header.js
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0';
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    userInfo : {
      type: Object,
      value: {
        avatarUrl: defaultAvatarUrl,
        nickName: '',
        observer: function(newVal, oldVal) {
        }
      }
    },
    hasUserInfo: {
      type: Boolean,
      value: false,
      observer: function(newVal, oldVal) {
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    userInfo: {
      avatarUrl: defaultAvatarUrl,
      nickName: '',
    },
    hasUserInfo: false,
    canIUseGetUserProfile: wx.canIUse('getUserProfile'),
    canIUseNicknameComp: wx.canIUse('input.type.nickname'),
    havsGetOpenId: false,
    openId:''
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onChooseAvatar(e) {
      const { avatarUrl } = e.detail
      const { nickName } = this.data.userInfo
      this.setData({
        "userInfo.avatarUrl": avatarUrl,
        hasUserInfo: nickName && avatarUrl && avatarUrl !== defaultAvatarUrl,
      })
    },
    onInputChange(e) {
      const nickName = e.detail.value
      const { avatarUrl } = this.data.userInfo
      this.setData({
        "userInfo.nickName": nickName,
        hasUserInfo: nickName && avatarUrl && avatarUrl !== defaultAvatarUrl,
      })
    },
    getUserProfile(e) {
      // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
      wx.getUserProfile({
        desc: '授权用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
        success: (res) => {
          console.log(res,'用户的信息')
          wx.setStorageSync('user',res.userInfo)
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
  
        }
      })
    },
    onChooseAvatar(e) {
      const { avatarUrl } = e.detail
      const { nickName } = this.data.userInfo
      wx.setStorageSync('user',{avatarUrl:avatarUrl, nickName: nickName})
      this.setData({
        "userInfo.avatarUrl": avatarUrl,
        hasUserInfo: nickName && avatarUrl && avatarUrl !== defaultAvatarUrl,
      })
    },
    onInputChange(e) {
      const nickName = e.detail.value
      const { avatarUrl } = this.data.userInfo
      wx.setStorageSync('user',{avatarUrl:avatarUrl, nickName: nickName})
      this.setData({
        "userInfo.nickName": nickName,
        hasUserInfo: nickName && avatarUrl && avatarUrl !== defaultAvatarUrl,
      })
    },

  },
});
