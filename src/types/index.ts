export interface Product {
  id: number;
  external_id: string;
  name: string;
  description?: string;
  base_price?: number;
  currency?: string;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Inventory {
  id: number;
  product_id: number;
  date: string;
  total_quantity: number;
  available_quantity: number;
  reserved_quantity: number;
  created_at: Date;
  updated_at: Date;
}

export interface AvailabilityResponse {
  productId: string;
  productName: string;
  date: string;
  availability: {
    available: number;
    total: number;
  };
}
