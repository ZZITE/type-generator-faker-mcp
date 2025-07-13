#!/usr/bin/env node

import { FakeGenerator } from './src/fake-generator.js';
import { InterfaceParser } from './src/interface-parser.js';

// 新的测试用例：用户订单系统接口
const interfaceDef = `export interface IUserOrder {
  userId: string;
  orderId: string;
  orderDate: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  totalAmount: number;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    category: 'electronics' | 'clothing' | 'books' | 'home';
    tags: string[];
  }>;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone: string;
  };
  paymentInfo: {
    method: 'credit_card' | 'paypal' | 'bank_transfer';
    cardNumber?: string;
    expiryDate?: string;
    cvv?: string;
    accountId?: string;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}`;

console.log('=== 测试用例：用户订单系统接口 ===');
console.log(interfaceDef);

console.log('\n=== 解析结果 ===');
const parser = new InterfaceParser();
const parsedInterface = parser.parse(interfaceDef);
console.log(JSON.stringify(parsedInterface, null, 2));

// 添加调试信息
console.log('\n=== 调试信息 ===');
const itemsProperty = parsedInterface.properties.find(p => p.name === 'items');
const shippingAddressProperty = parsedInterface.properties.find(p => p.name === 'shippingAddress');
const paymentInfoProperty = parsedInterface.properties.find(p => p.name === 'paymentInfo');

if (itemsProperty) {
  console.log('items 属性详情:');
  console.log('- type:', itemsProperty.type);
  console.log('- isArray:', itemsProperty.isArray);
  console.log('- isObject:', itemsProperty.isObject);
  console.log('- objectProperties 数量:', itemsProperty.objectProperties?.length || 0);
  if (itemsProperty.objectProperties) {
    console.log('- objectProperties 字段:', itemsProperty.objectProperties.map(p => p.name));
  }
}

if (shippingAddressProperty) {
  console.log('\nshippingAddress 属性详情:');
  console.log('- type:', shippingAddressProperty.type);
  console.log('- isArray:', shippingAddressProperty.isArray);
  console.log('- isObject:', shippingAddressProperty.isObject);
  console.log('- objectProperties 数量:', shippingAddressProperty.objectProperties?.length || 0);
  if (shippingAddressProperty.objectProperties) {
    console.log('- objectProperties 字段:', shippingAddressProperty.objectProperties.map(p => p.name));
  }
}

if (paymentInfoProperty) {
  console.log('\npaymentInfo 属性详情:');
  console.log('- type:', paymentInfoProperty.type);
  console.log('- isArray:', paymentInfoProperty.isArray);
  console.log('- isObject:', paymentInfoProperty.isObject);
  console.log('- objectProperties 数量:', paymentInfoProperty.objectProperties?.length || 0);
  if (paymentInfoProperty.objectProperties) {
    console.log('- objectProperties 字段:', paymentInfoProperty.objectProperties.map(p => p.name));
  }
}

console.log('\n=== 生成的Mock函数 ===');
const generator = new FakeGenerator();
const mockFunction = generator.generateMockFunction(parsedInterface);
console.log(mockFunction);

console.log('\n=== 生成的示例数据 ===');
const mockData = generator.generateMockData(parsedInterface, 1);
console.log(JSON.stringify(mockData, null, 2));

// 验证生成的mock数据结构
console.log('\n=== 验证Mock数据结构 ===');
const mockDataObj = mockData as any;
console.log('✓ userId:', typeof mockDataObj.userId, mockDataObj.userId);
console.log('✓ orderId:', typeof mockDataObj.orderId, mockDataObj.orderId);
console.log('✓ status:', typeof mockDataObj.status, mockDataObj.status);
console.log('✓ totalAmount:', typeof mockDataObj.totalAmount, mockDataObj.totalAmount);
console.log('✓ items:', Array.isArray(mockDataObj.items), `长度: ${mockDataObj.items?.length || 0}`);
if (mockDataObj.items && mockDataObj.items.length > 0) {
  const firstItem = mockDataObj.items[0];
  console.log('  - 第一个item:', {
    productId: typeof firstItem.productId,
    productName: typeof firstItem.productName,
    quantity: typeof firstItem.quantity,
    category: typeof firstItem.category,
    tags: Array.isArray(firstItem.tags)
  });
}
console.log('✓ shippingAddress:', typeof mockDataObj.shippingAddress, mockDataObj.shippingAddress ? '对象' : 'undefined');
console.log('✓ paymentInfo:', typeof mockDataObj.paymentInfo, mockDataObj.paymentInfo ? '对象' : 'undefined');
console.log('✓ notes:', typeof mockDataObj.notes, mockDataObj.notes); 