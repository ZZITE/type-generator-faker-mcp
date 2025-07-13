# MCP Fake Generator

基于TypeScript interface使用faker.js生成mock数据的MCP服务器和命令行工具。

## 🚀 功能特性

- 🎯 **智能解析**：自动解析TypeScript interface定义，提取类型信息
- 🎲 **智能生成**：使用faker.js生成符合类型的mock数据
- 🔧 **类型支持**：支持string、number、boolean、Date、数组、联合类型、对象类型等
- 📦 **多种使用方式**：支持MCP服务器、命令行工具、库三种使用方式
- 🚀 **MCP集成**：作为MCP服务器运行，支持工具调用
- 🛠️ **CLI工具**：提供命令行接口，方便批量生成
- 📝 **代码生成**：生成可复用的TypeScript mock函数

## 📦 安装

### 全局安装（推荐）

```bash
npm install -g type-generator-faker-mcp
```

### 本地安装

```bash
npm install type-generator-faker-mcp
```

## 🛠️ 开发

```bash
# 克隆项目
git clone https://github.com/ZZITE/type-generator-faker-mcp.git
cd type-generator-faker-mcp

# 安装依赖
npm install

# 开发模式运行
npm run dev

# 构建项目
npm run build

# 运行测试
npm test

# 运行构建后的项目
npm start
```

### 不同的运行方式

项目提供了三种不同的运行方式：

1. **MCP服务器** (`npm start` 或 `node dist/index.js`)
   - 用于MCP协议通信
   - 输出 "MCP Fake Generator 服务器已启动"
   - 等待MCP客户端连接

2. **CLI工具** (`type-generator-faker-mcp`)
   - 命令行工具，直接生成mock数据
   - 需要提供interface参数
   - 输出JSON格式的mock数据

3. **开发模式** (`npm run dev`)
   - 使用tsx运行TypeScript源码
   - 适合开发调试

## 📖 使用方法

### 1. 作为MCP服务器使用

1. **配置MCP客户端**（如Claude Desktop）添加此服务器
2. **使用工具** `generate_mock_data` 并提供TypeScript interface定义

#### 示例输入：

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

/**
 * 生成 User 类型的mock数据
 * @param count 生成的数据条数，默认为1
 * @returns mock数据或mock数据数组
 * @description 你需要在文件顶部手动 import { faker } from '@faker-js/faker';
 */
