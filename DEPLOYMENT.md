# 供应商订单管理系统 - 部署说明

## 1. 云开发环境配置

### 1.1 开通云开发
1. 登录微信公众平台
2. 进入小程序后台
3. 点击"开发" -> "开发管理" -> "云开发"
4. 开通云开发服务
5. 创建云开发环境（记住环境ID）

### 1.2 配置云开发环境
在微信开发者工具中：
1. 点击"云开发"按钮
2. 选择刚创建的环境
3. 在项目设置中配置云开发环境ID

## 2. 数据库集合创建

在云开发控制台中创建以下数据库集合：

### 2.1 创建集合
- `users` - 用户表
- `products` - 商品表
- `customers` - 客户表
- `employees` - 员工表
- `deliveries` - 送货单表
- `orders` - 订单表
- `order_items` - 订单商品表

### 2.2 创建索引
为每个集合创建相应的索引：

#### users 集合
- phone (唯一索引)
- role

#### products 集合
- barcode (唯一索引)
- name

#### customers 集合
- phone (唯一索引)
- name

#### employees 集合
- phone (唯一索引)
- status

#### deliveries 集合
- deliveryNumber (唯一索引)
- employeeId
- status
- createTime

#### orders 集合
- deliveryId
- customerId
- status
- createTime

#### order_items 集合
- orderId
- productId

## 3. 云函数部署

### 3.1 安装依赖
在每个云函数目录下运行：
```bash
npm install
```

### 3.2 部署云函数
在微信开发者工具中：
1. 右键点击 `cloudfunctions` 目录
2. 选择"上传并部署：云端安装依赖"
3. 等待所有云函数部署完成

### 3.3 云函数列表
- `login` - 登录相关
- `delivery` - 送货单管理
- `product` - 商品管理
- `customer` - 客户管理
- `employee` - 员工管理
- `statistics` - 统计功能

## 4. 初始化测试数据

### 4.1 运行初始化脚本
在云开发控制台的云函数中：
1. 创建新的云函数 `initDatabase`
2. 将 `init_database.js` 的内容复制到云函数中
3. 部署并运行云函数

### 4.2 测试账号
- 手机号：13800138000
- 密码：123456

## 5. 小程序配置

### 5.1 修改 app.js
将 `baseUrl` 修改为云函数调用：
```javascript
// 在 app.js 中修改 request 方法
request(options) {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: options.url.split('/')[1], // 例如：/delivery -> delivery
      data: {
        action: options.url.split('/')[2], // 例如：/delivery/getDeliveries -> getDeliveries
        data: options.data || {}
      },
      success: (res) => {
        if (res.result && res.result.success) {
          resolve(res.result)
        } else {
          reject(res.result?.message || '请求失败')
        }
      },
      fail: reject
    })
  })
}
```

### 5.2 配置云开发
在 `app.js` 中初始化云开发：
```javascript
// 在 app.js 的 onLaunch 中添加
onLaunch() {
  if (!wx.cloud) {
    console.error('请使用 2.2.3 或以上的基础库以使用云能力')
  } else {
    wx.cloud.init({
      env: 'your-env-id', // 替换为你的云开发环境ID
      traceUser: true,
    })
  }
}
```

## 6. 权限配置

### 6.1 数据库权限
在云开发控制台中设置数据库权限：
- 所有集合设置为"仅创建者可读写"
- 或者根据实际需求设置自定义权限

### 6.2 云函数权限
确保云函数有足够的权限访问数据库：
- 在云函数中已经配置了数据库访问权限

## 7. 测试部署

### 7.1 功能测试
1. 登录功能
2. 商品管理
3. 客户管理
4. 员工管理
5. 送货单管理
6. 统计功能

### 7.2 性能测试
1. 数据加载速度
2. 图片加载
3. 网络请求响应时间

## 8. 生产环境部署

### 8.1 安全配置
1. 修改默认密码
2. 配置数据库权限
3. 设置云函数访问限制

### 8.2 监控配置
1. 设置云开发监控
2. 配置错误日志
3. 设置性能监控

## 9. 常见问题

### 9.1 云函数调用失败
- 检查云函数是否已部署
- 检查环境ID是否正确
- 检查网络连接

### 9.2 数据库访问失败
- 检查数据库权限设置
- 检查集合名称是否正确
- 检查索引是否创建

### 9.3 图片加载失败
- 检查图片路径是否正确
- 检查图片文件是否存在
- 检查网络连接

## 10. 维护和更新

### 10.1 定期备份
- 定期备份数据库数据
- 备份云函数代码
- 备份小程序代码

### 10.2 版本更新
- 更新云函数代码
- 更新小程序代码
- 更新数据库结构

### 10.3 性能优化
- 优化数据库查询
- 优化云函数性能
- 优化小程序加载速度 