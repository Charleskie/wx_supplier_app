// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const { phone, password } = event

  try {
    // 查询用户
    const userResult = await db.collection('users')
      .where({
        phone: phone
      })
      .get()

    if (userResult.data.length === 0) {
      return {
        success: false,
        message: '用户不存在'
      }
    }

    const user = userResult.data[0]

    // 验证密码（实际项目中应该使用加密密码）
    if (user.password !== password) {
      return {
        success: false,
        message: '密码错误'
      }
    }

    // 生成token（实际项目中应该使用JWT）
    const token = `token_${user._id}_${Date.now()}`

    // 返回用户信息（不包含密码）
    const userInfo = {
      id: user._id,
      phone: user.phone,
      name: user.name,
      role: user.role,
      avatar: user.avatar
    }

    return {
      success: true,
      data: {
        token,
        userInfo
      },
      message: '登录成功'
    }

  } catch (error) {
    console.error('登录失败:', error)
    return {
      success: false,
      message: '登录失败，请重试'
    }
  }
} 