export function generateUserMock(count: number = 1): User | User[] {
  const generateSingle = (): User => {
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
```

### 2. 作为命令行工具使用

```bash
# 直接提供interface定义
type-generator-faker-mcp -i "interface User { id: string; name: string; }" -c 3

# 从文件读取interface定义
type-generator-faker-mcp -f user-interface.ts -c 5 -o output.json

# 生成单个数据
type-generator-faker-mcp -i "interface Product { id: string; name: string; price: number; }"

# 查看帮助信息
type-generator-faker-mcp --help
```

#### 命令行参数：

- `-i, --interface <interface>`: TypeScript接口字符串
- `-f, --file <file>`: 包含TypeScript接口定义的文件路径
- `-c, --count <count>`: 生成数据条数，默认为1
- `-o, --output <output>`: 输出文件路径（不指定则输出到控制台）
- `-h, --help`: 显示帮助信息
- `-V, --version`: 显示版本信息

#### 使用示例：

```bash
# 生成用户数据
type-generator-faker-mcp -i "interface User { id: string; name: string; email: string; age: number; }" -c 3

# 输出结果示例：
[
  {
    "id": "Sample uaieh7",
    "name": "Sample gcimq", 
    "email": "Sample pfqztb",
    "age": 42
  },
  {
    "id": "Sample mrgu6j",
    "name": "Sample qxkqcd",
    "email": "Sample j7za3g",
    "age": 123
  },
  {
    "id": "Sample k8m2n",
    "name": "Sample wxyz9",
    "email": "Sample abc123",
    "age": 789
  }
]
```

### 3. 作为库使用

```typescript
import { faker } from '@faker-js/faker';
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
const mockData = generator.generateMockData(typeInfo, 3);
console.log(mockData);
```

## 📊 支持的数据类型

### 基础TypeScript类型

| TypeScript类型 | faker.js方法 | 示例输出 | 说明 |
|---------------|-------------|----------|------|
| `string` | `faker.string.sample()` | "Sample text" | 基础字符串类型 |
| `number` | `faker.number.int({ min: 1, max: 1000 })` | 42 | 数字类型 |
| `boolean` | `faker.datatype.boolean()` | true | 布尔类型 |
| `Date` | `faker.date.recent()` | "2024-01-15T10:30:00.000Z" | 日期类型 |
| `string[]` | `faker.helpers.arrayElements()` | ["tag1", "tag2"] | 字符串数组 |
| `number[]` | `faker.helpers.arrayElements()` | [1, 2, 3] | 数字数组 |
| `Union类型` | `faker.helpers.arrayElement()` | 随机选择联合类型中的一个 | 联合类型 |
| `对象类型` | 嵌套对象生成 | `{ prop: value }` | 复杂对象 |
| `可选属性` | 条件生成 | 有时包含，有时不包含 | 可选字段 |

### 智能属性名匹配

根据属性名，工具会自动选择合适的faker方法：

| 属性名关键词 | 实际TypeScript类型 | faker.js方法 | 示例输出 |
|-------------|------------------|-------------|----------|
| `id` | `string` | `faker.string.uuid()` | "uuid-abc123" |
| `email` | `string` | `faker.internet.email()` | "user@example.com" |
| `name` | `string` | `faker.person.fullName()` | "John Doe" |
| `phone` | `string` | `faker.phone.number()` | "+1-555-123-4567" |
| `url` | `string` | `faker.internet.url()` | "https://example.com" |
| `address` | `string` | `faker.location.streetAddress()` | "123 Main St" |
| `city` | `string` | `faker.location.city()` | "New York" |
| `country` | `string` | `faker.location.country()` | "USA" |

### 示例

```typescript
interface User {
  id: string;           // 自动使用 faker.string.uuid()
  name: string;         // 自动使用 faker.person.fullName()
  email: string;        // 自动使用 faker.internet.email()
  age: number;          // 使用 faker.number.int()
  isActive: boolean;    // 使用 faker.datatype.boolean()
  createdAt: Date;      // 使用 faker.date.recent()
  tags: string[];       // 使用 faker.helpers.arrayElements()
}
```

## 🏗️ 项目结构

```
mcp-fake-generator/
├── src/
│   ├── index.ts              # MCP服务器主入口
│   ├── cli.ts                # 命令行工具入口
│   ├── fake-generator.ts     # faker.js生成器核心逻辑
│   ├── interface-parser.ts   # TypeScript interface解析器
│   └── __tests__/
│       └── fake-generator.test.ts  # 单元测试
├── examples/
│   ├── usage.js              # 使用示例
│   └── user-interface.ts     # 示例interface定义
├── package.json
├── tsconfig.json
├── jest.config.js
└── README.md
```

## 🔧 核心组件

### 1. InterfaceParser
- **功能**：解析TypeScript interface定义，提取类型信息
- **支持**：基础类型、数组、联合类型、对象类型、可选属性
- **特性**：智能类型推断，支持注释处理

### 2. FakeGenerator
- **功能**：基于解析的类型信息生成faker.js代码和mock数据
- **支持**：多种数据类型映射，智能属性名匹配
- **输出**：TypeScript函数代码和JSON数据

### 3. MCP Server
- **功能**：提供工具调用接口，支持MCP协议
- **工具**：`generate_mock_data` - 基于interface生成mock数据
- **版本**：v1.0.6

### 4. CLI Tool
- **功能**：命令行工具，支持文件输入输出
- **特性**：批量生成，文件操作，灵活配置

## 🧪 测试

项目包含完整的单元测试：

```bash
# 运行所有测试
npm test

# 运行测试并显示覆盖率
npm test -- --coverage
```

测试覆盖：
- InterfaceParser：解析功能测试
- FakeGenerator：生成功能测试
- 各种数据类型支持测试
- 边界情况处理测试

## 📝 示例

### 复杂interface示例

```typescript
interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: 'electronics' | 'clothing' | 'books' | 'home';
  inStock: boolean;
  images: string[];
  specifications: {
    weight: number;
    dimensions: {
      length: number;
      width: number;
      height: number;
    };
  };
}
```

### 生成的Mock函数

```typescript
interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: 'electronics' | 'clothing' | 'books' | 'home';
  inStock: boolean;
  images: string[];
  specifications: {
    weight: number;
    dimensions: {
      length: number;
      width: number;
      height: number;
    };
  };
}

export function generateProductMock(count: number = 1): Product | Product[] {
  const generateSingle = (): Product => {
    return {
      id: faker.string.uuid(),
      name: faker.string.sample(),
      price: faker.number.int({ min: 1, max: 1000 }),
      description: faker.string.sample(),
      category: faker.helpers.arrayElement(['electronics', 'clothing', 'books', 'home']),
      inStock: faker.datatype.boolean(),
      images: faker.helpers.arrayElements([faker.string.sample()], faker.number.int({ min: 1, max: 5 })),
      specifications: {
        weight: faker.number.int({ min: 1, max: 1000 }),
        dimensions: {
          length: faker.number.int({ min: 1, max: 1000 }),
          width: faker.number.int({ min: 1, max: 1000 }),
          height: faker.number.int({ min: 1, max: 1000 })
        }
      }
    };
  };
  
  if (count === 1) {
    return generateSingle();
  }
  
  return Array.from({ length: count }, () => generateSingle());
}
```

## 🔄 扩展支持的类型

要添加新的类型支持，请在 `FakeGenerator` 类的 `getFakeMethodForType` 方法中添加新的类型映射：

```typescript
private getFakeMethodForType(type: string, propertyName?: string): string {
  const typeMap: Record<string, string> = {
    // 现有类型...
    'newType': 'faker.newType.method()', // 添加新类型
  };
  // ...
}
```

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📞 支持

- GitHub Issues: [项目Issues](https://github.com/ZZITE/type-generator-faker-mcp/issues)
- 文档: [项目README](https://github.com/ZZITE/type-generator-faker-mcp#readme)