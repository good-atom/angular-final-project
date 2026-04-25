import { Order, PopularItem, SalesMetrics } from '../models/cafe.models';

export function orderSubtotal(order: Pick<Order, 'items'>): number {
  return order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function orderTotal(order: Pick<Order, 'items' | 'discountPercent'>): number {
  const subtotal = orderSubtotal(order);
  return Math.round(subtotal * (1 - order.discountPercent / 100));
}

export function splitOrderTotal(order: Pick<Order, 'items' | 'discountPercent' | 'guestCount'>): number {
  return order.guestCount > 0 ? Math.ceil(orderTotal(order) / order.guestCount) : orderTotal(order);
}

export function metricsForDay(orders: Order[], dayIso: string): SalesMetrics {
  const dayOrders = filterOrdersByDay(orders, dayIso);
  const servedOrders = dayOrders.filter((order) => order.status === 'served');
  const revenue = servedOrders.reduce((sum, order) => sum + orderTotal(order), 0);

  return {
    revenue,
    averageCheck: servedOrders.length ? Math.round(revenue / servedOrders.length) : 0,
    activeOrders: dayOrders.filter((order) => order.status !== 'served').length,
    servedOrders: servedOrders.length,
  };
}

export function popularItems(orders: Order[], dayIso: string): PopularItem[] {
  const items = new Map<string, PopularItem>();

  for (const order of filterOrdersByDay(orders, dayIso)) {
    for (const item of order.items) {
      const existing = items.get(item.name) ?? { name: item.name, quantity: 0, revenue: 0 };
      existing.quantity += item.quantity;
      existing.revenue += item.quantity * item.price;
      items.set(item.name, existing);
    }
  }

  return [...items.values()].sort((a, b) => b.quantity - a.quantity || b.revenue - a.revenue);
}

export function filterOrdersByDay(orders: Order[], dayIso: string): Order[] {
  const day = dayIso.slice(0, 10);
  return orders.filter((order) => order.createdAt.slice(0, 10) === day);
}
