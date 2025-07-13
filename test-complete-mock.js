import { FakeGenerator } from './dist/fake-generator.js';
import { InterfaceParser } from './dist/interface-parser.js';

// 用你的ISalesOrderDetailListItem interface做测试
const complexInterface = `
export interface ISalesOrderDetailListItem {
  amazonAsin: string;
  buyerMessage: string;
  existBunded: number;
  id: string;
  itemId: string;
  itemImgUrl: string;
  listingSku: string;
  qty: number;
  remark: string;
  shippingRemark: string;
  title: string;
  platformOrderDetailId: string;
  labelValues: string;
  labelRemarks: string;
  srn: string;
  carModelAttr: string;
  carModelMatch: string;
}
`;

const parser = new InterfaceParser();
const generator = new FakeGenerator();

// 解析interface
const parsed = parser.parse(complexInterface);

// 生成mock函数
const mockFunction = generator.generateMockFunction(parsed);
console.log('生成的mock函数:');
console.log(mockFunction);

// 生成mock数据
const mockData = generator.generateMockData(parsed, 2);
console.log('\n生成的mock数据:');
console.log(JSON.stringify(mockData, null, 2));

// 验证所有字段都存在
console.log('\n验证字段完整性:');
const expectedFields = [
  'amazonAsin', 'buyerMessage', 'existBunded', 'id', 'itemId', 'itemImgUrl',
  'listingSku', 'qty', 'remark', 'shippingRemark', 'title', 'platformOrderDetailId',
  'labelValues', 'labelRemarks', 'srn', 'carModelAttr', 'carModelMatch'
];
mockData.forEach((item, index) => {
  console.log(`\n数据 ${index + 1}:`);
  expectedFields.forEach(field => {
    if (field in item) {
      console.log(`  ✓ ${field}: ${typeof item[field]} - ${JSON.stringify(item[field]).substring(0, 50)}...`);
    } else {
      console.log(`  ✗ ${field}: 缺失`);
    }
  });
}); 