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
      url: '/pages/create-delivery/create-delivery'
    })
  }
}) 