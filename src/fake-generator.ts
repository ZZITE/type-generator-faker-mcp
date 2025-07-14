import { ParsedInterface, PropertyType } from './interface-parser.js';

/**
 * Faker.js 生成器
 * 基于解析的interface信息生成mock数据
 */
export class FakeGenerator {
  /**
   * 生成mock数据函数
   * @param parsedInterface 解析后的interface信息
   * @returns 生成的TypeScript函数字符串
   */
  generateMockFunction(parsedInterface: ParsedInterface): string {
    const { name, properties } = parsedInterface;
    
    const functionBody = this.generateFunctionBody(properties);
    const interfaceDefinition = this.generateInterfaceDefinition(parsedInterface);
    
    return `${interfaceDefinition}

/**
 * 生成 ${name} 类型的mock数据
 * @param count 生成的数据条数，默认为1
 * @returns mock数据或mock数据数组
 * @description 你需要在文件顶部手动 import { faker } from '@faker-js/faker';
 */
export function generate${name}Mock(count: number = 1): ${name} | ${name}[] {
  const generateSingle = (): ${name} => {
    return {
${functionBody}
    };
  };
  
  if (count === 1) {
    return generateSingle();
  }
  
  return Array.from({ length: count }, () => generateSingle());
}`;
  }

  /**
   * 生成函数体
   */
  private generateFunctionBody(properties: PropertyType[]): string {
    return properties
      .map(property => {
        const indent = '      ';
        const propertyName = property.name;
        const fakeMethod = this.getFakeMethodForProperty(property);
        
        // 确保所有字段都生成完整的数据，包括可选字段
        // 这样可以保证生成的mock数据包含所有字段
        return `${indent}${propertyName}: ${fakeMethod},`;
      })
      .join('\n');
  }

  /**
   * 生成接口定义
   */
  private generateInterfaceDefinition(parsedInterface: ParsedInterface): string {
    const { name, properties } = parsedInterface;
    const propertiesString = properties
      .map(prop => {
        const typeString = this.getTypeScriptType(prop);
        const optional = prop.isOptional ? '?' : '';
        return `  ${prop.name}${optional}: ${typeString};`;
      })
      .join('\n');

    return `interface ${name} {
${propertiesString}
}`;
  }

  /**
   * 获取TypeScript类型字符串
   */
  private getTypeScriptType(property: PropertyType): string {
    if (property.isArray) {
      const baseType = this.getBaseTypeScriptType(property);
      return `${baseType}[]`;
    }
    
    if (property.isUnion) {
      return property.unionTypes.join(' | ');
    }
    
    if (property.isObject && property.objectProperties) {
      return this.generateObjectType(property.objectProperties);
    }
    
    if (property.isEnum && property.enumValues) {
      return property.enumValues.map(v => `'${v}'`).join(' | ');
    }
    
    return this.getBaseTypeScriptType(property);
  }

  /**
   * 获取基础TypeScript类型
   */
  private getBaseTypeScriptType(property: PropertyType): string {
    const typeMap: Record<string, string> = {
      'string': 'string',
      'number': 'number',
      'boolean': 'boolean',
      'Date': 'Date',
      'email': 'string',
      'url': 'string',
      'phone': 'string',
      'name': 'string',
      'address': 'string',
      'city': 'string',
      'country': 'string',
      'uuid': 'string',
      'id': 'string',
      'time': 'string',
      'timestamp': 'number',
      'datetime': 'string',
    };
    
    // 检查是否匹配特定类型
    for (const [key, type] of Object.entries(typeMap)) {
      if (property.type.toLowerCase().includes(key)) {
        return type;
      }
    }
    
    // 默认返回字符串
    return 'string';
  }

  /**
   * 生成对象类型
   */
  private generateObjectType(properties: PropertyType[]): string {
    const propertiesString = properties
      .map(prop => {
        const typeString = this.getTypeScriptType(prop);
        const optional = prop.isOptional ? '?' : '';
        return `    ${prop.name}${optional}: ${typeString};`;
      })
      .join('\n');
    
    return `{
${propertiesString}
  }`;
  }

