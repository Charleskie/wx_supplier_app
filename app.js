// app.js
App({
  globalData: {
    userInfo: null,
    token: null,
    baseUrl: 'https://your-api-domain.com/api', // 替换为您的API地址
    deliveryStatus: {
      PENDING: 'pending',
      IN_PROGRESS: 'in_progress',
      COMPLETED: 'completed',
      CANCELLED: 'cancelled'
    },
    deliveryStatusText: {
      pending: '待配送',
      in_progress: '配送中',
      completed: '已完成',
      cancelled: '已取消'
    },
    orderStatus: {
      PENDING: 'pending',
      CONFIRMED: 'confirmed',
      SHIPPED: 'shipped',
      DELIVERED: 'delivered',
      CANCELLED: 'cancelled'
    },
    orderStatusText: {
      pending: '待确认',
      confirmed: '已确认',
      shipped: '已发货',
      delivered: '已送达',
      cancelled: '已取消'
    }
  },

  onLaunch() {
    console.log('小程序启动')
    
    // 初始化云开发
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'cloud1-1gcilb17efc69c36', // 替换为你的云开发环境ID
        traceUser: true,
      })
    }
    
    this.checkLogin()
  },

  onShow() {
    console.log('小程序显示')
  },

  onHide() {
    console.log('小程序隐藏')
  },

  // 检查登录状态
  checkLogin() {
    const token = wx.getStorageSync('token')
    if (token) {
      this.globalData.token = token
      this.getUserInfo()
      // 如果已登录，直接进入首页
      wx.reLaunch({
        url: '/pages/index/index'
      })
    }
    // 如果未登录，不需要跳转，因为登录页面已经是首页了
  },

  // 获取用户信息
  getUserInfo() {
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      this.globalData.userInfo = userInfo
    }
  },

  // 登录
  login(phone, password) {
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: 'login',
        data: {
          phone,
          password
        },
        success: (res) => {
          if (res.result && res.result.success) {
            const { token, userInfo } = res.result.data
            this.globalData.token = token
            this.globalData.userInfo = userInfo
            wx.setStorageSync('token', token)
            wx.setStorageSync('userInfo', userInfo)
            resolve(res.result)
          } else {
            reject(res.result?.message || '登录失败')
          }
        },
        fail: reject
      })
    })
  },

  // 退出登录
  logout() {
    this.globalData.token = null
    this.globalData.userInfo = null
    wx.removeStorageSync('token')
    wx.removeStorageSync('userInfo')
    wx.redirectTo({
      url: '/pages/login/login'
    })
  },

  // 通用请求方法 - 云函数版本
  request(options) {
    return new Promise((resolve, reject) => {
      // 解析URL路径，例如：/delivery/getDeliveries -> delivery, getDeliveries
      const urlParts = options.url.split('/').filter(part => part)
      const functionName = urlParts[0] // 云函数名称
      const action = urlParts[1] // 操作名称
      
      wx.cloud.callFunction({
        name: functionName,
        data: {
          action: action,
          data: options.data || {}
        },
        success: (res) => {
          if (res.result && res.result.success) {
            resolve(res.result)
          } else {
            reject(res.result?.message || '请求失败')
          }
        },
        fail: reject
      })
    })
  }
}) 