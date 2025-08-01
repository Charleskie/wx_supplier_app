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
    
    // 订单相关
    orders: [],
    groupedOrders: [], // 按客户分组的订单
    tempOrderProducts: [],
    selectedCustomerIndex: 0,
    showOrderModal: false,
    
    // 商品相关
    products: [],
    filteredProducts: [],
    productSearchKeyword: '',
    showProductModal: false,
    
    // 配送员相关
    employees: [],
    employeeIndex: 0,
    
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
          orders: delivery.orders || [],
          employees: delivery.employees || [],
          employeeIndex: delivery.employeeIndex || 0,
          remark: delivery.remark || '',
          loading: false
        })
        
        // 更新分组
        this.groupOrdersByCustomer()
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
    this.loadEmployees()
  },

  // 加载客户列表
  loadCustomers() {
    app.request({
      url: '/customer/getCustomers',
      data: { page: 1, pageSize: 100 }
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
      console.error('加载客户列表失败:', err)
    })
  },

  // 加载商品列表
  loadProducts() {
    app.request({
      url: '/product/getProducts',
      data: { page: 1, pageSize: 100 }
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
      console.error('加载商品列表失败:', err)
    })
  },

  // 加载配送员列表
  loadEmployees() {
    app.request({
      url: '/employee/getEmployees',
      data: { page: 1, pageSize: 100 }
    })
    .then(res => {
      if (res.success) {
        this.setData({
          employees: res.data.employees
        })
      }
    })
    .catch(err => {
      console.error('加载配送员列表失败:', err)
    })
  },

  // 获取送货单状态文本
  getDeliveryStatusText(status) {
    const statusMap = {
      'pending': '待配送',
      'in_progress': '配送中',
      'completed': '已完成'
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
      originalData: {
        selectedCustomers: [...this.data.selectedCustomers],
        orders: [...this.data.orders],
        employeeIndex: this.data.employeeIndex,
        remark: this.data.remark
      }
    })
  },

  // 保存送货单
  saveDelivery() {
    const { selectedCustomers, orders, employees, employeeIndex, remark } = this.data
    
    if (selectedCustomers.length === 0) {
      wx.showToast({
        title: '请选择至少一个客户',
        icon: 'none'
      })
      return
    }

    if (orders.length === 0) {
      wx.showToast({
        title: '请添加至少一个订单',
        icon: 'none'
      })
      return
    }

    if (employees.length === 0 || employeeIndex >= employees.length) {
      wx.showToast({
        title: '请选择配送员',
        icon: 'none'
      })
      return
    }

    const deliveryData = {
      customers: selectedCustomers,
      orders: orders,
      employeeId: employees[employeeIndex]._id,
      employeeName: employees[employeeIndex].name,
      remark: remark,
      status: 'pending',
      totalAmount: this.calculateTotalAmount(orders)
    }

    wx.showLoading({ title: '保存中...' })

    const requestData = this.data.deliveryId 
      ? { ...deliveryData, id: this.data.deliveryId }
      : deliveryData

    app.request({
      url: this.data.deliveryId ? '/delivery/updateDelivery' : '/delivery/createDelivery',
      data: requestData
    })
    .then(res => {
      if (res.success) {
        wx.showToast({
          title: '保存成功',
          icon: 'success'
        })
        
        if (!this.data.deliveryId) {
          // 新建送货单，跳转到详情页
          wx.redirectTo({
            url: `/pages/delivery-detail/delivery-detail?id=${res.data.id}`
          })
        } else {
          this.setData({
            isEdit: false,
            delivery: res.data
          })
        }
      }
    })
    .catch(err => {
      wx.showToast({
        title: err || '保存失败',
        icon: 'none'
      })
    })
    .finally(() => {
      wx.hideLoading()
    })
  },

  // 计算总金额
  calculateTotalAmount(orders) {
    return orders.reduce((total, order) => {
      return total + order.products.reduce((orderTotal, product) => {
        return orderTotal + (product.quantity * product.price)
      }, 0)
    }, 0)
  },

  // 删除送货单
  deleteDelivery() {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个送货单吗？删除后无法恢复。',
      confirmColor: '#FF4757',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '删除中...' })
          
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
            }
          })
          .catch(err => {
            wx.showToast({
              title: err || '删除失败',
              icon: 'none'
            })
          })
          .finally(() => {
            wx.hideLoading()
          })
        }
      }
    })
  },

  // 确认送货
  confirmDelivery() {
    wx.showModal({
      title: '确认送货',
      content: '确定要开始配送这个送货单吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '更新中...' })
          
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
                title: '已开始配送',
                icon: 'success'
              })
              
              this.loadDeliveryDetail()
            }
          })
          .catch(err => {
            wx.showToast({
              title: err || '操作失败',
              icon: 'none'
            })
          })
          .finally(() => {
            wx.hideLoading()
          })
        }
      }
    })
  },

  // 客户选择相关
  showCustomerSelector() {
    this.setData({
      showCustomerModal: true,
      customerSearchKeyword: '',
      filteredCustomers: this.data.customers
    })
  },

  hideCustomerSelector() {
    this.setData({
      showCustomerModal: false
    })
  },

  onCustomerSearchInput(e) {
    const keyword = e.detail.value
    const filtered = this.data.customers.filter(customer => 
      customer.name.includes(keyword) || customer.phone.includes(keyword)
    )
    
    this.setData({
      customerSearchKeyword: keyword,
      filteredCustomers: filtered
    })
  },

  selectCustomer(e) {
    const customer = e.currentTarget.dataset.customer
    
    // 检查是否已选择
    const exists = this.data.selectedCustomers.find(c => c._id === customer._id)
    if (exists) {
      wx.showToast({
        title: '该客户已选择',
        icon: 'none'
      })
      return
    }
    
    this.setData({
      selectedCustomers: [...this.data.selectedCustomers, customer],
      showCustomerModal: false
    })
  },

  removeCustomer(e) {
    const index = e.currentTarget.dataset.index
    const selectedCustomers = [...this.data.selectedCustomers]
    selectedCustomers.splice(index, 1)
    
    this.setData({ selectedCustomers })
  },

  // 订单创建相关
  showOrderCreator() {
    if (this.data.selectedCustomers.length === 0) {
      wx.showToast({
        title: '请先选择客户',
        icon: 'none'
      })
      return
    }
    
    this.setData({
      showOrderModal: true,
      tempOrderProducts: [],
      selectedCustomerIndex: 0
    })
  },

  hideOrderCreator() {
    this.setData({
      showOrderModal: false
    })
  },

  onSelectedCustomerChange(e) {
    this.setData({
      selectedCustomerIndex: e.detail.value
    })
  },

  showProductSelector() {
    this.setData({
      showProductModal: true,
      productSearchKeyword: '',
      filteredProducts: this.data.products
    })
  },

  hideProductSelector() {
    this.setData({
      showProductModal: false
    })
  },

  onProductSearchInput(e) {
    const keyword = e.detail.value
    const filtered = this.data.products.filter(product => 
      product.name.includes(keyword) || product.barcode.includes(keyword)
    )
    
    this.setData({
      productSearchKeyword: keyword,
      filteredProducts: filtered
    })
  },

  selectProduct(e) {
    const product = e.currentTarget.dataset.product
    
    // 检查是否已添加
    const exists = this.data.tempOrderProducts.find(p => p.productId === product._id)
    if (exists) {
      wx.showToast({
        title: '该商品已添加',
        icon: 'none'
      })
      return
    }
    
    const tempProduct = {
      productId: product._id,
      name: product.name,
      barcode: product.barcode,
      image: product.image,
      unit: product.unit,
      quantity: 1,
      cost: product.cost,
      price: product.price,
      retailPrice: product.price * 1.2 // 默认建议零售价为售价的1.2倍
    }
    
    this.setData({
      tempOrderProducts: [...this.data.tempOrderProducts, tempProduct],
      showProductModal: false
    })
  },

  removeTempProduct(e) {
    const index = e.currentTarget.dataset.index
    const tempOrderProducts = [...this.data.tempOrderProducts]
    tempOrderProducts.splice(index, 1)
    
    this.setData({ tempOrderProducts })
  },

  // 订单商品输入处理
  onQuantityInput(e) {
    const index = e.currentTarget.dataset.index
    const value = parseInt(e.detail.value) || 0
    const tempOrderProducts = [...this.data.tempOrderProducts]
    tempOrderProducts[index].quantity = value
    
    this.setData({ tempOrderProducts })
  },

  onCostInput(e) {
    const index = e.currentTarget.dataset.index
    const value = parseFloat(e.detail.value) || 0
    const tempOrderProducts = [...this.data.tempOrderProducts]
    tempOrderProducts[index].cost = value
    
    this.setData({ tempOrderProducts })
  },

  onPriceInput(e) {
    const index = e.currentTarget.dataset.index
    const value = parseFloat(e.detail.value) || 0
    const tempOrderProducts = [...this.data.tempOrderProducts]
    tempOrderProducts[index].price = value
    
    this.setData({ tempOrderProducts })
  },

  onRetailPriceInput(e) {
    const index = e.currentTarget.dataset.index
    const value = parseFloat(e.detail.value) || 0
    const tempOrderProducts = [...this.data.tempOrderProducts]
    tempOrderProducts[index].retailPrice = value
    
    this.setData({ tempOrderProducts })
  },

  // 确认订单
  confirmOrder() {
    const { tempOrderProducts, selectedCustomers, selectedCustomerIndex } = this.data
    
    if (tempOrderProducts.length === 0) {
      wx.showToast({
        title: '请添加商品',
        icon: 'none'
      })
      return
    }

    const customer = selectedCustomers[selectedCustomerIndex]
    const totalAmount = tempOrderProducts.reduce((total, product) => {
      return total + (product.quantity * product.price)
    }, 0)

    const order = {
      customerId: customer._id,
      customerName: customer.name,
      products: tempOrderProducts,
      totalAmount: totalAmount,
      createTime: new Date().toISOString()
    }

    this.setData({
      orders: [...this.data.orders, order],
      showOrderModal: false
    })
    
    // 更新分组
    this.groupOrdersByCustomer()
  },

  // 订单操作
  addProductToOrder(e) {
    const orderIndex = e.currentTarget.dataset.orderIndex
    this.setData({
      currentOrderIndex: orderIndex,
      showProductModal: true
    })
  },

  removeOrder(e) {
    const orderIndex = e.currentTarget.dataset.orderIndex
    const orders = [...this.data.orders]
    orders.splice(orderIndex, 1)
    
    this.setData({ orders })
    
    // 更新分组
    this.groupOrdersByCustomer()
  },

  // 配送员选择
  onEmployeeChange(e) {
    this.setData({
      employeeIndex: e.detail.value
    })
  },

  // 备注输入
  onRemarkInput(e) {
    this.setData({
      remark: e.detail.value
    })
  },

  // 获取客户订单数量
  getCustomerOrderCount(customerId) {
    if (!customerId) return 0
    return this.data.orders.filter(order => order.customerId === customerId).length
  },

  // 按客户分组订单
  groupOrdersByCustomer() {
    const grouped = {}
    
    this.data.orders.forEach((order, index) => {
      if (!grouped[order.customerId]) {
        grouped[order.customerId] = {
          customerId: order.customerId,
          customerName: order.customerName,
          orders: []
        }
      }
      
      // 为订单添加索引，用于操作
      order.orderIndex = index
      grouped[order.customerId].orders.push(order)
    })
    
    this.setData({
      groupedOrders: Object.values(grouped)
    })
  },

  // 页面显示时刷新数据
  onShow() {
    if (this.data.deliveryId) {
      this.loadDeliveryDetail()
    }
  }
}) 