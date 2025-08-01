// pages/index/index.js
const app = getApp()

Page({
  data: {
    userInfo: {},
    currentDate: '',
    stats: {
      pendingDeliveries: 0,
      inProgressDeliveries: 0,
      totalProducts: 0,
      monthlyRevenue: 0
    },
    recentDeliveries: [],
    deliveryStatusText: app.globalData.deliveryStatusText
  },

  onLoad() {
    this.setCurrentDate()
    this.loadUserInfo()
    this.loadStats()
    this.loadRecentDeliveries()
  },

  onShow() {
    // 每次显示页面时刷新数据
    this.loadStats()
    this.loadRecentDeliveries()
  },

  // 设置当前日期
  setCurrentDate() {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1
    const date = now.getDate()
    const weekdays = ['日', '一', '二', '三', '四', '五', '六']
    const weekday = weekdays[now.getDay()]
    
    this.setData({
      currentDate: `${year}年${month}月${date}日 星期${weekday}`
    })
  },

  // 加载用户信息
  loadUserInfo() {
    const userInfo = app.globalData.userInfo
    if (userInfo) {
      this.setData({ userInfo })
    }
  },

  // 加载统计数据
  loadStats() {
    // 先使用模拟数据，避免云函数调用失败导致页面空白
    this.setData({
      stats: {
        pendingDeliveries: 5,
        inProgressDeliveries: 3,
        totalProducts: 25,
        monthlyRevenue: 15000
      }
    })
    
    // 注释掉云函数调用，先确保页面能正常显示
    /*
    app.request({
      url: '/statistics/getOverview'
    })
    .then(res => {
      if (res.success) {
        this.setData({
          stats: res.data
        })
      }
    })
    .catch(err => {
      console.error('加载统计数据失败:', err)
    })
    */
  },

  // 加载最近送货单
  loadRecentDeliveries() {
    // 先使用模拟数据，避免云函数调用失败导致页面空白
    this.setData({
      recentDeliveries: [
        {
          id: '1',
          deliveryNumber: 'DH20241201001',
          employeeName: '张三',
          status: 'pending',
          totalAmount: 1500
        },
        {
          id: '2',
          deliveryNumber: 'DH20241201002',
          employeeName: '李四',
          status: 'in_progress',
          totalAmount: 2300
        }
      ]
    })
    
    // 注释掉云函数调用，先确保页面能正常显示
    /*
    app.request({
      url: '/delivery/getRecentDeliveries'
    })
    .then(res => {
      if (res.success) {
        this.setData({
          recentDeliveries: res.data
        })
      }
    })
    .catch(err => {
      console.error('加载最近送货单失败:', err)
    })
    */
  },

  // 导航到送货单列表
  navigateToDelivery(e) {
    const status = e.currentTarget.dataset.status
    wx.switchTab({
      url: '/pages/delivery/delivery'
    })
  },

  // 导航到创建送货单
  navigateToCreateDelivery() {
    wx.navigateTo({
      url: '/pages/create-delivery/create-delivery'
    })
  },

  // 导航到商品管理
  navigateToProducts() {
    wx.switchTab({
      url: '/pages/products/products'
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

  // 导航到数据统计
  navigateToStatistics() {
    wx.switchTab({
      url: '/pages/statistics/statistics'
    })
  },

  // 导航到送货单详情
  navigateToDeliveryDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/delivery-detail/delivery-detail?id=${id}`
    })
  }
}) 