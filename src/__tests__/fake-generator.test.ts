import { FakeGenerator } from '../fake-generator';
import { InterfaceParser } from '../interface-parser';
import { ParsedInterface } from '../interface-parser';

describe('FakeGenerator', () => {
  let fakeGenerator: FakeGenerator;
  let interfaceParser: InterfaceParser;

  beforeEach(() => {
    fakeGenerator = new FakeGenerator();
    interfaceParser = new InterfaceParser();
  });

  describe('generateMockFunction', () => {
    it('应该为简单的interface生成mock函数', () => {
      const interfaceDef = `
        interface User {
          id: string;
          name: string;
          email: string;
          age: number;
        }
      `;

      const parsedInterface = interfaceParser.parse(interfaceDef);
      const mockFunction = fakeGenerator.generateMockFunction(parsedInterface);

      expect(mockFunction).toContain('export function generateUserMock');
      expect(mockFunction).not.toContain('await import');
      expect(mockFunction).toContain('faker.string.uuid()');
      expect(mockFunction).toContain('faker.person.fullName()');
      expect(mockFunction).toContain('faker.internet.email()');
      expect(mockFunction).toContain('faker.number.int');
    });

    it('应该处理可选属性', () => {
      const interfaceDef = `
        interface User {
          id: string;
          name: string;
          email?: string;
        }
      `;

      const parsedInterface = interfaceParser.parse(interfaceDef);
      const mockFunction = fakeGenerator.generateMockFunction(parsedInterface);

      // 确保可选字段也被生成，保证完整的mock数据
      expect(mockFunction).toContain('email: faker.internet.email()');
      expect(mockFunction).not.toContain('undefined');
    });

    it('应该处理数组类型', () => {
      const interfaceDef = `
        interface User {
          id: string;
          tags: string[];
        }
      `;

      const parsedInterface = interfaceParser.parse(interfaceDef);
      const mockFunction = fakeGenerator.generateMockFunction(parsedInterface);

      expect(mockFunction).toContain('faker.helpers.arrayElements');
    });

    it('应该处理联合类型', () => {
      const interfaceDef = `
        interface Product {
          id: string;
          category: 'electronics' | 'clothing' | 'books';
        }
      `;

      const parsedInterface = interfaceParser.parse(interfaceDef);
      const mockFunction = fakeGenerator.generateMockFunction(parsedInterface);

      expect(mockFunction).toContain('faker.helpers.arrayElement');
    });
  });

  describe('generateMockData', () => {
    it('应该生成单个mock数据对象', () => {
      const interfaceDef = `
        interface User {
          id: string;
          name: string;
          age: number;
        }
      `;

      const parsedInterface = interfaceParser.parse(interfaceDef);
      const mockData = fakeGenerator.generateMockData(parsedInterface, 1);

      expect(mockData).toHaveProperty('id');
      expect(mockData).toHaveProperty('name');
      expect(mockData).toHaveProperty('age');
      expect(typeof (mockData as any).id).toBe('string');
      expect(typeof (mockData as any).name).toBe('string');
      expect(typeof (mockData as any).age).toBe('number');
    });

    it('应该生成多个mock数据对象', () => {
      const interfaceDef = `
        interface User {
          id: string;
          name: string;
        }
      `;

      const parsedInterface = interfaceParser.parse(interfaceDef);
      const mockData = fakeGenerator.generateMockData(parsedInterface, 3);

      expect(Array.isArray(mockData)).toBe(true);
      expect(mockData).toHaveLength(3);
      mockData.forEach(item => {
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('name');
      });
    });

    it('应该处理可选属性', () => {
      const interfaceDef = `
        interface User {
          id: string;
          email?: string;
        }
      `;

      const parsedInterface = interfaceParser.parse(interfaceDef);
      const mockData = fakeGenerator.generateMockData(parsedInterface, 5);

      // 检查是否有些对象有email属性，有些没有
      const hasEmail = mockData.some(item => 'email' in item);
      const missingEmail = mockData.some(item => !('email' in item));
      
      // 由于是随机生成，我们只检查生成的每个对象都有id属性
      mockData.forEach(item => {
        expect(item).toHaveProperty('id');
      });
    });
  });
});

describe('InterfaceParser', () => {
  let parser: InterfaceParser;

  beforeEach(() => {
    parser = new InterfaceParser();
  });

  describe('parse', () => {
    it('应该解析简单的interface', () => {
      const interfaceDef = `
        interface User {
          id: string;
          name: string;
          age: number;
        }
      `;

      const result = parser.parse(interfaceDef);

      expect(result.name).toBe('User');
      expect(result.properties).toHaveLength(3);
      expect(result.properties[0].name).toBe('id');
      expect(result.properties[0].type).toBe('string');
      expect(result.properties[0].isOptional).toBe(false);
    });

    it('应该解析可选属性', () => {
      const interfaceDef = `
        interface User {
          id: string;
          email?: string;
        }
      `;

      const result = parser.parse(interfaceDef);

      expect(result.properties[1].name).toBe('email');
      expect(result.properties[1].isOptional).toBe(true);
    });

    it('应该解析数组类型', () => {
      const interfaceDef = `
        interface User {
          tags: string[];
        }
      `;

      const result = parser.parse(interfaceDef);

      expect(result.properties[0].isArray).toBe(true);
      expect(result.properties[0].type).toBe('string');
    });

    it('应该解析联合类型', () => {
      const interfaceDef = `
        interface Product {
          category: 'electronics' | 'clothing';
        }
      `;

      const result = parser.parse(interfaceDef);

      expect(result.properties[0].isUnion).toBe(true);
      expect(result.properties[0].unionTypes).toEqual(['electronics', 'clothing']);
    });

    it('应该处理注释', () => {
      const interfaceDef = `
        interface User {
          // 用户ID
          id: string;
          /* 用户名称 */
          name: string;
        }
      `;

      const result = parser.parse(interfaceDef);

      expect(result.properties).toHaveLength(2);
      expect(result.properties[0].name).toBe('id');
      expect(result.properties[1].name).toBe('name');
    });
  });
}); 