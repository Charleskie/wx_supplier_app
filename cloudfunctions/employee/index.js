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
    case 'getEmployees':
      return await getEmployees(data)
    case 'getEmployeeDetail':
      return await getEmployeeDetail(data)
    case 'createEmployee':
      return await createEmployee(data)
    case 'updateEmployee':
      return await updateEmployee(data)
    case 'deleteEmployee':
      return await deleteEmployee(data)
    case 'getEmployeeStats':
      return await getEmployeeStats(data)
    default:
      return {
        success: false,
        message: '未知操作'
      }
  }
}

// 获取员工列表
async function getEmployees(data) {
  const { page = 1, pageSize = 20, keyword = '', status = '' } = data
  const skip = (page - 1) * pageSize

  try {
    let query = db.collection('employees')

    // 添加筛选条件
    if (status) {
      query = query.where({ status })
    }

    if (keyword) {
      query = query.where({
        $or: [
          { name: db.RegExp({ regexp: keyword, options: 'i' }) },
          { phone: db.RegExp({ regexp: keyword, options: 'i' }) }
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
        employees: result.data,
        total,
        page,
        pageSize
      }
    }

  } catch (error) {
    console.error('获取员工列表失败:', error)
    return {
      success: false,
      message: '获取员工列表失败'
    }
  }
}

// 获取员工详情
async function getEmployeeDetail(data) {
  const { id } = data

  try {
    const result = await db.collection('employees')
      .doc(id)
      .get()

    if (!result.data) {
      return {
        success: false,
        message: '员工不存在'
      }
    }

    return {
      success: true,
      data: result.data
    }

  } catch (error) {
    console.error('获取员工详情失败:', error)
    return {
      success: false,
      message: '获取员工详情失败'
    }
  }
}

// 创建员工
async function createEmployee(data) {
  const { name, phone, role, status = 'active' } = data

  try {
    // 检查手机号是否已存在
    const existResult = await db.collection('employees')
      .where({
        phone: phone
      })
      .get()

    if (existResult.data.length > 0) {
      return {
        success: false,
        message: '手机号已存在'
      }
    }

    const result = await db.collection('employees').add({
      data: {
        name,
        phone,
        role,
        status,
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString()
      }
    })

    return {
      success: true,
      data: {
        id: result._id
      },
      message: '员工创建成功'
    }

  } catch (error) {
    console.error('创建员工失败:', error)
    return {
      success: false,
      message: '创建员工失败'
    }
  }
}

// 更新员工
async function updateEmployee(data) {
  const { id, name, phone, role, status } = data

  try {
    // 检查手机号是否已被其他员工使用
    if (phone) {
      const existResult = await db.collection('employees')
        .where({
          phone: phone,
          _id: db.command.neq(id)
        })
        .get()

      if (existResult.data.length > 0) {
        return {
          success: false,
          message: '手机号已被其他员工使用'
        }
      }
    }

    const updateData = {
      updateTime: new Date().toISOString()
    }

    if (name) updateData.name = name
    if (phone) updateData.phone = phone
    if (role) updateData.role = role
    if (status) updateData.status = status

    await db.collection('employees').doc(id).update({
      data: updateData
    })

    return {
      success: true,
      message: '员工更新成功'
    }

  } catch (error) {
    console.error('更新员工失败:', error)
    return {
      success: false,
      message: '更新员工失败'
    }
  }
}

// 删除员工
async function deleteEmployee(data) {
  const { id } = data

  try {
    // 检查员工是否被送货单使用
    const deliveryResult = await db.collection('deliveries')
      .where({
        employeeId: id
      })
      .get()

    if (deliveryResult.data.length > 0) {
      return {
        success: false,
        message: '员工已被送货单使用，无法删除'
      }
    }

    await db.collection('employees').doc(id).remove()

    return {
      success: true,
      message: '员工删除成功'
    }

  } catch (error) {
    console.error('删除员工失败:', error)
    return {
      success: false,
      message: '删除员工失败'
    }
  }
}

// 获取员工统计
async function getEmployeeStats(data) {
  const { employeeId, month } = data

  try {
    let matchCondition = {
      status: 'completed'
    }

    if (employeeId) {
      matchCondition.employeeId = employeeId
    }

    if (month) {
      matchCondition.createTime = db.RegExp({ regexp: `^${month}` })
    }

    const result = await db.collection('deliveries')
      .aggregate()
      .match(matchCondition)
      .group({
        _id: '$employeeId',
        employeeName: db.command.aggregate.first('$employeeName'),
        deliveryCount: db.command.aggregate.sum(1),
        totalAmount: db.command.aggregate.sum('$totalAmount'),
        totalCost: db.command.aggregate.sum('$totalCost')
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