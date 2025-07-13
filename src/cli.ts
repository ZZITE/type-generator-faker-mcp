#!/usr/bin/env node

// 引入依赖
import { Command } from 'commander';
import { FakeGenerator } from './fake-generator.js';
import { InterfaceParser } from './interface-parser.js';
import fs from 'fs';

// 创建命令行程序
const program = new Command();

program
  .name('type-generator-faker-mcp')
  .description('基于TypeScript interface生成mock数据的命令行工具')
  .option('-i, --interface <interface>', 'TypeScript接口字符串')
  .option('-f, --file <file>', '包含TypeScript接口定义的文件路径')
  .option('-c, --count <count>', '生成数据条数', '1')
  .option('-o, --output <output>', '输出文件路径（不指定则输出到控制台）')
  .parse(process.argv);

const options = program.opts();

// 读取接口定义
let interfaceStr = '';
if (options.interface) {
  interfaceStr = options.interface;
} else if (options.file) {
  try {
    interfaceStr = fs.readFileSync(options.file, 'utf-8');
  } catch (err) {
    console.error('读取文件失败:', err);
    process.exit(1);
  }
} else {
  console.error('请通过 --interface 或 --file 指定接口定义');
  process.exit(1);
}

// 解析接口并生成mock数据
const parser = new InterfaceParser();
const parsed = parser.parse(interfaceStr);
const generator = new FakeGenerator();
const count = parseInt(options.count, 10) || 1;
const mockData = generator.generateMockData(parsed, count);

// 输出结果
const outputStr = JSON.stringify(mockData, null, 2);
if (options.output) {
  try {
    fs.writeFileSync(options.output, outputStr, 'utf-8');
    console.log(`已写入到文件: ${options.output}`);
  } catch (err) {
    console.error('写入文件失败:', err);
    process.exit(1);
  }
} else {
  console.log(outputStr);
} 