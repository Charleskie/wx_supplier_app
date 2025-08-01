// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    // 初始化用户数据
    await initUsers()
    
    // 初始化商品数据
    await initProducts()
    
    // 初始化客户数据
    await initCustomers()
    
    // 初始化员工数据
    await initEmployees()
    
    // 初始化送货单和订单数据
    await initDeliveries()
    
    return {
      success: true,
      message: '数据库初始化成功'
    }
  } catch (error) {
    console.error('数据库初始化失败:', error)
    return {
      success: false,
      message: '数据库初始化失败: ' + error.message
    }
  }
}

// 初始化用户数据
async function initUsers() {
  const users = [
    {
      phone: '13800138000',
      password: '123456',
      name: '管理员',
      role: 'admin',
      avatar: '',
      createTime: new Date().toISOString()
    }
  ]
  
  for (const user of users) {
    await db.collection('users').add({
      data: user
    })
  }
  
  console.log('用户数据初始化完成')
}

// 初始化商品数据
async function initProducts() {
  const products = [
    {
      name: '苹果',
      barcode: '6901234567890',
      cost: 2.5,
      price: 5.0,
      stock: 100,
      unit: '斤',
      image: '',
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString()
    },
    {
      name: '香蕉',
      barcode: '6901234567891',
      cost: 1.8,
      price: 3.5,
      stock: 80,
      unit: '斤',
      image: '',
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString()
    },
    {
      name: '橙子',
      barcode: '6901234567892',
      cost: 3.0,
      price: 6.0,
      stock: 60,
      unit: '斤',
      image: '',
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString()
    },
    {
      name: '葡萄',
      barcode: '6901234567893',
      cost: 4.5,
      price: 8.0,
      stock: 40,
      unit: '斤',
      image: '',
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString()
    }
  ]
  
  for (const product of products) {
    await db.collection('products').add({
      data: product
    })
  }
  
  console.log('商品数据初始化完成')
}

// 初始化客户数据
async function initCustomers() {
  const customers = [
    {
      name: '张三',
      phone: '13900139001',
      address: '北京市朝阳区某某街道123号',
      contactPerson: '张三',
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString()
    },
    {
      name: '李四',
      phone: '13900139002',
      address: '北京市海淀区某某路456号',
      contactPerson: '李四',
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString()
    },
    {
      name: '王五',
      phone: '13900139003',
      address: '北京市西城区某某胡同789号',
      contactPerson: '王五',
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString()
    }
  ]
  
  for (const customer of customers) {
    await db.collection('customers').add({
      data: customer
    })
  }
  
  console.log('客户数据初始化完成')
}

// 初始化员工数据
async function initEmployees() {
  const employees = [
    {
      name: '配送员小王',
      phone: '13700137001',
      role: 'delivery',
      status: 'active',
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString()
    },
    {
      name: '配送员小李',
      phone: '13700137002',
      role: 'delivery',
      status: 'active',
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString()
    }
  ]
  
  for (const employee of employees) {
    await db.collection('employees').add({
      data: employee
    })
  }
  
  console.log('员工数据初始化完成')
}

// 初始化送货单和订单数据
async function initDeliveries() {
  // 获取员工数据
  const employeesResult = await db.collection('employees').get()
  const employees = employeesResult.data
  
  // 获取客户数据
  const customersResult = await db.collection('customers').get()
  const customers = customersResult.data
  
  // 获取商品数据
  const productsResult = await db.collection('products').get()
  const products = productsResult.data
  
  if (employees.length === 0 || customers.length === 0 || products.length === 0) {
    console.log('缺少基础数据，跳过送货单初始化')
    return
  }
  
  // 创建示例送货单
  const deliveryData = {
    deliveryNumber: '20240601-001',
    employeeId: employees[0]._id,
    employeeName: employees[0].name,
    status: 'completed',
    totalAmount: 150.0,
    totalCost: 90.0,
    createTime: '2024-06-01 08:00:00',
    startTime: '2024-06-01 09:00:00',
    completeTime: '2024-06-01 17:00:00',
    updateTime: '2024-06-01 17:00:00'
  }
  
  const deliveryResult = await db.collection('deliveries').add({
    data: deliveryData
  })
  
  // 创建示例订单
  const orderData = {
    deliveryId: deliveryResult._id,
    customerId: customers[0]._id,
    customerName: customers[0].name,
    status: 'delivered',
    totalAmount: 150.0,
    totalCost: 90.0,
    createTime: '2024-06-01 08:00:00',
    updateTime: '2024-06-01 17:00:00'
  }
  
  const orderResult = await db.collection('orders').add({
    data: orderData
  })
  
  // 创建订单商品
  const orderItems = [
    {
      orderId: orderResult._id,
      productId: products[0]._id,
      productName: products[0].name,
      quantity: 10,
      cost: products[0].cost,
      price: products[0].price,
      amount: products[0].price * 10,
      createTime: new Date().toISOString()
    },
    {
      orderId: orderResult._id,
      productId: products[1]._id,
      productName: products[1].name,
      quantity: 5,
      cost: products[1].cost,
      price: products[1].price,
      amount: products[1].price * 5,
      createTime: new Date().toISOString()
    }
  ]
  
  for (const item of orderItems) {
    await db.collection('order_items').add({
      data: item
    })
  }
  
  console.log('送货单和订单数据初始化完成')
} 