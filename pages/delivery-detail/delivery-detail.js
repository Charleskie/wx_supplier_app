// pages/delivery-detail/delivery-detail.js
const app = getApp()

Page({
  data: {
    deliveryId: '',
    delivery: {},
    isEdit: false,
    loading: false,
    deliveryStatusText: '',
    
    // 客户相关
    selectedCustomers: [],
    customers: [],
    filteredCustomers: [],
    customerSearchKeyword: '',
    showCustomerModal: false,
    
    // 商品相关
    products: [],
    filteredProducts: [],
    productSearchKeyword: '',
    showProductModal: false,
    
    // 当前操作的客户和订单索引
    currentCustomerIndex: -1,
    currentOrderIndex: -1,
    
    // 其他
    remark: '',
    originalData: {}
  },

  onLoad(options) {
    if (options.id) {
      this.setData({
        deliveryId: options.id
      })
      this.loadDeliveryDetail()
    } else {
      // 新建送货单
      this.setData({
        isEdit: true
      })
      this.loadInitialData()
    }
  },

  // 加载送货单详情
  loadDeliveryDetail() {
    this.setData({ loading: true })

    app.request({
      url: '/delivery/getDeliveryDetail',
      data: { id: this.data.deliveryId }
    })
    .then(res => {
      if (res.success) {
        const delivery = res.data
        const deliveryStatusText = this.getDeliveryStatusText(delivery.status)
        
        this.setData({
          delivery,
          deliveryStatusText,
          selectedCustomers: delivery.customers || [],
          remark: delivery.remark || '',
          loading: false
        })
      }
    })
    .catch(err => {
      wx.showToast({
        title: err || '加载失败',
        icon: 'none'
      })
      this.setData({ loading: false })
    })
  },

  // 加载初始数据
  loadInitialData() {
    this.loadCustomers()
    this.loadProducts()
  },

  // 加载客户列表
  loadCustomers() {
    app.request({
      url: '/customer/getCustomers',
      data: {
        page: 1,
        pageSize: 100,
        keyword: this.data.customerSearchKeyword
      }
    })
    .then(res => {
      if (res.success) {
        this.setData({
          customers: res.data.customers,
          filteredCustomers: res.data.customers
        })
      }
    })
    .catch(err => {
      wx.showToast({
        title: err || '加载客户失败',
        icon: 'none'
      })
    })
  },

  // 加载商品列表
  loadProducts() {
    app.request({
      url: '/product/getProducts',
      data: {
        page: 1,
        pageSize: 100,
        keyword: this.data.productSearchKeyword
      }
    })
    .then(res => {
      if (res.success) {
        this.setData({
          products: res.data.products,
          filteredProducts: res.data.products
        })
      }
    })
    .catch(err => {
      wx.showToast({
        title: err || '加载商品失败',
        icon: 'none'
      })
    })
  },

  // 获取送货单状态文本
  getDeliveryStatusText(status) {
    const statusMap = {
      'pending': '待配送',
      'in_progress': '配送中',
      'completed': '已完成',
      'cancelled': '已取消'
    }
    return statusMap[status] || '未知状态'
  },

  // 返回上一页
  goBack() {
    wx.navigateBack()
  },

  // 切换编辑模式
  toggleEdit() {
    this.setData({
      isEdit: true,
      originalData: JSON.parse(JSON.stringify(this.data.selectedCustomers))
    })
  },

  // 保存送货单
  saveDelivery() {
    if (this.data.selectedCustomers.length === 0) {
      wx.showToast({
        title: '请至少选择一个客户',
        icon: 'none'
      })
      return
    }

    // 验证每个客户是否有订单
    for (let customer of this.data.selectedCustomers) {
      if (customer.orders.length === 0) {
        wx.showToast({
          title: `客户 ${customer.customerName} 没有订单`,
          icon: 'none'
        })
        return
      }
    }

    this.setData({ loading: true })

    const totalAmount = this.data.selectedCustomers.reduce((sum, customer) => sum + customer.totalAmount, 0)
    const deliveryData = {
      customers: this.data.selectedCustomers,
      totalAmount,
      status: 'pending'
    }

    if (this.data.deliveryId) {
      // 更新送货单
      deliveryData.id = this.data.deliveryId
      app.request({
        url: '/delivery/updateDelivery',
        data: deliveryData
      })
      .then(res => {
        if (res.success) {
          wx.showToast({
            title: '保存成功',
            icon: 'success'
          })
          this.setData({
            isEdit: false,
            loading: false
          })
          this.loadDeliveryDetail()
        } else {
          wx.showToast({
            title: res.message || '保存失败',
            icon: 'none'
          })
          this.setData({ loading: false })
        }
      })
      .catch(err => {
        wx.showToast({
          title: err || '保存失败',
          icon: 'none'
        })
        this.setData({ loading: false })
      })
    } else {
      // 创建送货单
      app.request({
        url: '/delivery/createDelivery',
        data: deliveryData
      })
      .then(res => {
        if (res.success) {
          wx.showToast({
            title: '创建成功',
            icon: 'success'
          })
          setTimeout(() => {
            wx.navigateBack()
          }, 1500)
        } else {
          wx.showToast({
            title: res.message || '创建失败',
            icon: 'none'
          })
        }
        this.setData({ loading: false })
      })
      .catch(err => {
        wx.showToast({
          title: err || '创建失败',
          icon: 'none'
        })
        this.setData({ loading: false })
      })
    }
  },

  // 删除送货单
  deleteDelivery() {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个送货单吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({ loading: true })
          
          app.request({
            url: '/delivery/deleteDelivery',
            data: { id: this.data.deliveryId }
          })
          .then(res => {
            if (res.success) {
              wx.showToast({
                title: '删除成功',
                icon: 'success'
              })
              setTimeout(() => {
                wx.navigateBack()
              }, 1500)
            } else {
              wx.showToast({
                title: res.message || '删除失败',
                icon: 'none'
              })
            }
            this.setData({ loading: false })
          })
          .catch(err => {
            wx.showToast({
              title: err || '删除失败',
              icon: 'none'
            })
            this.setData({ loading: false })
          })
        }
      }
    })
  },

  // 确认配送
  confirmDelivery() {
    wx.showModal({
      title: '确认配送',
      content: '确定要开始配送这个送货单吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({ loading: true })
          
          app.request({
            url: '/delivery/updateDeliveryStatus',
            data: {
              id: this.data.deliveryId,
              status: 'in_progress'
            }
          })
          .then(res => {
            if (res.success) {
              wx.showToast({
                title: '配送已开始',
                icon: 'success'
              })
              this.loadDeliveryDetail()
            } else {
              wx.showToast({
                title: res.message || '操作失败',
                icon: 'none'
              })
            }
            this.setData({ loading: false })
          })
          .catch(err => {
            wx.showToast({
              title: err || '操作失败',
              icon: 'none'
            })
            this.setData({ loading: false })
          })
        }
      }
    })
  },

  // 显示客户选择弹窗
  showCustomerSelector() {
    this.setData({
      showCustomerModal: true
    })
  },

  // 隐藏客户选择弹窗
  hideCustomerSelector() {
    this.setData({
      showCustomerModal: false
    })
  },

  // 客户搜索输入
  onCustomerSearchInput(e) {
    const keyword = e.detail.value
    this.setData({
      customerSearchKeyword: keyword
    })
    
    const filtered = this.data.customers.filter(customer => 
      customer.name.includes(keyword) || customer.phone.includes(keyword)
    )
    
    this.setData({
      filteredCustomers: filtered
    })
  },

  // 选择客户
  selectCustomer(e) {
    const customer = e.currentTarget.dataset.customer
    const selectedCustomers = [...this.data.selectedCustomers]
    
    // 检查是否已选择该客户
    const exists = selectedCustomers.find(c => c.customerId === customer._id)
    if (exists) {
      wx.showToast({
        title: '该客户已添加',
        icon: 'none'
      })
      return
    }

    // 添加客户，初始化订单数组
    selectedCustomers.push({
      customerId: customer._id,
      customerName: customer.name,
      customerPhone: customer.phone,
      customerAddress: customer.address,
      orders: [],
      totalAmount: 0
    })

    this.setData({
      selectedCustomers,
      showCustomerModal: false
    })
  },

  // 移除客户
  removeCustomer(e) {
    const index = e.currentTarget.dataset.index
    const selectedCustomers = [...this.data.selectedCustomers]
    selectedCustomers.splice(index, 1)
    
    this.setData({
      selectedCustomers
    })
  },

  // 为客户添加订单
  addOrder(e) {
    const customerIndex = e.currentTarget.dataset.customerIndex
    const selectedCustomers = [...this.data.selectedCustomers]
    
    // 创建新订单
    const newOrder = {
      id: Date.now() + Math.random(), // 临时ID
      items: [],
      totalAmount: 0
    }
    
    selectedCustomers[customerIndex].orders.push(newOrder)
    
    this.setData({
      selectedCustomers
    })
  },

  // 移除订单
  removeOrder(e) {
    const { customerIndex, orderIndex } = e.currentTarget.dataset
    const selectedCustomers = [...this.data.selectedCustomers]
    
    selectedCustomers[customerIndex].orders.splice(orderIndex, 1)
    
    this.setData({
      selectedCustomers
    })
    this.calculateTotalAmount()
  },

  // 显示商品选择弹窗
  showProductSelector(e) {
    const { customerIndex, orderIndex } = e.currentTarget.dataset
    this.setData({
      showProductModal: true,
      currentCustomerIndex: customerIndex,
      currentOrderIndex: orderIndex
    })
  },

  // 隐藏商品选择弹窗
  hideProductSelector() {
    this.setData({
      showProductModal: false,
      currentCustomerIndex: -1,
      currentOrderIndex: -1
    })
  },

  // 商品搜索输入
  onProductSearchInput(e) {
    const keyword = e.detail.value
    this.setData({
      productSearchKeyword: keyword
    })
    
    const filtered = this.data.products.filter(product => 
      product.name.includes(keyword) || product.barcode.includes(keyword)
    )
    
    this.setData({
      filteredProducts: filtered
    })
  },

  // 选择商品
  selectProduct(e) {
    const product = e.currentTarget.dataset.product
    const { currentCustomerIndex, currentOrderIndex } = this.data
    
    if (currentCustomerIndex === -1 || currentOrderIndex === -1) return
    
    const selectedCustomers = [...this.data.selectedCustomers]
    const order = selectedCustomers[currentCustomerIndex].orders[currentOrderIndex]
    
    // 检查商品是否已添加
    const exists = order.items.find(item => item.productId === product._id)
    if (exists) {
      wx.showToast({
        title: '该商品已添加',
        icon: 'none'
      })
      return
    }
    
    // 添加商品到订单
    const newItem = {
      productId: product._id,
      productName: product.name,
      barcode: product.barcode,
      costPrice: product.costPrice || 0,
      sellingPrice: product.sellingPrice || 0,
      retailPrice: product.retailPrice || 0,
      quantity: 1,
      totalPrice: product.sellingPrice || 0
    }
    
    order.items.push(newItem)
    this.calculateOrderAmount(currentCustomerIndex, currentOrderIndex)
    
    this.setData({
      selectedCustomers,
      showProductModal: false,
      currentCustomerIndex: -1,
      currentOrderIndex: -1
    })
  },

  // 移除商品
  removeProduct(e) {
    const { customerIndex, orderIndex, itemIndex } = e.currentTarget.dataset
    const selectedCustomers = [...this.data.selectedCustomers]
    
    selectedCustomers[customerIndex].orders[orderIndex].items.splice(itemIndex, 1)
    this.calculateOrderAmount(customerIndex, orderIndex)
    
    this.setData({
      selectedCustomers
    })
  },

  // 更新商品数量
  updateQuantity(e) {
    const { customerIndex, orderIndex, itemIndex } = e.currentTarget.dataset
    const quantity = parseInt(e.detail.value) || 0
    const selectedCustomers = [...this.data.selectedCustomers]
    
    const item = selectedCustomers[customerIndex].orders[orderIndex].items[itemIndex]
    item.quantity = quantity
    item.totalPrice = item.sellingPrice * quantity
    
    this.calculateOrderAmount(customerIndex, orderIndex)
    
    this.setData({
      selectedCustomers
    })
  },

  // 更新商品价格
  updatePrice(e) {
    const { customerIndex, orderIndex, itemIndex, priceType } = e.currentTarget.dataset
    const price = parseFloat(e.detail.value) || 0
    const selectedCustomers = [...this.data.selectedCustomers]
    
    const item = selectedCustomers[customerIndex].orders[orderIndex].items[itemIndex]
    item[priceType] = price
    item.totalPrice = item.sellingPrice * item.quantity
    
    this.calculateOrderAmount(customerIndex, orderIndex)
    
    this.setData({
      selectedCustomers
    })
  },

  // 计算订单金额
  calculateOrderAmount(customerIndex, orderIndex) {
    const selectedCustomers = [...this.data.selectedCustomers]
    const order = selectedCustomers[customerIndex].orders[orderIndex]
    
    order.totalAmount = order.items.reduce((sum, item) => sum + item.totalPrice, 0)
    
    // 计算客户总金额
    selectedCustomers[customerIndex].totalAmount = selectedCustomers[customerIndex].orders.reduce((sum, order) => sum + order.totalAmount, 0)
    
    this.setData({
      selectedCustomers
    })
  },

  // 计算总金额
  calculateTotalAmount() {
    const totalAmount = this.data.selectedCustomers.reduce((sum, customer) => sum + customer.totalAmount, 0)
    this.setData({
      totalAmount
    })
  },

  onShow() {
    if (this.data.deliveryId) {
      this.loadDeliveryDetail()
    }
  }
}) 