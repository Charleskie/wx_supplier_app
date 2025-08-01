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
    case 'getCustomers':
      return await getCustomers(data)
    case 'getCustomerDetail':
      return await getCustomerDetail(data)
    case 'createCustomer':
      return await createCustomer(data)
    case 'updateCustomer':
      return await updateCustomer(data)
    case 'deleteCustomer':
      return await deleteCustomer(data)
    default:
      return {
        success: false,
        message: '未知操作'
      }
  }
}

// 获取客户列表
async function getCustomers(data) {
  const { page = 1, pageSize = 20, keyword = '' } = data
  const skip = (page - 1) * pageSize

  try {
    let query = db.collection('customers')

    // 添加搜索条件
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
        customers: result.data,
        total,
        page,
        pageSize
      }
    }

  } catch (error) {
    console.error('获取客户列表失败:', error)
    return {
      success: false,
      message: '获取客户列表失败'
    }
  }
}

// 获取客户详情
async function getCustomerDetail(data) {
  const { id } = data

  try {
    const result = await db.collection('customers')
      .doc(id)
      .get()

    if (!result.data) {
      return {
        success: false,
        message: '客户不存在'
      }
    }

    return {
      success: true,
      data: result.data
    }

  } catch (error) {
    console.error('获取客户详情失败:', error)
    return {
      success: false,
      message: '获取客户详情失败'
    }
  }
}

// 创建客户
async function createCustomer(data) {
  const { name, phone, address, contactPerson } = data

  try {
    // 检查手机号是否已存在
    const existResult = await db.collection('customers')
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

    const result = await db.collection('customers').add({
      data: {
        name,
        phone,
        address,
        contactPerson,
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString()
      }
    })

    return {
      success: true,
      data: {
        id: result._id
      },
      message: '客户创建成功'
    }

  } catch (error) {
    console.error('创建客户失败:', error)
    return {
      success: false,
      message: '创建客户失败'
    }
  }
}

// 更新客户
async function updateCustomer(data) {
  const { id, name, phone, address, contactPerson } = data

  try {
    // 检查手机号是否已被其他客户使用
    if (phone) {
      const existResult = await db.collection('customers')
        .where({
          phone: phone,
          _id: db.command.neq(id)
        })
        .get()

      if (existResult.data.length > 0) {
        return {
          success: false,
          message: '手机号已被其他客户使用'
        }
      }
    }

    const updateData = {
      updateTime: new Date().toISOString()
    }

    if (name) updateData.name = name
    if (phone) updateData.phone = phone
    if (address) updateData.address = address
    if (contactPerson) updateData.contactPerson = contactPerson

    await db.collection('customers').doc(id).update({
      data: updateData
    })

    return {
      success: true,
      message: '客户更新成功'
    }

  } catch (error) {
    console.error('更新客户失败:', error)
    return {
      success: false,
      message: '更新客户失败'
    }
  }
}

// 删除客户
async function deleteCustomer(data) {
  const { id } = data

  try {
    // 检查客户是否被订单使用
    const orderResult = await db.collection('orders')
      .where({
        customerId: id
      })
      .get()

    if (orderResult.data.length > 0) {
      return {
        success: false,
        message: '客户已被订单使用，无法删除'
      }
    }

    await db.collection('customers').doc(id).remove()

    return {
      success: true,
      message: '客户删除成功'
    }

  } catch (error) {
    console.error('删除客户失败:', error)
    return {
      success: false,
      message: '删除客户失败'
    }
  }
} 