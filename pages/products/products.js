// pages/products/products.js
const app = getApp()

Page({
  data: {
    products: [],
    searchKeyword: '',
    page: 1,
    pageSize: 30, // 增加每页显示数量
    hasMore: true,
    loading: false
  },

  onLoad() {
    this.loadProducts()
  },

  onShow() {
    // 刷新商品列表
    this.setData({
      page: 1,
      products: [],
      hasMore: true
    })
    this.loadProducts()
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
      products: [],
      hasMore: true
    })
    this.loadProducts()
  },

  // 加载商品列表
  loadProducts() {
    if (this.data.loading) return

    this.setData({ loading: true })

    const params = {
      page: this.data.page,
      pageSize: this.data.pageSize,
      keyword: this.data.searchKeyword
    }

    app.request({
      url: '/product/getProducts',
      data: params
    })
    .then(res => {
      if (res.success) {
        const { products, total } = res.data
        const newProducts = this.data.page === 1 ? products : [...this.data.products, ...products]
        
        this.setData({
          products: newProducts,
          hasMore: newProducts.length < total
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
      this.loadProducts()
    }
  },

  // 导航到商品详情
  navigateToProductDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/product-detail/product-detail?id=${id}`
    })
  },

  // 导航到创建商品
  navigateToCreateProduct() {
    wx.navigateTo({
      url: '/pages/product-detail/product-detail'
    })
  },

  // 编辑商品
  handleEditProduct(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/product-detail/product-detail?id=${id}`
    })
  },

  // 删除商品
  handleDeleteProduct(e) {
    const id = e.currentTarget.dataset.id
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个商品吗？删除后无法恢复。',
      confirmText: '删除',
      confirmColor: '#FF4757',
      success: (res) => {
        if (res.confirm) {
          this.deleteProduct(id)
        }
      }
    })
  },

  // 执行删除
  deleteProduct(id) {
    app.request({
      url: '/product/deleteProduct',
      data: { id }
    })
    .then(res => {
      if (res.success) {
        wx.showToast({
          title: '删除成功',
          icon: 'success'
        })
        
        // 重新加载商品列表
        this.setData({
          page: 1,
          products: [],
          hasMore: true
        })
        this.loadProducts()
      }
    })
    .catch(err => {
      wx.showToast({
        title: err || '删除失败',
        icon: 'none'
      })
    })
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.setData({
      page: 1,
      products: [],
      hasMore: true
    })
    this.loadProducts().finally(() => {
      wx.stopPullDownRefresh()
    })
  },

  // 上拉加载更多
  onReachBottom() {
    this.loadMore()
  }
}) 