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
    case 'getDeliveries':
      return await getDeliveries(data)
    case 'getDeliveryDetail':
      return await getDeliveryDetail(data)
    case 'createDelivery':
      return await createDelivery(data)
    case 'updateDelivery':
      return await updateDelivery(data)
    case 'deleteDelivery':
      return await deleteDelivery(data)
    case 'updateDeliveryStatus':
      return await updateDeliveryStatus(data)
    case 'getRecentDeliveries':
      return await getRecentDeliveries(data)
    default:
      return {
        success: false,
        message: '未知操作'
      }
  }
}

// 获取送货单列表
async function getDeliveries(data) {
  const { page = 1, pageSize = 20, keyword = '', status = '' } = data
  const skip = (page - 1) * pageSize

  try {
    let query = db.collection('deliveries')

    // 添加筛选条件
    if (status) {
      query = query.where({ status })
    }

    if (keyword) {
      query = query.where({
        $or: [
          { deliveryNo: db.RegExp({ regexp: keyword, options: 'i' }) },
          { employeeName: db.RegExp({ regexp: keyword, options: 'i' }) }
        ]
      })
    }

    // 获取总数
    const countResult = await query.count()
    const total = countResult.total

    // 获取数据
    const result = await query
      .orderBy('createTime', 'desc')
      .skip(skip)
      .limit(pageSize)
      .get()

    return {
      success: true,
      data: {
        deliveries: result.data,
        total,
        page,
        pageSize
      }
    }

  } catch (error) {
    console.error('获取送货单列表失败:', error)
    return {
      success: false,
      message: '获取送货单列表失败'
    }
  }
}

// 获取送货单详情
async function getDeliveryDetail(data) {
  const { id } = data

  try {
    const result = await db.collection('deliveries')
      .doc(id)
      .get()

    if (!result.data) {
      return {
        success: false,
        message: '送货单不存在'
      }
    }

    return {
      success: true,
      data: result.data
    }

  } catch (error) {
    console.error('获取送货单详情失败:', error)
    return {
      success: false,
      message: '获取送货单详情失败'
    }
  }
}

// 创建送货单
async function createDelivery(data) {
  const { customers, orders, employeeId, employeeName, remark, status, totalAmount } = data

  try {
    // 生成送货单号
    const date = new Date()
    const dateStr = date.getFullYear().toString() + 
                   String(date.getMonth() + 1).padStart(2, '0') + 
                   String(date.getDate()).padStart(2, '0')
    
    const countResult = await db.collection('deliveries')
      .where({
        createTime: db.RegExp({ regexp: `^${dateStr}` })
      })
      .count()
    
    const deliveryNo = `${dateStr}-${String(countResult.total + 1).padStart(3, '0')}`

    // 创建送货单
    const result = await db.collection('deliveries').add({
      data: {
        deliveryNo,
        customers,
        orders,
        employeeId,
        employeeName,
        status: status || 'pending',
        totalAmount,
        remark: remark || '',
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString()
      }
    })

    return {
      success: true,
      data: {
        id: result._id,
        deliveryNo
      },
      message: '送货单创建成功'
    }

  } catch (error) {
    console.error('创建送货单失败:', error)
    return {
      success: false,
      message: '创建送货单失败'
    }
  }
}

// 更新送货单
async function updateDelivery(data) {
  const { id, customers, orders, employeeId, employeeName, remark, status, totalAmount } = data

  try {
    const updateData = {
      customers,
      orders,
      employeeId,
      employeeName,
      status,
      totalAmount,
      remark,
      updateTime: new Date().toISOString()
    }

    await db.collection('deliveries').doc(id).update({
      data: updateData
    })

    return {
      success: true,
      message: '送货单更新成功'
    }

  } catch (error) {
    console.error('更新送货单失败:', error)
    return {
      success: false,
      message: '更新送货单失败'
    }
  }
}

// 删除送货单
async function deleteDelivery(data) {
  const { id } = data

  try {
    await db.collection('deliveries').doc(id).remove()

    return {
      success: true,
      message: '送货单删除成功'
    }

  } catch (error) {
    console.error('删除送货单失败:', error)
    return {
      success: false,
      message: '删除送货单失败'
    }
  }
}

// 更新送货单状态
async function updateDeliveryStatus(data) {
  const { id, status } = data

  try {
    const updateData = {
      status,
      updateTime: new Date().toISOString()
    }

    // 如果是开始配送
    if (status === 'in_progress') {
      updateData.startTime = new Date().toISOString()
    }

    // 如果是完成配送
    if (status === 'completed') {
      updateData.completeTime = new Date().toISOString()
    }

    await db.collection('deliveries').doc(id).update({
      data: updateData
    })

    return {
      success: true,
      message: '状态更新成功'
    }

  } catch (error) {
    console.error('更新送货单状态失败:', error)
    return {
      success: false,
      message: '更新状态失败'
    }
  }
}

// 获取最近送货单
async function getRecentDeliveries(data) {
  const { limit = 5 } = data

  try {
    const result = await db.collection('deliveries')
      .orderBy('createTime', 'desc')
      .limit(limit)
      .get()

    return {
      success: true,
      data: result.data
    }

  } catch (error) {
    console.error('获取最近送货单失败:', error)
    return {
      success: false,
      message: '获取最近送货单失败'
    }
  }
} 