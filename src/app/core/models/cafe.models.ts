export type OrderStatus = 'accepted' | 'preparing' | 'ready' | 'served';

export interface Establishment {
  id: string;
  name: string;
  address: string;
}

export interface UserSession {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    establishmentId: string;
  };
}

export interface MenuCategory {
  id: string;
  name: string;
}

export interface MenuItem {
  id: string;
  establishmentId: string;
  categoryId: string;
  name: string;
  price: number;
  active: boolean;
}

export interface CafeTable {
  id: string;
  establishmentId: string;
  number: number;
  seats: number;
  occupied: boolean;
}

export interface PromoCode {
  code: string;
  discountPercent: number;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  establishmentId: string;
  tableId: string | null;
  guestCount: number;
  status: OrderStatus;
  items: OrderItem[];
  discountPercent: number;
  promoCode: string | null;
  createdAt: string;
}

export interface CafeSnapshot {
  establishments: Establishment[];
  categories: MenuCategory[];
  menuItems: MenuItem[];
  tables: CafeTable[];
  orders: Order[];
  promoCodes: PromoCode[];
}

export interface OrderDraft {
  tableId: string | null;
  guestCount: number;
  items: OrderItem[];
  promoCode: string;
}

export interface SalesMetrics {
  revenue: number;
  averageCheck: number;
  activeOrders: number;
  servedOrders: number;
}

export interface PopularItem {
  name: string;
  quantity: number;
  revenue: number;
}
