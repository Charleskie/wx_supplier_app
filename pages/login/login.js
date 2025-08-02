// pages/login/login.js
const app = getApp()

Page({
  data: {
    phone: '',
    password: '',
    loading: false
  },

  onLoad() {
    console.log('登录页面加载')
  },

  onShow() {
    console.log('登录页面显示')
  },

  // 手机号输入
  onPhoneInput(e) {
    this.setData({
      phone: e.detail.value
    })
  },

  // 密码输入
  onPasswordInput(e) {
    this.setData({
      password: e.detail.value
    })
  },

  // 处理登录
  handleLogin() {
    const { phone, password } = this.data
    
    if (!phone || !password) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      })
      return
    }

    this.setData({ loading: true })

    // 模拟登录
    setTimeout(() => {
      app.globalData.token = 'mock-token'
      app.globalData.userInfo = {
        name: '测试用户',
        phone: phone
      }
      wx.setStorageSync('token', 'mock-token')
      wx.setStorageSync('userInfo', {
        name: '测试用户',
        phone: phone
      })
      
      wx.showToast({
        title: '登录成功',
        icon: 'success'
      })
      
      setTimeout(() => {
        wx.switchTab({
          url: '/pages/index/index'
        })
      }, 1500)
      
      this.setData({ loading: false })
    }, 1000)
  }
}) 