export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  quantity_in_stock: number;
  created_at: string;
}

export interface Customer {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  created_at: string;
}

export interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  product_name?: string;
}

export interface Order {
  id: string;
  customer_id: string;
  total_amount: number;
  created_at: string;
  customer_name?: string;
  items: OrderItem[];
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  skip: number;
  limit: number;
}

export interface DashboardStats {
  total_products: number;
  total_customers: number;
  total_orders: number;
  low_stock_products: Product[];
}

export interface ProductFormData {
  name: string;
  sku: string;
  price: string;
  quantity_in_stock: string;
}

export interface CustomerFormData {
  full_name: string;
  email: string;
  phone_number: string;
}

export interface OrderItemFormData {
  product_id: string;
  quantity: string;
}

export interface OrderFormData {
  customer_id: string;
  items: OrderItemFormData[];
}

export interface ApiError {
  detail: string | { msg: string }[];
}
