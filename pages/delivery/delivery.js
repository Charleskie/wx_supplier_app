// pages/delivery/delivery.js
const app = getApp()

Page({
  data: {
    deliveries: [],
    searchKeyword: '',
    currentStatus: '',
    page: 1,
    pageSize: 20,
    hasMore: true,
    loading: false,
    deliveryStatusText: app.globalData.deliveryStatusText
  },

  onLoad() {
    this.loadDeliveries()
  },

  onShow() {
    // 刷新送货单列表
    this.setData({
      page: 1,
      deliveries: [],
      hasMore: true
    })
    this.loadDeliveries()
  },

  // 搜索输入
  onSearchInput(e) {
    this.setData({
      searchKeyword: e.detail.value
    })
  },

  // 执行搜索
  handleSearch() {
    this.setData({
      page: 1,
      deliveries: [],
      hasMore: true
    })
    this.loadDeliveries()
  },

  // 按状态筛选
  filterByStatus(e) {
    const status = e.currentTarget.dataset.status
    this.setData({
      currentStatus: status,
      page: 1,
      deliveries: [],
      hasMore: true
    })
    this.loadDeliveries()
  },

  // 加载送货单列表
  loadDeliveries() {
    if (this.data.loading) return

    this.setData({ loading: true })

    const params = {
      page: this.data.page,
      pageSize: this.data.pageSize,
      keyword: this.data.searchKeyword,
      status: this.data.currentStatus
    }

    app.request({
      url: '/delivery/getDeliveries',
      data: params
    })
    .then(res => {
      if (res.success) {
        const { deliveries, total } = res.data
        const newDeliveries = this.data.page === 1 ? deliveries : [...this.data.deliveries, ...deliveries]
        
        this.setData({
          deliveries: newDeliveries,
          hasMore: newDeliveries.length < total
        })
      }
    })
    .catch(err => {
      wx.showToast({
        title: err || '加载失败',
        icon: 'none'
      })
    })
    .finally(() => {
      this.setData({ loading: false })
    })
  },

  // 加载更多
  loadMore() {
    if (this.data.hasMore && !this.data.loading) {
      this.setData({
        page: this.data.page + 1
      })
      this.loadDeliveries()
    }
  },

  // 导航到送货单详情
  navigateToDeliveryDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/delivery-detail/delivery-detail?id=${id}`
    })
  },

  // 导航到创建送货单
  navigateToCreateDelivery() {
    wx.navigateTo({
      url: '/pages/delivery-detail/delivery-detail'
    })
  },

  // 编辑送货单
  handleEditDelivery(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/delivery-detail/delivery-detail?id=${id}`
    })
  },

  // 开始配送
  handleStartDelivery(e) {
    const id = e.currentTarget.dataset.id
    
    wx.showModal({
      title: '开始配送',
      content: '确定要开始配送这个送货单吗？',
      success: (res) => {
        if (res.confirm) {
          this.updateDeliveryStatus(id, 'in_progress')
        }
      }
    })
  },

  // 完成配送
  handleCompleteDelivery(e) {
    const id = e.currentTarget.dataset.id
    
    wx.showModal({
      title: '完成配送',
      content: '确定要完成这个送货单的配送吗？',
      success: (res) => {
        if (res.confirm) {
          this.updateDeliveryStatus(id, 'completed')
        }
      }
    })
  },

  // 取消送货单
  handleCancelDelivery(e) {
    const id = e.currentTarget.dataset.id
    
    wx.showModal({
      title: '取消送货单',
      content: '确定要取消这个送货单吗？取消后无法恢复。',
      confirmText: '取消',
      confirmColor: '#FF4757',
      success: (res) => {
        if (res.confirm) {
          this.updateDeliveryStatus(id, 'cancelled')
        }
      }
    })
  },

  // 更新送货单状态
  updateDeliveryStatus(id, status) {
    app.request({
      url: '/delivery/updateDeliveryStatus',
      data: { id, status }
    })
    .then(res => {
      if (res.success) {
        wx.showToast({
          title: '操作成功',
          icon: 'success'
        })
        
        // 重新加载送货单列表
        this.setData({
          page: 1,
          deliveries: [],
          hasMore: true
        })
        this.loadDeliveries()
      }
    })
    .catch(err => {
      wx.showToast({
        title: err || '操作失败',
        icon: 'none'
      })
    })
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.setData({
      page: 1,
      deliveries: [],
      hasMore: true
    })
    this.loadDeliveries().finally(() => {
      wx.stopPullDownRefresh()
    })
  },

  // 上拉加载更多
  onReachBottom() {
    this.loadMore()
  }
}) 