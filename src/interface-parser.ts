/**
 * TypeScript Interface 解析器
 * 解析TypeScript interface定义并提取类型信息
 */

export interface PropertyType {
  name: string;
  type: string;
  isOptional: boolean;
  isArray: boolean;
  isUnion: boolean;
  unionTypes: string[];
  isObject: boolean;
  objectProperties?: PropertyType[];
  isEnum: boolean;
  enumValues?: string[];
}

export interface ParsedInterface {
  name: string;
  properties: PropertyType[];
}

export class InterfaceParser {
  /**
   * 解析TypeScript interface定义
   * @param interfaceDef interface定义字符串
   * @returns 解析后的interface信息
   */
  parse(interfaceDef: string): ParsedInterface {
    // 清理输入，移除注释和多余空格
    const cleaned = this.cleanInterfaceDefinition(interfaceDef);
    
    // 提取interface名称
    const nameMatch = cleaned.match(/interface\s+(\w+)/);
    if (!nameMatch) {
      throw new Error('无法找到interface名称');
    }
    
    const name = nameMatch[1];
    
    // 提取属性定义
    const propertiesMatch = cleaned.match(/\{([\s\S]*)\}/);
    if (!propertiesMatch) {
      throw new Error('无法找到interface属性定义');
    }
    
    const propertiesText = propertiesMatch[1];
    const properties = this.parseProperties(propertiesText);
    
    return {
      name,
      properties,
    };
  }

  /**
   * 清理interface定义字符串
   */
  private cleanInterfaceDefinition(def: string): string {
    return def
      .replace(/\/\*[\s\S]*?\*\//g, '') // 移除多行注释
      .replace(/\/\/.*$/gm, '') // 移除单行注释
      .replace(/^[ \t]+|[ \t]+$/gm, '') // 去除每行首尾空白
      .replace(/\n{2,}/g, '\n') // 多余空行合并为一行
      .trim();
  }

  /**
   * 解析属性定义
   */
  private parseProperties(propertiesText: string): PropertyType[] {
    const properties: PropertyType[] = [];
    // 用分号分割字段，支持嵌套对象整体提取
    const fields = this.smartSplitFields(propertiesText);

    for (const field of fields) {
      // 移除行内注释
      const line = field.replace(/\/\/.*$/, '').trim();
      if (!line) continue;
      // 支持可选、数组、联合类型、对象类型等
      // 字段名可以包含下划线，类型可以包含泛型、数组、联合、对象等
      const match = line.match(/^(\w+)\s*(\?)?\s*:\s*([\s\S]+)$/);
      if (!match) continue;
      const [, name, optional, typeDef] = match;
      const isOptional = !!optional;
      const cleanTypeDef = typeDef.trim();
      const typeInfo = this.parseType(cleanTypeDef);
      properties.push({ name, isOptional, ...typeInfo });
    }
    return properties;
  }

  /**
   * 智能分割字段，支持嵌套对象整体提取
   */
  private smartSplitFields(text: string): string[] {
    const fields: string[] = [];
    let current = '';
    let depth = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '{') depth++;
      if (char === '}') depth--;
      if (char === ';' && depth === 0) {
        fields.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    if (current.trim()) fields.push(current);
    return fields.map(f => f.trim()).filter(f => f.length > 0);
  }

  /**
   * 解析单个属性
   */
  private parseProperty(line: string): PropertyType | null {
    // 匹配属性定义: name: type
    const match = line.match(/^(\w+)\s*(\?)?\s*:\s*(.+)$/);
    if (!match) return null;
    
    const [, name, optional, typeDef] = match;
    const isOptional = !!optional;
    
    // 解析类型定义，去掉末尾分号
    const cleanTypeDef = typeDef.trim().replace(/;$/, '');
    const typeInfo = this.parseType(cleanTypeDef);
    
    return {
      name,
      isOptional,
      ...typeInfo,
    };
  }

  /**
   * 解析类型定义
   */
  private parseType(typeDef: string): Omit<PropertyType, 'name' | 'isOptional'> {
    // 检查是否为数组类型
    const isArray = typeDef.endsWith('[]') || typeDef.includes('Array<');
    let baseType = typeDef;
    let objectProperties: PropertyType[] = [];

    // 新增：辅助函数，提取Array<...>的完整内容，支持多行和嵌套
    function extractGenericContent(str: string, start: number): { content: string, end: number } {
      let depth = 0;
      let i = start;
      let content = '';
      for (; i < str.length; i++) {
        if (str[i] === '<') {
          depth++;
          if (depth === 1) continue; // 跳过第一个 <
        } else if (str[i] === '>') {
          if (depth === 1) break;
          depth--;
        }
        if (depth >= 1) content += str[i];
      }
      return { content, end: i };
    }

    if (isArray) {
      if (typeDef.endsWith('[]')) {
        baseType = typeDef.slice(0, -2).trim();
      } else if (typeDef.includes('Array<')) {
        // 用括号计数法提取Array<...>内容
        const arrayStart = typeDef.indexOf('Array<') + 5; // 指向 < 字符
        const { content, end } = extractGenericContent(typeDef, arrayStart);
        baseType = content.trim();
      }
      // 如果数组元素是对象，递归解析对象属性
      if (baseType.startsWith('{') && baseType.endsWith('}')) {
        objectProperties = this.parseProperties(baseType.slice(1, -1));
        // type字段保留为对象结构，但不要重复大括号
        baseType = baseType;
      }
    }
    // 检查是否为联合类型
    const isUnion = baseType.includes('|');
    let unionTypes: string[] = [];
    if (isUnion) {
      unionTypes = baseType.split('|').map(t => t.trim().replace(/['"]/g, ''));
    }
    // 检查是否为对象类型
    const isObject = baseType.startsWith('{') && baseType.endsWith('}');
    if (isObject && !isArray) {
      objectProperties = this.parseProperties(baseType.slice(1, -1));
    }
    // 检查是否为枚举类型
    const isEnum = baseType.includes('enum');
    let enumValues: string[] = [];
    if (isEnum) {
      // 简单的枚举值提取，实际项目中可能需要更复杂的解析
      const enumMatch = baseType.match(/enum\s*\{([^}]+)\}/);
      if (enumMatch) {
        enumValues = enumMatch[1].split(',').map(v => v.trim().replace(/['"]/g, ''));
      }
    }
    return {
      type: baseType,
      isArray,
      isUnion,
      unionTypes,
      isObject,
      objectProperties,
      isEnum,
      enumValues,
    };
  }

  /**
   * 获取faker.js对应的生成器方法
   */
  getFakeGeneratorMethod(property: PropertyType): string {
    if (property.isArray) {
      return `faker.helpers.arrayElements([${this.getBaseFakeMethod(property)}], ${this.getArrayLength()})`;
    }
    
    if (property.isUnion) {
      const unionMethods = property.unionTypes.map(type => this.getFakeMethodForType(type));
      return `faker.helpers.arrayElement([${unionMethods.join(', ')}])`;
    }
    
    return this.getFakeMethodForType(property.type);
  }

  /**
   * 根据类型获取faker.js方法
   */
  private getFakeMethodForType(type: string): string {
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
    
    // 检查是否匹配特定类型
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
    return this.getFakeMethodForType(baseProperty.type);
  }

  /**
   * 获取数组长度
   */
  private getArrayLength(): string {
    return 'faker.number.int({ min: 1, max: 5 })';
  }
} 