#!/usr/bin/env node

/**
 * MCP Fake Generator 使用示例
 * 演示如何使用生成的mock数据函数
 */

// 示例：生成的User mock函数
// 注意：需要在文件顶部手动 import { faker } from '@faker-js/faker';
function generateUserMock(count = 1) {
  
  const generateSingle = () => {
    return {
      id: faker.string.uuid(),
      name: faker.person.fullName(),
      email: faker.internet.email(),
      age: faker.number.int({ min: 18, max: 80 }),
      isActive: faker.datatype.boolean(),
      createdAt: faker.date.recent(),
      tags: faker.helpers.arrayElements(['frontend', 'backend', 'devops', 'design'], faker.number.int({ min: 1, max: 3 })),
      profile: faker.datatype.boolean() ? {
        avatar: faker.image.avatar(),
        bio: faker.lorem.sentence()
      } : undefined,
    };
  };
  
  if (count === 1) {
    return generateSingle();
  }
  
  return Array.from({ length: count }, () => generateSingle());
}

// 示例：生成的Product mock函数
// 注意：需要在文件顶部手动 import { faker } from '@faker-js/faker';
function generateProductMock(count = 1) {
  
  const generateSingle = () => {
    return {
      id: faker.string.uuid(),
      name: faker.commerce.productName(),
      price: parseFloat(faker.commerce.price()),
      description: faker.commerce.productDescription(),
      category: faker.helpers.arrayElement(['electronics', 'clothing', 'books', 'home']),
      inStock: faker.datatype.boolean(),
      images: faker.helpers.arrayElements([
        faker.image.url(),
        faker.image.url(),
        faker.image.url()
      ], faker.number.int({ min: 1, max: 3 })),
      specifications: {
        weight: faker.number.float({ min: 0.1, max: 10.0 }),
        dimensions: {
          length: faker.number.float({ min: 1, max: 100 }),
          width: faker.number.float({ min: 1, max: 100 }),
          height: faker.number.float({ min: 1, max: 100 })
        }
      }
    };
  };
  
  if (count === 1) {
    return generateSingle();
  }
  
  return Array.from({ length: count }, () => generateSingle());
}

// 使用示例
console.log('=== 生成单个用户数据 ===');
const user = generateUserMock(1);
console.log(JSON.stringify(user, null, 2));

console.log('\n=== 生成多个产品数据 ===');
const products = generateProductMock(3);
console.log(JSON.stringify(products, null, 2));

console.log('\n=== 生成用户数组 ===');
const users = generateUserMock(2);
console.log(JSON.stringify(users, null, 2));

export { generateUserMock, generateProductMock }; 