// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const { action, data } = event

  switch (action) {
    case 'getOverview':
      return await getOverview(data)
    case 'getEmployeeStats':
      return await getEmployeeStats(data)
    case 'getCustomerStats':
      return await getCustomerStats(data)
    case 'getTrendData':
      return await getTrendData(data)
    case 'getDashboardStats':
      return await getDashboardStats(data)
    default:
      return {
        success: false,
        message: '未知操作'
      }
  }
}

// 获取概览统计
async function getOverview(data) {
  const { month } = data

  try {
    // 获取月度GMV
    const gmvResult = await db.collection('deliveries')
      .aggregate()
      .match({
        status: 'completed',
        createTime: db.RegExp({ regexp: `^${month}` })
      })
      .group({
        _id: null,
        totalGMV: db.command.aggregate.sum('$totalAmount'),
        totalCost: db.command.aggregate.sum('$totalCost'),
        deliveryCount: db.command.aggregate.sum(1)
      })
      .end()

    // 获取订单总数
    const orderResult = await db.collection('orders')
      .aggregate()
      .match({
        status: 'delivered',
        createTime: db.RegExp({ regexp: `^${month}` })
      })
      .group({
        _id: null,
        totalOrders: db.command.aggregate.sum(1)
      })
      .end()

    const gmvData = gmvResult.list[0] || { totalGMV: 0, totalCost: 0, deliveryCount: 0 }
    const orderData = orderResult.list[0] || { totalOrders: 0 }

    return {
      success: true,
      data: {
        monthlyGMV: gmvData.totalGMV || 0,
        totalCost: gmvData.totalCost || 0,
        deliveryCount: gmvData.deliveryCount || 0,
        totalOrders: orderData.totalOrders || 0
      }
    }

  } catch (error) {
    console.error('获取概览统计失败:', error)
    return {
      success: false,
      message: '获取概览统计失败'
    }
  }
}

// 获取员工配送统计
async function getEmployeeStats(data) {
  const { month } = data

  try {
    const result = await db.collection('deliveries')
      .aggregate()
      .match({
        status: 'completed',
        createTime: db.RegExp({ regexp: `^${month}` })
      })
      .group({
        _id: '$employeeId',
        employeeName: db.command.aggregate.first('$employeeName'),
        deliveryCount: db.command.aggregate.sum(1),
        totalAmount: db.command.aggregate.sum('$totalAmount'),
        totalCost: db.command.aggregate.sum('$totalCost')
      })
      .sort({
        totalAmount: -1
      })
      .end()

    return {
      success: true,
      data: result.list
    }

  } catch (error) {
    console.error('获取员工统计失败:', error)
    return {
      success: false,
      message: '获取员工统计失败'
    }
  }
}

// 获取客户订单统计
async function getCustomerStats(data) {
  const { month } = data

  try {
    const result = await db.collection('orders')
      .aggregate()
      .match({
        status: 'delivered',
        createTime: db.RegExp({ regexp: `^${month}` })
      })
      .group({
        _id: '$customerId',
        customerName: db.command.aggregate.first('$customerName'),
        customerPhone: db.command.aggregate.first('$customerPhone'),
        orderCount: db.command.aggregate.sum(1),
        totalAmount: db.command.aggregate.sum('$totalAmount'),
        totalCost: db.command.aggregate.sum('$totalCost')
      })
      .sort({
        totalAmount: -1
      })
      .end()

    return {
      success: true,
      data: result.list
    }

  } catch (error) {
    console.error('获取客户统计失败:', error)
    return {
      success: false,
      message: '获取客户统计失败'
    }
  }
}

// 获取趋势数据
async function getTrendData(data) {
  const { month } = data

  try {
    // 获取该月的所有日期
    const year = parseInt(month.substring(0, 4))
    const monthNum = parseInt(month.substring(5, 7))
    const daysInMonth = new Date(year, monthNum, 0).getDate()

    const trendData = []
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${month}-${String(day).padStart(2, '0')}`
      
      // 获取当天的配送金额
      const result = await db.collection('deliveries')
        .aggregate()
        .match({
          status: 'completed',
          createTime: db.RegExp({ regexp: `^${dateStr}` })
        })
        .group({
          _id: null,
          totalAmount: db.command.aggregate.sum('$totalAmount')
        })
        .end()

      const amount = result.list[0] ? result.list[0].totalAmount : 0
      
      trendData.push({
        date: `${monthNum}/${day}`,
        amount: amount
      })
    }

    return {
      success: true,
      data: trendData
    }

  } catch (error) {
    console.error('获取趋势数据失败:', error)
    return {
      success: false,
      message: '获取趋势数据失败'
    }
  }
}

// 获取仪表板统计
async function getDashboardStats(data) {
  try {
    const today = new Date()
    const todayStr = today.toISOString().substring(0, 10)
    const monthStr = today.toISOString().substring(0, 7)

    // 获取今日待配送数量
    const pendingResult = await db.collection('deliveries')
      .where({
        status: 'pending',
        createTime: db.RegExp({ regexp: `^${todayStr}` })
      })
      .count()

    // 获取今日配送中数量
    const inProgressResult = await db.collection('deliveries')
      .where({
        status: 'in_progress',
        createTime: db.RegExp({ regexp: `^${todayStr}` })
      })
      .count()

    // 获取商品总数
    const productResult = await db.collection('products').count()

    // 获取本月营收
    const revenueResult = await db.collection('deliveries')
      .aggregate()
      .match({
        status: 'completed',
        createTime: db.RegExp({ regexp: `^${monthStr}` })
      })
      .group({
        _id: null,
        totalRevenue: db.command.aggregate.sum('$totalAmount')
      })
      .end()

    const revenue = revenueResult.list[0] ? revenueResult.list[0].totalRevenue : 0

    return {
      success: true,
      data: {
        pendingDeliveries: pendingResult.total,
        inProgressDeliveries: inProgressResult.total,
        totalProducts: productResult.total,
        monthlyRevenue: revenue
      }
    }

  } catch (error) {
    console.error('获取仪表板统计失败:', error)
    return {
      success: false,
      message: '获取仪表板统计失败'
    }
  }
} 