  /**
   * 为属性获取faker.js方法
   */
  private getFakeMethodForProperty(property: PropertyType): string {
    if (property.isArray) {
      if (property.objectProperties && property.objectProperties.length > 0) {
        // 对象数组，递归生成对象mock
        const objectFake = this.generateObjectFakeMethod(property.objectProperties);
        return `Array.from({length: faker.number.int({ min: 1, max: 5 })}, () => ${objectFake})`;
      } else {
        // 基础类型数组
        const baseMethod = this.getBaseFakeMethod(property);
        return `Array.from({length: faker.number.int({ min: 1, max: 5 })}, () => ${baseMethod})`;
      }
    }
    
    if (property.isUnion) {
      const unionMethods = property.unionTypes.map(type => {
        // 检查联合类型中的对象类型
        if (type.startsWith('{') && type.endsWith('}')) {
          // 如果是对象类型，递归解析并生成对象mock
          const objectProperties = this.parseObjectProperties(type);
          return this.generateObjectFakeMethod(objectProperties);
        }
        // 检查是否是枚举值（带引号的字符串）
        if (type.startsWith("'") && type.endsWith("'")) {
          return `'${type.slice(1, -1)}'`;
        }
        return this.getFakeMethodForType(type, property.name);
      });
      return `faker.helpers.arrayElement([${unionMethods.join(', ')}])`;
    }
    
    if (property.isObject && property.objectProperties) {
      return this.generateObjectFakeMethod(property.objectProperties);
    }
    
    if (property.isEnum && property.enumValues) {
      return `faker.helpers.arrayElement([${property.enumValues.map(v => `'${v}'`).join(', ')}])`;
    }
    
    return this.getFakeMethodForType(property.type, property.name);
  }

  /**
   * 生成对象类型的fake方法
   */
  private generateObjectFakeMethod(properties: PropertyType[]): string {
    const objectBody = properties
      .map(prop => {
        const fakeMethod = this.getFakeMethodForProperty(prop);
        return `        ${prop.name}: ${fakeMethod}`;
      })
      .join(',\n');
    
    return `{\n${objectBody}\n      }`;
  }

  /**
   * 根据类型获取faker.js方法
   */
  private getFakeMethodForType(type: string, propertyName?: string): string {
    const typeMap: Record<string, string> = {
      'string': 'faker.string.sample()',
      'number': 'faker.number.int({ min: 1, max: 1000 })',
      'boolean': 'faker.datatype.boolean()',
      'Date': 'faker.date.recent()',
      'email': 'faker.internet.email()',
      'url': 'faker.internet.url()',
      'phone': 'faker.phone.number()',
      'name': 'faker.person.fullName()',
      'address': 'faker.location.streetAddress()',
      'city': 'faker.location.city()',
      'country': 'faker.location.country()',
      'uuid': 'faker.string.uuid()',
      'id': 'faker.string.uuid()',
    };
    
    // 先根据属性名匹配特定类型
    if (propertyName) {
      const nameLower = propertyName.toLowerCase();
      
      // 时间相关字段处理
      if (nameLower === 'time' || nameLower.includes('time')) {
        // 根据类型决定返回Date对象还是时间字符串
        if (type.toLowerCase().includes('date') || type === 'Date') {
          return 'faker.date.recent()';
        } else {
          // 返回ISO格式的时间字符串
          return 'faker.date.recent().toISOString()';
        }
      }
      
      if (nameLower === 'timestamp' || nameLower.includes('timestamp')) {
        // 时间戳通常是数字
        if (type.toLowerCase().includes('number') || type === 'number') {
          return 'faker.date.recent().getTime()';
        } else {
          // 字符串格式的时间戳
          return 'faker.date.recent().toISOString()';
        }
      }
      
      if (nameLower === 'datetime' || nameLower.includes('datetime')) {
        return 'faker.date.recent().toISOString()';
      }
      
      if (nameLower === 'created' || nameLower.includes('created')) {
        // 创建时间通常是过去的时间
        return 'faker.date.past()';
      }
      
      if (nameLower === 'updated' || nameLower.includes('updated')) {
        // 更新时间可能是最近的时间
        return 'faker.date.recent()';
      }
      
      if (nameLower === 'birthday' || nameLower.includes('birthday') || nameLower.includes('birth')) {
        // 生日通常是过去的时间
        return 'faker.date.past({ years: 18 })';
      }
      
      // 其他字段处理
      if (nameLower === 'id' || nameLower.includes('id')) {
        return 'faker.string.uuid()';
      }
      if (nameLower === 'email' || nameLower.includes('email')) {
        return 'faker.internet.email()';
      }
      if (nameLower === 'name' || nameLower.includes('name')) {
        return 'faker.person.fullName()';
      }
      if (nameLower === 'phone' || nameLower.includes('phone')) {
        return 'faker.phone.number()';
      }
      if (nameLower === 'url' || nameLower.includes('url')) {
        return 'faker.internet.url()';
      }
      if (nameLower === 'address' || nameLower.includes('address')) {
        return 'faker.location.streetAddress()';
      }
      if (nameLower === 'city' || nameLower.includes('city')) {
        return 'faker.location.city()';
      }
      if (nameLower === 'country' || nameLower.includes('country')) {
        return 'faker.location.country()';
      }
    }
    
    // 再根据类型匹配
    for (const [key, method] of Object.entries(typeMap)) {
      if (type.toLowerCase().includes(key)) {
        return method;
      }
    }
    
    // 默认返回字符串
    return 'faker.string.sample()';
  }

