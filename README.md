# 供应商订单管理系统 - 微信小程序

一个基于微信小程序原生框架开发的供应商订单管理系统，专门为供应商设计，提供送货单管理、订单管理、商品管理、员工管理和数据统计等功能。

## 功能特性

### 🏠 首页
- 欢迎界面和用户信息展示
- 送货单状态统计卡片
- 快捷操作入口
- 最近送货单列表

### 🚚 送货单管理
- 送货单列表展示和搜索
- 送货单状态筛选（待配送、配送中、已完成）
- 送货单详情查看
- 送货单创建和编辑
- 配送状态管理

### 📦 商品管理
- 商品列表展示和搜索
- 商品信息管理（商品名、条形码、成本、库存）
- 商品详情查看
- 库存管理

### 📊 数据统计
- 月度GMV统计
- 员工配送统计（配送单数、成本、金额）
- 客户订单统计（订单数、成本、金额）
- 配送趋势图表

### 👤 个人中心
- 用户信息展示
- 功能菜单导航
- 客户管理入口
- 员工管理入口
- 系统设置
- 退出登录

## 核心业务流程

### 送货单流程
1. **创建送货单** - 选择配送员和客户
2. **添加订单** - 为每个客户添加订单（商品、数量、成本、单价、金额）
3. **开始配送** - 配送员开始配送行程
4. **完成配送** - 配送完成后标记送货单状态

### 订单管理
- 每个送货单包含多个订单
- 每个订单对应一个客户
- 订单包含商品信息、数量、成本、单价、金额
- 支持订单状态跟踪

### 商品管理
- 商品基本信息（名称、条形码）
- 成本管理
- 库存管理
- 支持条形码扫描

## 技术栈

- **框架**: 微信小程序原生框架
- **样式**: WXSS
- **数据管理**: 微信小程序全局数据 + 本地存储
- **网络请求**: wx.request API
- **UI组件**: 自定义组件 + 微信原生组件
- **后端**: 云函数 + 数据库

## 项目结构

```
wx_supplier_app/
├── app.js                 # 小程序入口文件
├── app.json              # 小程序配置文件
├── app.wxss              # 全局样式文件
├── sitemap.json          # 站点地图配置
├── project.config.json   # 项目配置文件
├── pages/                # 页面目录
│   ├── index/           # 首页
│   ├── login/           # 登录页
│   ├── delivery/        # 送货单列表
│   ├── delivery-detail/ # 送货单详情
│   ├── create-delivery/ # 创建送货单
│   ├── orders/          # 订单列表
│   ├── order-detail/    # 订单详情
│   ├── products/        # 商品管理
│   ├── product-detail/  # 商品详情
│   ├── customers/       # 客户管理
│   ├── customer-detail/ # 客户详情
│   ├── employees/       # 员工管理
│   ├── employee-detail/ # 员工详情
│   ├── statistics/      # 数据统计
│   └── profile/         # 个人中心
└── images/              # 图片资源目录
```

## 安装和运行

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd wx_supplier_app
   ```

2. **配置微信开发者工具**
   - 下载并安装[微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
   - 打开微信开发者工具
   - 导入项目，选择项目根目录

3. **配置AppID**
   - 在 `project.config.json` 中修改 `appid` 为你的小程序AppID
   - 在 `app.js` 中修改 `baseUrl` 为你的后端API地址

4. **运行项目**
   - 在微信开发者工具中点击"编译"
   - 项目将在模拟器中运行

## 配置说明

### API配置
在 `app.js` 中修改 `baseUrl` 配置：
```javascript
globalData: {
  baseUrl: 'https://your-api-domain.com/api', // 替换为你的API地址
  // ...
}
```

### 小程序AppID配置
在 `project.config.json` 中修改：
```json
{
  "appid": "your-app-id-here"
}
```

## 数据库设计

### 主要数据表
- **users** - 用户表
- **deliveries** - 送货单表
- **orders** - 订单表
- **products** - 商品表
- **customers** - 客户表
- **employees** - 员工表

### 关键字段
- **送货单**: deliveryNumber, employeeId, status, totalAmount
- **订单**: customerId, productId, quantity, cost, price, amount
- **商品**: name, barcode, cost, stock
- **客户**: name, phone, address
- **员工**: name, phone, role

## 页面说明

### 登录页面 (`pages/login/`)
- 手机号和密码登录
- 登录状态检查和自动跳转
- 表单验证

### 首页 (`pages/index/`)
- 用户欢迎信息
- 送货单统计概览
- 快捷操作入口
- 最近送货单列表

### 送货单管理 (`pages/delivery/`)
- 送货单列表展示
- 搜索和筛选功能
- 送货单状态管理
- 分页加载

### 商品管理 (`pages/products/`)
- 商品列表展示
- 商品信息管理
- 搜索功能
- 库存管理

### 数据统计 (`pages/statistics/`)
- 月度GMV统计
- 员工配送统计
- 客户订单统计
- 趋势图表
- 时间筛选

### 个人中心 (`pages/profile/`)
- 用户信息展示
- 功能菜单
- 系统设置入口
- 退出登录

## 开发注意事项

1. **API接口**: 需要配套的后端API服务
2. **权限管理**: 根据实际需求配置用户权限
3. **数据安全**: 注意敏感数据的加密和传输安全
4. **性能优化**: 合理使用分页和缓存机制
5. **用户体验**: 添加适当的加载状态和错误提示

## 扩展功能

- 条形码扫描功能
- 地图配送路线规划
- 消息通知推送
- 数据导出功能
- 多语言支持
- 主题切换

## 贡献

欢迎提交Issue和Pull Request来改进这个项目。

## 许可证

MIT License
