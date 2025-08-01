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
    // 检查是否已登录
    if (app.globalData.token) {
      console.log('已登录，跳转到首页')
      wx.switchTab({
        url: '/pages/index/index'
      })
    } else {
      console.log('未登录，显示登录页面')
    }
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
    console.log('开始登录')
    const { phone, password } = this.data
    
    if (!phone || !password) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      })
      return
    }

    if (!/^1[3-9]\d{9}$/.test(phone)) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      })
      return
    }

    this.setData({ loading: true })

    // 先测试简单的登录逻辑
    console.log('登录信息:', { phone, password })
    
    // 模拟登录成功
    setTimeout(() => {
      console.log('模拟登录成功')
      wx.showToast({
        title: '登录成功',
        icon: 'success'
      })
      
      setTimeout(() => {
        wx.reLaunch({
          url: '/pages/index/index'
        })
      }, 1500)
    }, 1000)
    
    // 注释掉云函数调用，先测试页面跳转
    /*
    app.login(phone, password)
      .then(res => {
        wx.showToast({
          title: '登录成功',
          icon: 'success'
        })
        
        setTimeout(() => {
          wx.switchTab({
            url: '/pages/index/index'
          })
        }, 1500)
      })
      .catch(err => {
        wx.showToast({
          title: err || '登录失败',
          icon: 'none'
        })
      })
      .finally(() => {
        this.setData({ loading: false })
      })
    */
  }
}) 