// pages/statistics/statistics.js
const app = getApp()

Page({
  data: {
    currentMonth: '',
    stats: {},
    employeeStats: [],
    customerStats: [],
    trendData: []
  },

  onLoad() {
    this.setCurrentMonth()
    this.loadStatistics()
    this.loadEmployeeStats()
    this.loadCustomerStats()
    this.loadTrendData()
  },

  onShow() {
    // 刷新统计数据
    this.loadStatistics()
    this.loadEmployeeStats()
    this.loadCustomerStats()
    this.loadTrendData()
  },

  // 设置当前月份
  setCurrentMonth() {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    this.setData({
      currentMonth: `${year}-${month}`
    })
  },

  // 月份选择
  onMonthChange(e) {
    this.setData({
      currentMonth: e.detail.value
    })
    this.loadStatistics()
    this.loadEmployeeStats()
    this.loadCustomerStats()
    this.loadTrendData()
  },

  // 加载统计数据
  loadStatistics() {
    app.request({
      url: '/statistics/getOverview',
      data: {
        month: this.data.currentMonth
      }
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
  },

  // 加载员工统计
  loadEmployeeStats() {
    app.request({
      url: '/statistics/getEmployeeStats',
      data: {
        month: this.data.currentMonth
      }
    })
    .then(res => {
      if (res.success) {
        this.setData({
          employeeStats: res.data
        })
      }
    })
    .catch(err => {
      console.error('加载员工统计失败:', err)
    })
  },

  // 加载客户统计
  loadCustomerStats() {
    app.request({
      url: '/statistics/getCustomerStats',
      data: {
        month: this.data.currentMonth
      }
    })
    .then(res => {
      if (res.success) {
        this.setData({
          customerStats: res.data
        })
      }
    })
    .catch(err => {
      console.error('加载客户统计失败:', err)
    })
  },

  // 加载趋势数据
  loadTrendData() {
    app.request({
      url: '/statistics/getTrendData',
      data: {
        month: this.data.currentMonth
      }
    })
    .then(res => {
      if (res.success) {
        this.setData({
          trendData: res.data
        })
        this.drawTrendChart()
      }
    })
    .catch(err => {
      console.error('加载趋势数据失败:', err)
    })
  },

  // 绘制趋势图表
  drawTrendChart() {
    const ctx = wx.createCanvasContext('trendChart')
    const { trendData } = this.data
    
    if (!trendData || trendData.length === 0) return

    // 获取画布尺寸
    const query = wx.createSelectorQuery()
    query.select('.chart-canvas').boundingClientRect((rect) => {
      const canvasWidth = rect.width
      const canvasHeight = 200
      
      // 计算数据范围
      const maxValue = Math.max(...trendData.map(item => item.amount))
      const minValue = 0
      
      // 绘制坐标轴
      ctx.setStrokeStyle('#E0E0E0')
      ctx.setLineWidth(1)
      
      // X轴
      ctx.moveTo(40, canvasHeight - 30)
      ctx.lineTo(canvasWidth - 20, canvasHeight - 30)
      
      // Y轴
      ctx.moveTo(40, 20)
      ctx.lineTo(40, canvasHeight - 30)
      ctx.stroke()
      
      // 绘制数据点
      ctx.setStrokeStyle('#3A7FFF')
      ctx.setLineWidth(2)
      ctx.setFillStyle('#3A7FFF')
      
      trendData.forEach((item, index) => {
        const x = 40 + (index * (canvasWidth - 60) / (trendData.length - 1))
        const y = canvasHeight - 30 - ((item.amount - minValue) / (maxValue - minValue)) * (canvasHeight - 50)
        
        if (index === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
        
        // 绘制数据点
        ctx.beginPath()
        ctx.arc(x, y, 3, 0, 2 * Math.PI)
        ctx.fill()
        
        // 绘制日期标签
        ctx.setFillStyle('#666666')
        ctx.setFontSize(20)
        ctx.fillText(item.date, x - 15, canvasHeight - 10)
      })
      
      ctx.stroke()
      ctx.draw()
    }).exec()
  },

  // 导航到员工详情
  navigateToEmployeeDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/employee-detail/employee-detail?id=${id}`
    })
  },

  // 导航到客户详情
  navigateToCustomerDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/customer-detail/customer-detail?id=${id}`
    })
  },

  // 下拉刷新
  onPullDownRefresh() {
    Promise.all([
      this.loadStatistics(),
      this.loadEmployeeStats(),
      this.loadCustomerStats(),
      this.loadTrendData()
    ]).finally(() => {
      wx.stopPullDownRefresh()
    })
  }
}) 