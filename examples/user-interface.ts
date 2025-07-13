// 用户相关的TypeScript interface示例

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

interface Order {
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

interface BlogPost {
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
  comments: Array<{
    id: string;
    author: string;
    content: string;
    createdAt: Date;
  }>;
}

// 导出所有interface
export type { User, Product, Order, BlogPost }; 