  /**
   * 获取基础fake方法（用于数组）
   */
  private getBaseFakeMethod(property: PropertyType): string {
    const baseProperty = { ...property, isArray: false };
    return this.getFakeMethodForProperty(baseProperty);
  }

  /**
   * 生成mock数据
   * @param parsedInterface 解析后的interface信息
   * @param count 生成的数据条数
   * @returns mock数据数组
   */
  generateMockData(parsedInterface: ParsedInterface, count: number = 1): any[] {
    const mockData: any[] = [];
    
    for (let i = 0; i < count; i++) {
      const item: any = {};
      
      for (const property of parsedInterface.properties) {
        // 确保所有字段都被生成，包括可选字段
        // 对于可选字段，仍然生成值，但在生成的函数中会通过条件判断决定是否包含
        item[property.name] = this.generatePropertyValue(property);
      }
      
      mockData.push(item);
    }
    
    return count === 1 ? mockData[0] : mockData;
  }

  /**
   * 生成属性值
   */
  private generatePropertyValue(property: PropertyType): any {
    if (property.isArray) {
      const length = Math.floor(Math.random() * 5) + 1;
      return Array.from({ length }, () => this.generateBasePropertyValue(property));
    }
    
    if (property.isUnion) {
      const randomType = property.unionTypes[Math.floor(Math.random() * property.unionTypes.length)];
      return this.generateValueForType(randomType);
    }
    
    if (property.isObject && property.objectProperties) {
      const obj: any = {};
      for (const prop of property.objectProperties) {
        obj[prop.name] = this.generatePropertyValue(prop);
      }
      return obj;
    }
    
    if (property.isEnum && property.enumValues) {
      return property.enumValues[Math.floor(Math.random() * property.enumValues.length)];
    }
    
    return this.generateValueForType(property.type);
  }

  /**
   * 生成基础属性值（用于数组）
   */
  private generateBasePropertyValue(property: PropertyType): any {
    const baseProperty = { ...property, isArray: false };
    return this.generatePropertyValue(baseProperty);
  }

  /**
   * 根据类型生成值
   */
  private generateValueForType(type: string): any {
    const typeMap: Record<string, () => any> = {
      'string': () => `Sample ${Math.random().toString(36).substring(7)}`,
      'number': () => Math.floor(Math.random() * 1000) + 1,
      'boolean': () => Math.random() > 0.5,
      'Date': () => new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      'email': () => `user${Math.random().toString(36).substring(7)}@example.com`,
      'url': () => `https://example.com/${Math.random().toString(36).substring(7)}`,
      'phone': () => `+1-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
      'name': () => `User ${Math.random().toString(36).substring(7)}`,
      'address': () => `${Math.floor(Math.random() * 9999) + 1} Main St`,
      'city': () => ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'][Math.floor(Math.random() * 5)],
      'country': () => ['USA', 'Canada', 'UK', 'Germany', 'France'][Math.floor(Math.random() * 5)],
      'uuid': () => `uuid-${Math.random().toString(36).substring(7)}`,
      'id': () => `id-${Math.random().toString(36).substring(7)}`,
    };
    
    // 检查是否匹配特定类型
    for (const [key, generator] of Object.entries(typeMap)) {
      if (type.toLowerCase().includes(key)) {
        return generator();
      }
    }
    
    // 默认返回字符串
    return `Sample ${Math.random().toString(36).substring(7)}`;
  }

  /**
   * 解析对象属性（用于联合类型中的对象）
   */
  private parseObjectProperties(objectType: string): PropertyType[] {
    // 简单的对象属性解析，用于联合类型中的对象
    const content = objectType.slice(1, -1);
    const properties: PropertyType[] = [];
    
    const lines = content.split(';').map(line => line.trim()).filter(line => line.length > 0);
    
    for (const line of lines) {
      const match = line.match(/^(\w+)\s*(\?)?\s*:\s*(.+)$/);
      if (match) {
        const [, name, optional, typeDef] = match;
        const isOptional = !!optional;
        const cleanTypeDef = typeDef.trim();
        
        // 简单的类型解析
        const isArray = cleanTypeDef.endsWith('[]');
        const baseType = isArray ? cleanTypeDef.slice(0, -2) : cleanTypeDef;
        
        properties.push({
          name,
          isOptional,
          type: baseType,
          isArray,
          isUnion: false,
          unionTypes: [],
          isObject: false,
          objectProperties: [],
          isEnum: false,
          enumValues: [],
        });
      }
    }
    
    return properties;
  }
} 