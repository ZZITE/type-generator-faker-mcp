// TypeScript type别名示例

// 1. 基本type别名
type User = {
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

// 2. 复杂type别名
type Product = {
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

// 3. 复杂type别名
type Order = {
  id: string;
  userId: string;
  products: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// 4. 联合类型type别名
type Status = 'active' | 'inactive' | 'pending' | 'suspended';

type BlogPost = {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    email: string;
  };
  tags: string[];
  publishedAt: Date;
  isPublished: boolean;
  readTime: number;
  likes: number;
  status: Status;
  comments: Array<{
    id: string;
    author: string;
    content: string;
    createdAt: Date;
  }>;
}

// 5. 泛型type别名
type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
  timestamp: Date;
}

type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// 6. 工具类型
type PartialUser = Partial<User>;
type RequiredUser = Required<User>;
type PickUser = Pick<User, 'id' | 'name' | 'email'>;
type OmitUser = Omit<User, 'createdAt' | 'updatedAt'>;

// 导出所有type
export type { 
  User, 
  Product, 
  Order, 
  Status,
  BlogPost, 
  ApiResponse, 
  PaginatedResponse,
  PartialUser,
  RequiredUser,
  PickUser,
  OmitUser
}; 