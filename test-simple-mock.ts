#!/usr/bin/env node

import { FakeGenerator } from './src/fake-generator.js';
import { InterfaceParser } from './src/interface-parser.js';

// 简单的测试用例
const interfaceDef = `export interface ISimpleUser {
  id: string;
  name: string;
  email: string;
  age: number;
  isActive: boolean;
  hobbies: string[];
  profile: {
    avatar: string;
    bio: string;
    location: string;
  };
  tags: Array<{
    id: number;
    name: string;
    color: string;
  }>;
}`;

console.log('=== 简单测试用例 ===');
console.log(interfaceDef);

console.log('\n=== 解析结果 ===');
const parser = new InterfaceParser();
const parsedInterface = parser.parse(interfaceDef);
console.log(JSON.stringify(parsedInterface, null, 2));

// 验证关键属性
console.log('\n=== 验证解析结果 ===');
const profileProperty = parsedInterface.properties.find(p => p.name === 'profile');
const tagsProperty = parsedInterface.properties.find(p => p.name === 'tags');

if (profileProperty) {
  console.log('✓ profile 解析正确:', {
    isObject: profileProperty.isObject,
    objectPropertiesCount: profileProperty.objectProperties?.length || 0,
    fields: profileProperty.objectProperties?.map(p => p.name) || []
  });
}

if (tagsProperty) {
  console.log('✓ tags 解析正确:', {
    isArray: tagsProperty.isArray,
    isObject: tagsProperty.isObject,
    objectPropertiesCount: tagsProperty.objectProperties?.length || 0,
    fields: tagsProperty.objectProperties?.map(p => p.name) || []
  });
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
console.log('✓ id:', typeof mockDataObj.id);
console.log('✓ name:', typeof mockDataObj.name);
console.log('✓ email:', typeof mockDataObj.email);
console.log('✓ age:', typeof mockDataObj.age);
console.log('✓ isActive:', typeof mockDataObj.isActive);
console.log('✓ hobbies:', Array.isArray(mockDataObj.hobbies), `长度: ${mockDataObj.hobbies?.length || 0}`);
console.log('✓ profile:', typeof mockDataObj.profile, mockDataObj.profile ? '对象' : 'undefined');
console.log('✓ tags:', Array.isArray(mockDataObj.tags), `长度: ${mockDataObj.tags?.length || 0}`);

if (mockDataObj.tags && mockDataObj.tags.length > 0) {
  const firstTag = mockDataObj.tags[0];
  console.log('  - 第一个tag:', {
    id: typeof firstTag.id,
    name: typeof firstTag.name,
    color: typeof firstTag.color
  });
} 