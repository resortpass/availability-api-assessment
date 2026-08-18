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

export interface ProductTimeslot {
  id: number;
  product_id: number;
  date: string;
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  available: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ProductTimeslotDetail {
  product_timeslot_id: number;
  description?: string | null;
  provider_name?: string | null;
  provider_id?: string | null;
  gender?: string | null;
  external_id?: string | null;
  created_at: Date;
  updated_at: Date;
}

export type ProductTimeslotWithDetail = ProductTimeslot &
  Pick<
    ProductTimeslotDetail,
    'description' | 'provider_name' | 'provider_id' | 'gender' | 'external_id'
  >;

export interface AvailabilityResponse {
  productId: string;
  productName: string;
  date: string;
  availability: {
    available: number;
    total: number;
  };
}
