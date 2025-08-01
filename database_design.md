# 供应商订单管理系统 - 数据库设计

## 数据库集合设计

### 1. users (用户表)
```javascript
{
  _id: "user_001",
  phone: "13800138000",
  password: "hashed_password",
  name: "张三",
  role: "admin", // admin, manager, employee
  avatar: "https://example.com/avatar.jpg",
  createTime: "2024-01-01 00:00:00",
  updateTime: "2024-01-01 00:00:00"
}
```

### 2. products (商品表)
```javascript
{
  _id: "product_001",
  name: "苹果",
  barcode: "1234567890123",
  cost: 5.00, // 成本价
  stock: 100, // 库存数量
  unit: "斤", // 单位
  createTime: "2024-01-01 00:00:00",
  updateTime: "2024-01-01 00:00:00"
}
```

### 3. customers (客户表)
```javascript
{
  _id: "customer_001",
  name: "客户A",
  phone: "13900139000",
  address: "北京市朝阳区xxx街道",
  contactPerson: "李四",
  createTime: "2024-01-01 00:00:00",
  updateTime: "2024-01-01 00:00:00"
}
```

### 4. employees (员工表)
```javascript
{
  _id: "employee_001",
  name: "王五",
  phone: "13700137000",
  role: "delivery", // delivery, manager
  status: "active", // active, inactive
  createTime: "2024-01-01 00:00:00",
  updateTime: "2024-01-01 00:00:00"
}
```

### 5. deliveries (送货单表)
```javascript
{
  _id: "delivery_001",
  deliveryNumber: "20240601-001", // 送货单号
  employeeId: "employee_001",
  employeeName: "王五",
  status: "pending", // pending, in_progress, completed, cancelled
  totalAmount: 1234.56, // 总金额
  totalCost: 800.00, // 总成本
  createTime: "2024-06-01 08:00:00",
  startTime: "2024-06-01 09:00:00", // 开始配送时间
  completeTime: "2024-06-01 17:00:00", // 完成配送时间
  updateTime: "2024-06-01 17:00:00"
}
```

### 6. orders (订单表)
```javascript
{
  _id: "order_001",
  deliveryId: "delivery_001",
  customerId: "customer_001",
  customerName: "客户A",
  customerPhone: "13900139000",
  customerAddress: "北京市朝阳区xxx街道",
  status: "pending", // pending, confirmed, shipped, delivered, cancelled
  totalAmount: 234.56, // 订单总金额
  totalCost: 150.00, // 订单总成本
  createTime: "2024-06-01 08:00:00",
  updateTime: "2024-06-01 08:00:00"
}
```

### 7. order_items (订单商品表)
```javascript
{
  _id: "order_item_001",
  orderId: "order_001",
  productId: "product_001",
  productName: "苹果",
  barcode: "1234567890123",
  quantity: 10, // 数量
  cost: 5.00, // 成本单价
  price: 8.00, // 销售单价
  amount: 80.00, // 金额
  unit: "斤",
  createTime: "2024-06-01 08:00:00"
}
```

## 索引设计

### 1. users 集合索引
- phone (唯一索引)
- role

### 2. products 集合索引
- barcode (唯一索引)
- name

### 3. customers 集合索引
- phone (唯一索引)
- name

### 4. employees 集合索引
- phone (唯一索引)
- status

### 5. deliveries 集合索引
- deliveryNumber (唯一索引)
- employeeId
- status
- createTime

### 6. orders 集合索引
- deliveryId
- customerId
- status
- createTime

### 7. order_items 集合索引
- orderId
- productId

## 数据关系

1. **送货单 -> 订单**: 一对多关系
2. **订单 -> 订单商品**: 一对多关系
3. **员工 -> 送货单**: 一对多关系
4. **客户 -> 订单**: 一对多关系
5. **商品 -> 订单商品**: 一对多关系

## 统计查询

### 月度GMV统计
```javascript
// 按月份统计送货单总金额
db.deliveries.aggregate([
  {
    $match: {
      status: "completed",
      createTime: { $regex: "^2024-06" }
    }
  },
  {
    $group: {
      _id: null,
      totalGMV: { $sum: "$totalAmount" },
      totalCost: { $sum: "$totalCost" },
      deliveryCount: { $sum: 1 }
    }
  }
])
```

### 员工配送统计
```javascript
// 按员工统计配送数据
db.deliveries.aggregate([
  {
    $match: {
      status: "completed",
      createTime: { $regex: "^2024-06" }
  },
  {
    $group: {
      _id: "$employeeId",
      employeeName: { $first: "$employeeName" },
      deliveryCount: { $sum: 1 },
      totalAmount: { $sum: "$totalAmount" },
      totalCost: { $sum: "$totalCost" }
    }
  }
])
```

### 客户订单统计
```javascript
// 按客户统计订单数据
db.orders.aggregate([
  {
    $match: {
      status: "delivered",
      createTime: { $regex: "^2024-06" }
  },
  {
    $group: {
      _id: "$customerId",
      customerName: { $first: "$customerName" },
      orderCount: { $sum: 1 },
      totalAmount: { $sum: "$totalAmount" },
      totalCost: { $sum: "$totalCost" }
    }
  }
])
``` 