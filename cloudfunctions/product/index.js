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
    case 'getProducts':
      return await getProducts(data)
    case 'getProductDetail':
      return await getProductDetail(data)
    case 'createProduct':
      return await createProduct(data)
    case 'updateProduct':
      return await updateProduct(data)
    case 'deleteProduct':
      return await deleteProduct(data)
    case 'updateStock':
      return await updateStock(data)
    default:
      return {
        success: false,
        message: '未知操作'
      }
  }
}

// 获取商品列表
async function getProducts(data) {
  const { page = 1, pageSize = 20, keyword = '' } = data
  const skip = (page - 1) * pageSize

  try {
    let query = db.collection('products')

    // 添加搜索条件
    if (keyword) {
      query = query.where({
        $or: [
          { name: db.RegExp({ regexp: keyword, options: 'i' }) },
          { barcode: db.RegExp({ regexp: keyword, options: 'i' }) }
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
        products: result.data,
        total,
        page,
        pageSize
      }
    }

  } catch (error) {
    console.error('获取商品列表失败:', error)
    return {
      success: false,
      message: '获取商品列表失败'
    }
  }
}

// 获取商品详情
async function getProductDetail(data) {
  const { id } = data

  try {
    const result = await db.collection('products')
      .doc(id)
      .get()

    if (!result.data) {
      return {
        success: false,
        message: '商品不存在'
      }
    }

    return {
      success: true,
      data: result.data
    }

  } catch (error) {
    console.error('获取商品详情失败:', error)
    return {
      success: false,
      message: '获取商品详情失败'
    }
  }
}

// 创建商品
async function createProduct(data) {
  const { name, barcode, cost, price, stock, unit, image } = data

  try {
    // 检查条形码是否已存在
    const existResult = await db.collection('products')
      .where({
        barcode: barcode
      })
      .get()

    if (existResult.data.length > 0) {
      return {
        success: false,
        message: '条形码已存在'
      }
    }

    const result = await db.collection('products').add({
      data: {
        name,
        barcode,
        cost: parseFloat(cost),
        price: parseFloat(price),
        stock: parseInt(stock),
        unit,
        image: image || '',
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString()
      }
    })

    return {
      success: true,
      data: {
        id: result._id
      },
      message: '商品创建成功'
    }

  } catch (error) {
    console.error('创建商品失败:', error)
    return {
      success: false,
      message: '创建商品失败'
    }
  }
}

// 更新商品
async function updateProduct(data) {
  const { id, name, barcode, cost, price, stock, unit, image } = data

  try {
    // 检查条形码是否已被其他商品使用
    if (barcode) {
      const existResult = await db.collection('products')
        .where({
          barcode: barcode,
          _id: db.command.neq(id)
        })
        .get()

      if (existResult.data.length > 0) {
        return {
          success: false,
          message: '条形码已被其他商品使用'
        }
      }
    }

    const updateData = {
      updateTime: new Date().toISOString()
    }

    if (name) updateData.name = name
    if (barcode) updateData.barcode = barcode
    if (cost !== undefined) updateData.cost = parseFloat(cost)
    if (price !== undefined) updateData.price = parseFloat(price)
    if (stock !== undefined) updateData.stock = parseInt(stock)
    if (unit) updateData.unit = unit
    if (image !== undefined) updateData.image = image

    await db.collection('products').doc(id).update({
      data: updateData
    })

    return {
      success: true,
      message: '商品更新成功'
    }

  } catch (error) {
    console.error('更新商品失败:', error)
    return {
      success: false,
      message: '更新商品失败'
    }
  }
}

// 删除商品
async function deleteProduct(data) {
  const { id } = data

  try {
    // 检查商品是否被订单使用
    const orderItemsResult = await db.collection('order_items')
      .where({
        productId: id
      })
      .get()

    if (orderItemsResult.data.length > 0) {
      return {
        success: false,
        message: '商品已被订单使用，无法删除'
      }
    }

    await db.collection('products').doc(id).remove()

    return {
      success: true,
      message: '商品删除成功'
    }

  } catch (error) {
    console.error('删除商品失败:', error)
    return {
      success: false,
      message: '删除商品失败'
    }
  }
}

// 更新库存
async function updateStock(data) {
  const { id, stock } = data

  try {
    await db.collection('products').doc(id).update({
      data: {
        stock: parseInt(stock),
        updateTime: new Date().toISOString()
      }
    })

    return {
      success: true,
      message: '库存更新成功'
    }

  } catch (error) {
    console.error('更新库存失败:', error)
    return {
      success: false,
      message: '更新库存失败'
    }
  }
} 