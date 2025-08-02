// pages/create-delivery/create-delivery.js
const app = getApp()

Page({
  data: {
    customers: [], // 客户列表
    selectedCustomers: [], // 已选择的客户
    products: [], // 商品列表
    loading: false,
    searchKeyword: '',
    showCustomerModal: false,
    showProductModal: false,
    currentCustomerIndex: -1, // 当前操作的客户索引
    currentOrderIndex: -1, // 当前操作的订单索引
    totalAmount: 0 // 总金额
  },

  onLoad() {
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
        keyword: this.data.searchKeyword
      }
    })
    .then(res => {
      if (res.success) {
        this.setData({
          customers: res.data.customers
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
        keyword: ''
      }
    })
    .then(res => {
      if (res.success) {
        this.setData({
          products: res.data.products
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

  // 选择客户
  selectCustomer(e) {
    const customer = e.currentTarget.dataset.customer
    const selectedCustomers = [...this.data.selectedCustomers]
    
    // 检查是否已选择该客户
    const exists = selectedCustomers.find(c => c._id === customer._id)
    if (exists) {
      wx.showToast({
        title: '该客户已添加',
        icon: 'none'
      })
      return
    }

    // 添加客户，初始化订单数组
    selectedCustomers.push({
      ...customer,
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
    this.calculateTotalAmount()
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
    this.calculateTotalAmount()
  },

  // 计算总金额
  calculateTotalAmount() {
    const totalAmount = this.data.selectedCustomers.reduce((sum, customer) => sum + customer.totalAmount, 0)
    this.setData({
      totalAmount
    })
  },

  // 创建送货单
  createDelivery() {
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
          title: `客户 ${customer.name} 没有订单`,
          icon: 'none'
        })
        return
      }
    }

    this.setData({ loading: true })

    const deliveryData = {
      customers: this.data.selectedCustomers.map(customer => ({
        customerId: customer._id,
        customerName: customer.name,
        customerPhone: customer.phone,
        orders: customer.orders.map(order => ({
          items: order.items,
          totalAmount: order.totalAmount
        })),
        totalAmount: customer.totalAmount
      })),
      totalAmount: this.data.totalAmount,
      status: 'pending'
    }

    app.request({
      url: '/delivery/createDelivery',
      data: deliveryData
    })
    .then(res => {
      if (res.success) {
        wx.showToast({
          title: '送货单创建成功',
          icon: 'success'
        })
        
        // 返回送货单列表
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      } else {
        wx.showToast({
          title: res.message || '创建失败',
          icon: 'none'
        })
      }
    })
    .catch(err => {
      wx.showToast({
        title: err || '创建失败',
        icon: 'none'
      })
    })
    .finally(() => {
      this.setData({ loading: false })
    })
  }
}) 