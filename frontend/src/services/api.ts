import type {
  Customer,
  CustomerFormData,
  DashboardStats,
  Order,
  OrderFormData,
  PaginatedResponse,
  Product,
  ProductFormData,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    let message = 'An unexpected error occurred';
    try {
      const error = await response.json();
      if (typeof error.detail === 'string') {
        message = error.detail;
      } else if (Array.isArray(error.detail)) {
        message = error.detail.map((e: { msg: string }) => e.msg).join(', ');
      }
    } catch {
      message = response.statusText;
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export const api = {
  getDashboardStats: () => request<DashboardStats>('/dashboard/stats'),

  getProducts: (skip = 0, limit = 100) =>
    request<PaginatedResponse<Product>>(`/products?skip=${skip}&limit=${limit}`),

  getProduct: (id: string) => request<Product>(`/products/${id}`),

  createProduct: (data: ProductFormData) =>
    request<Product>('/products', {
      method: 'POST',
      body: JSON.stringify({
        name: data.name,
        sku: data.sku,
        price: parseFloat(data.price),
        quantity_in_stock: parseInt(data.quantity_in_stock, 10),
      }),
    }),

  updateProduct: (id: string, data: Partial<ProductFormData>) =>
    request<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        ...(data.name !== undefined && { name: data.name }),
        ...(data.sku !== undefined && { sku: data.sku }),
        ...(data.price !== undefined && { price: parseFloat(data.price) }),
        ...(data.quantity_in_stock !== undefined && {
          quantity_in_stock: parseInt(data.quantity_in_stock, 10),
        }),
      }),
    }),

  deleteProduct: (id: string) =>
    request<void>(`/products/${id}`, { method: 'DELETE' }),

  getCustomers: (skip = 0, limit = 100) =>
    request<PaginatedResponse<Customer>>(`/customers?skip=${skip}&limit=${limit}`),

  getCustomer: (id: string) => request<Customer>(`/customers/${id}`),

  createCustomer: (data: CustomerFormData) =>
    request<Customer>('/customers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  deleteCustomer: (id: string) =>
    request<void>(`/customers/${id}`, { method: 'DELETE' }),

  getOrders: (skip = 0, limit = 100) =>
    request<PaginatedResponse<Order>>(`/orders?skip=${skip}&limit=${limit}`),

  getOrder: (id: string) => request<Order>(`/orders/${id}`),

  createOrder: (data: OrderFormData) =>
    request<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify({
        customer_id: data.customer_id,
        items: data.items.map((item) => ({
          product_id: item.product_id,
          quantity: parseInt(item.quantity, 10),
        })),
      }),
    }),

  deleteOrder: (id: string) =>
    request<void>(`/orders/${id}`, { method: 'DELETE' }),
};
