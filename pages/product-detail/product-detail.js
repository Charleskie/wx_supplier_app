// pages/product-detail/product-detail.js
const app = getApp()

Page({
  data: {
    productId: '',
    product: {},
    isEdit: false,
    loading: false,
    units: ['个', '斤', '箱', '包', '瓶', '袋', '盒', '件'],
    unitIndex: 0,
    originalProduct: {} // 保存原始数据，用于取消编辑
  },

  onLoad(options) {
    if (options.id) {
      this.setData({
        productId: options.id
      })
      this.loadProductDetail()
    }
  },

  // 加载商品详情
  loadProductDetail() {
    this.setData({ loading: true })

    console.log('正在加载商品详情，ID:', this.data.productId)

    app.request({
      url: '/product/getProductDetail',
      data: { id: this.data.productId }
    })
    .then(res => {
      console.log('商品详情响应:', res)
      if (res.success) {
        const product = res.data
        const unitIndex = this.data.units.indexOf(product.unit) || 0
        
        this.setData({
          product,
          originalProduct: { ...product },
          unitIndex,
          loading: false
        })
      } else {
        throw new Error(res.message || '获取商品详情失败')
      }
    })
    .catch(err => {
      console.error('加载商品详情失败:', err)
      wx.showToast({
        title: err.message || err || '获取商品详情失败',
        icon: 'none'
      })
      this.setData({ loading: false })
    })
  },

  // 返回上一页
  goBack() {
    wx.navigateBack()
  },

  // 切换编辑模式
  toggleEdit() {
    this.setData({
      isEdit: true,
      originalProduct: { ...this.data.product }
    })
  },

  // 取消编辑
  cancelEdit() {
    this.setData({
      isEdit: false,
      product: { ...this.data.originalProduct }
    })
  },

  // 保存商品
  saveProduct() {
    const { product } = this.data
    
    // 验证必填字段
    if (!product.name || !product.name.trim()) {
      wx.showToast({
        title: '请输入商品名称',
        icon: 'none'
      })
      return
    }

    if (!product.barcode || !product.barcode.trim()) {
      wx.showToast({
        title: '请输入条形码',
        icon: 'none'
      })
      return
    }

    if (!product.cost || product.cost <= 0) {
      wx.showToast({
        title: '请输入有效的成本价格',
        icon: 'none'
      })
      return
    }

    if (!product.price || product.price <= 0) {
      wx.showToast({
        title: '请输入有效的售价',
        icon: 'none'
      })
      return
    }

    if (!product.stock || product.stock < 0) {
      wx.showToast({
        title: '请输入有效的库存数量',
        icon: 'none'
      })
      return
    }

    // 更新商品数据
    const updateData = {
      ...product,
      unit: this.data.units[this.data.unitIndex],
      updateTime: new Date().toISOString()
    }

    wx.showLoading({ title: '保存中...' })

    app.request({
      url: '/product/updateProduct',
      data: updateData
    })
    .then(res => {
      if (res.success) {
        wx.showToast({
          title: '保存成功',
          icon: 'success'
        })
        
        this.setData({
          isEdit: false,
          product: updateData,
          originalProduct: { ...updateData }
        })
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

  // 删除商品
  deleteProduct() {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个商品吗？删除后无法恢复。',
      confirmColor: '#FF4757',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '删除中...' })
          
          app.request({
            url: '/product/deleteProduct',
            data: { id: this.data.productId }
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

  // 选择图片
  chooseImage() {
    wx.showActionSheet({
      itemList: ['拍照', '从相册选择'],
      success: (res) => {
        const sourceType = res.tapIndex === 0 ? ['camera'] : ['album']
        
        wx.chooseImage({
          count: 1,
          sizeType: ['compressed'],
          sourceType,
          success: (res) => {
            this.uploadImage(res.tempFilePaths[0])
          }
        })
      }
    })
  },

  // 上传图片
  uploadImage(filePath) {
    wx.showLoading({ title: '上传中...' })
    
    // 压缩图片
    wx.compressImage({
      src: filePath,
      quality: 80,
      success: (res) => {
        // 上传到云存储
        wx.cloud.uploadFile({
          cloudPath: `products/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`,
          filePath: res.tempFilePath,
          success: (uploadRes) => {
            // 更新商品图片
            const product = { ...this.data.product }
            product.image = uploadRes.fileID
            
            this.setData({ product })
            
            wx.showToast({
              title: '图片上传成功',
              icon: 'success'
            })
          },
          fail: (err) => {
            console.error('上传失败:', err)
            wx.showToast({
              title: '图片上传失败',
              icon: 'none'
            })
          }
        })
      },
      fail: (err) => {
        console.error('压缩失败:', err)
        wx.showToast({
          title: '图片处理失败',
          icon: 'none'
        })
      }
    })
    .finally(() => {
      wx.hideLoading()
    })
  },

  // 扫码输入条形码
  scanBarcode() {
    wx.scanCode({
      scanType: ['barCode'],
      success: (res) => {
        const product = { ...this.data.product }
        product.barcode = res.result
        
        this.setData({ product })
        
        wx.showToast({
          title: '扫码成功',
          icon: 'success'
        })
      },
      fail: (err) => {
        console.error('扫码失败:', err)
        wx.showToast({
          title: '扫码失败',
          icon: 'none'
        })
      }
    })
  },

  // 输入事件处理
  onNameInput(e) {
    const product = { ...this.data.product }
    product.name = e.detail.value
    this.setData({ product })
  },

  onBarcodeInput(e) {
    const product = { ...this.data.product }
    product.barcode = e.detail.value
    this.setData({ product })
  },

  onCostInput(e) {
    const product = { ...this.data.product }
    product.cost = parseFloat(e.detail.value) || 0
    this.setData({ product })
  },

  onPriceInput(e) {
    const product = { ...this.data.product }
    product.price = parseFloat(e.detail.value) || 0
    this.setData({ product })
  },

  onStockInput(e) {
    const product = { ...this.data.product }
    product.stock = parseInt(e.detail.value) || 0
    this.setData({ product })
  },

  onUnitChange(e) {
    this.setData({
      unitIndex: e.detail.value
    })
  },

  // 页面显示时刷新数据
  onShow() {
    if (this.data.productId) {
      this.loadProductDetail()
    }
  },

  // 页面隐藏时取消编辑
  onHide() {
    if (this.data.isEdit) {
      this.cancelEdit()
    }
  }
})
