// pages/profile/profile.js
const app = getApp()

Page({
  data: {
    userInfo: {},
    userStats: {},
    version: '1.0.0'
  },

  onLoad() {
    this.loadUserInfo()
    this.loadUserStats()
  },

  onShow() {
    // 刷新用户信息
    this.loadUserInfo()
    this.loadUserStats()
  },

  // 加载用户信息
  loadUserInfo() {
    const userInfo = app.globalData.userInfo
    if (userInfo) {
      this.setData({ userInfo })
    }
  },

  // 加载用户统计
  loadUserStats() {
    app.request({
      url: '/user/stats'
    })
    .then(res => {
      if (res.success) {
        this.setData({
          userStats: res.data
        })
      }
    })
    .catch(err => {
      console.error('加载用户统计失败:', err)
    })
  },

  // 导航到客户管理
  navigateToCustomers() {
    wx.navigateTo({
      url: '/pages/customers/customers'
    })
  },

  // 导航到员工管理
  navigateToEmployees() {
    wx.navigateTo({
      url: '/pages/employees/employees'
    })
  },

  // 导航到系统设置
  navigateToSettings() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    })
  },

  // 导航到帮助中心
  navigateToHelp() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    })
  },

  // 导航到关于我们
  navigateToAbout() {
    wx.showModal({
      title: '关于我们',
      content: '供应商订单管理系统 v1.0.0\n\n本系统致力于为供应商提供高效的订单管理解决方案。\n\n如有问题请联系技术支持。',
      showCancel: false,
      confirmText: '确定'
    })
  },

  // 处理意见反馈
  handleFeedback() {
    wx.showModal({
      title: '意见反馈',
      content: '感谢您的反馈！\n\n请通过以下方式联系我们：\n邮箱：support@example.com\n电话：400-123-4567',
      showCancel: false,
      confirmText: '确定'
    })
  },

  // 处理退出登录
  handleLogout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      confirmText: '退出',
      confirmColor: '#FF4757',
      success: (res) => {
        if (res.confirm) {
          app.logout()
        }
      }
    })
  }
}) 