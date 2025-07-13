# MCP Fake Generator

基于TypeScript interface使用faker.js生成mock数据的MCP服务器。

## 功能特性

- 🎯 解析TypeScript interface定义
- 🎲 使用faker.js生成符合类型的mock数据
- 🔧 支持多种数据类型：string、number、boolean、Date、数组、联合类型等
- 📦 生成可复用的mock数据函数
- 🚀 作为MCP服务器运行，支持工具调用

## 安装

### 作为MCP服务器使用

```bash
npm install -g type-generator-faker-mcp
```

### 作为库使用

```bash
npm install type-generator-faker-mcp
```

## 开发

```bash
# 安装依赖
npm install

# 开发模式运行
npm run dev

# 构建项目
npm run build

# 运行构建后的项目
npm start
```

## 使用方法

### 作为库使用

```typescript
import { faker } from '@faker-js/faker'; // 你需要手动导入faker
import { FakeGenerator, InterfaceParser } from 'type-generator-faker-mcp';

// 解析interface
const parser = new InterfaceParser();
const typeInfo = parser.parse(`
interface User {
  id: string;
  name: string;
  email: string;
  age: number;
  isActive: boolean;
}
`);

// 生成mock函数
const generator = new FakeGenerator();
const mockFunction = generator.generateMockFunction(typeInfo);
console.log(mockFunction);

// 生成示例数据
const mockData = generator.generateMockData(typeInfo);
console.log(mockData);
```

### 生成的Mock函数示例

```typescript
import { faker } from '@faker-js/faker';

interface User {
  id: string;
  name: string;
  email: string;
  age: number;
  isActive: boolean;
}

export function generateUserMock(count: number = 1): User | User[] {
  const generateSingle = (): User => ({
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    age: faker.number.int({ min: 1, max: 1000 }),
    isActive: faker.datatype.boolean(),
  });
  if (count === 1) {
    return generateSingle();
  }
  return Array.from({ length: count }, () => generateSingle());
}
```

### 作为MCP服务器

1. 配置MCP客户端（如Claude Desktop）添加此服务器
2. 使用工具 `generate_mock_data` 并提供TypeScript interface定义

### 示例

#### 输入：TypeScript Interface

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  age: number;
  isActive: boolean;
  createdAt: Date;
  tags: string[];
  profile?: {
    avatar: string;
    bio: string;
  };
}
```

#### 输出：生成的Mock函数

```javascript
/**
 * 生成 User 类型的mock数据
 * @param {number} count 生成的数据条数，默认为1
 * @returns {User[]} mock数据数组
 */
function generateUserMock(count = 1) {
  const faker = require('@faker-js/faker').faker;
  
  const generateSingle = () => {
    return {
      id: faker.string.uuid(),
      name: faker.person.fullName(),
      email: faker.internet.email(),
      age: faker.number.int({ min: 1, max: 1000 }),
      isActive: faker.datatype.boolean(),
      createdAt: faker.date.recent(),
      tags: faker.helpers.arrayElements([faker.string.sample()], faker.number.int({ min: 1, max: 5 })),
      profile: faker.datatype.boolean() ? {
        avatar: faker.internet.url(),
        bio: faker.string.sample()
      } : undefined,
    };
  };
  
  if (count === 1) {
    return generateSingle();
  }
  
  return Array.from({ length: count }, () => generateSingle());
}

module.exports = { generateUserMock };
```

#### 输出：示例数据

```json
{
  "id": "uuid-abc123",
  "name": "User xyz789",
  "email": "userdef456@example.com",
  "age": 42,
  "isActive": true,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "tags": ["Sample tag1", "Sample tag2"],
  "profile": {
    "avatar": "https://example.com/avatar.jpg",
    "bio": "Sample bio text"
  }
}
```

## 支持的数据类型

| TypeScript类型 | faker.js方法 | 示例输出 |
|---------------|-------------|----------|
| `string` | `faker.string.sample()` | "Sample text" |
| `number` | `faker.number.int()` | 42 |
| `boolean` | `faker.datatype.boolean()` | true |
| `Date` | `faker.date.recent()` | "2024-01-15T10:30:00.000Z" |
| `email` | `faker.internet.email()` | "user@example.com" |
| `url` | `faker.internet.url()` | "https://example.com" |
| `phone` | `faker.phone.number()` | "+1-555-123-4567" |
| `name` | `faker.person.fullName()` | "John Doe" |
| `address` | `faker.location.streetAddress()` | "123 Main St" |
| `city` | `faker.location.city()` | "New York" |
| `country` | `faker.location.country()` | "USA" |
| `uuid` | `faker.string.uuid()` | "uuid-abc123" |
| `id` | `faker.string.uuid()` | "id-def456" |
| `string[]` | `faker.helpers.arrayElements()` | ["tag1", "tag2"] |
| `number[]` | `faker.helpers.arrayElements()` | [1, 2, 3] |
| `Union类型` | `faker.helpers.arrayElement()` | 随机选择联合类型中的一个 |

## 项目结构

```
mcp-fake-generator/
├── src/
│   ├── index.ts          # MCP服务器主入口
│   ├── interface-parser.ts # TypeScript interface解析器
│   └── fake-generator.ts  # faker.js生成器
├── package.json
├── tsconfig.json
└── README.md
```

## 开发说明

### 核心组件

1. **InterfaceParser**: 解析TypeScript interface定义，提取类型信息
2. **FakeGenerator**: 基于解析的类型信息生成faker.js代码和mock数据
3. **MCP Server**: 提供工具调用接口，支持MCP协议

### 扩展支持的类型

要添加新的类型支持，请在 `FakeGenerator` 类的 `getFakerMethodForType` 方法中添加新的类型映射。

## 许可证

MIT 