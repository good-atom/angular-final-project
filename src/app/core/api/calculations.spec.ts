import { Order } from '../models/cafe.models';
import {
  filterOrdersByDay,
  metricsForDay,
  orderSubtotal,
  orderTotal,
  popularItems,
  splitOrderTotal,
} from './calculations';

const baseOrder: Order = {
  id: '1',
  establishmentId: 'cafe-center',
  tableId: 't1',
  guestCount: 2,
  status: 'served',
  discountPercent: 10,
  promoCode: 'LUNCH10',
  createdAt: '2026-04-25T10:00:00.000Z',
  items: [
    { menuItemId: 'm1', name: 'Капучино', price: 240, quantity: 2 },
    { menuItemId: 'm2', name: 'Паста', price: 520, quantity: 1 },
  ],
};

describe('order calculations', () => {
  it('calculates subtotal from all order lines', () => {
    expect(orderSubtotal(baseOrder)).toBe(1000);
  });

  it('applies discount to total', () => {
    expect(orderTotal(baseOrder)).toBe(900);
  });

  it('splits total between guests with rounding up', () => {
    expect(splitOrderTotal({ ...baseOrder, guestCount: 4 })).toBe(225);
  });

  it('returns total when guest count is zero', () => {
    expect(splitOrderTotal({ ...baseOrder, guestCount: 0 })).toBe(900);
  });

  it('filters orders by calendar day', () => {
    const orders = [baseOrder, { ...baseOrder, id: '2', createdAt: '2026-04-24T21:00:00.000Z' }];

    expect(filterOrdersByDay(orders, '2026-04-25').map((order) => order.id)).toEqual(['1']);
  });

  it('counts revenue and average check from served orders only', () => {
    const metrics = metricsForDay(
      [baseOrder, { ...baseOrder, id: '2', status: 'ready', discountPercent: 0 }],
      '2026-04-25',
    );

    expect(metrics).toEqual({
      revenue: 900,
      averageCheck: 900,
      activeOrders: 1,
      servedOrders: 1,
    });
  });

  it('sorts popular items by sold quantity', () => {
    const items = popularItems(
      [
        baseOrder,
        {
          ...baseOrder,
          id: '2',
          items: [{ menuItemId: 'm3', name: 'Чизкейк', price: 360, quantity: 3 }],
        },
      ],
      '2026-04-25',
    );

    expect(items[0]).toMatchObject({ name: 'Чизкейк', quantity: 3 });
    expect(items[1]).toMatchObject({ name: 'Капучино', quantity: 2 });
  });
});
