#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { FakeGenerator } from './fake-generator.js';
import { InterfaceParser } from './interface-parser.js';

/**
 * MCP Fake Generator 服务器
 * 基于TypeScript interface使用faker.js生成mock数据
 */
class MCPFakeGeneratorServer {
  private server: Server;
  private fakeGenerator: FakeGenerator;
  private interfaceParser: InterfaceParser;

  constructor() {
    this.server = new Server(
      {
        name: 'mcp-fake-generator',
        version: '1.0.5',
      }
    );

    this.fakeGenerator = new FakeGenerator();
    this.interfaceParser = new InterfaceParser();

    this.setupToolHandlers();
  }

  /**
   * 设置工具处理器
   */
  private setupToolHandlers() {
    // 列出可用工具
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'generate_mock_data',
            description: '基于TypeScript interface生成mock数据函数',
            inputSchema: {
              type: 'object',
              properties: {
                interface: {
                  type: 'string',
                  description: 'TypeScript interface定义',
                },
                count: {
                  type: 'number',
                  description: '生成的数据条数，默认为1',
                  default: 1,
                },
              },
              required: ['interface'],
            },
          } as Tool,
        ],
      };
    });

    // 处理工具调用
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      if (name === 'generate_mock_data') {
        const { interface: interfaceDef, count = 1 } = args as {
          interface: string;
          count?: number;
        };

        try {
          // 解析TypeScript interface
          const parsedInterface = this.interfaceParser.parse(interfaceDef);
          
          // 生成mock数据函数
          const mockFunction = this.fakeGenerator.generateMockFunction(parsedInterface);
          
          // 生成示例数据
          const mockData = this.fakeGenerator.generateMockData(parsedInterface, count);

          return {
            content: [
              {
                type: 'text',
                text: `## 生成的Mock函数\n\n\`\`\`javascript\n${mockFunction}\n\`\`\`\n\n## 示例数据\n\n\`\`\`json\n${JSON.stringify(mockData, null, 2)}\n\`\`\``,
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: 'text',
                text: `错误: ${error instanceof Error ? error.message : String(error)}`,
              },
            ],
          };
        }
      }

      throw new Error(`未知的工具: ${name}`);
    });
  }

  /**
   * 启动服务器
   */
  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('MCP Fake Generator 服务器已启动');
  }
}

// 启动服务器
const server = new MCPFakeGeneratorServer();
server.run().catch(console.error); 