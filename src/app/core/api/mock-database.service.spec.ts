import { TestBed } from '@angular/core/testing';

import { MockDatabaseService } from './mock-database.service';

describe('MockDatabaseService', () => {
  let service: MockDatabaseService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(MockDatabaseService);
  });

  it('seeds the initial snapshot', () => {
    const snapshot = service.snapshot();

    expect(snapshot.establishments.length).toBeGreaterThan(1);
    expect(snapshot.orders.map((order) => order.id)).toContain('102');
  });

  it('creates a login session for valid credentials', () => {
    const session = service.login('admin@cafe.local', 'demo1234', 'cafe-center');

    expect(session.token).toContain('mock-jwt-cafe-center');
    expect(session.user.establishmentId).toBe('cafe-center');
  });

  it('creates an order and marks the table occupied', () => {
    const snapshot = service.createOrder({
      establishmentId: 'cafe-center',
      tableId: 't1',
      guestCount: 2,
      discountPercent: 0,
      promoCode: null,
      items: [{ menuItemId: 'm1', name: 'Сырники', price: 390, quantity: 1 }],
    });

    expect(snapshot.orders[0].status).toBe('accepted');
    expect(snapshot.tables.find((table) => table.id === 't1')?.occupied).toBe(true);
  });

  it('frees a table when an order is served', () => {
    const snapshot = service.updateOrderStatus('102', 'served');

    expect(snapshot.orders.find((order) => order.id === '102')?.status).toBe('served');
    expect(snapshot.tables.find((table) => table.id === 't2')?.occupied).toBe(false);
  });

  it('upserts and deletes menu items', () => {
    const created = service.upsertMenuItem({
      id: '',
      establishmentId: 'cafe-center',
      categoryId: 'desserts',
      name: 'Пирог дня',
      price: 310,
      ingredients: 'Песочное тесто, яблоки, корица, сливочное масло',
      nutrition: { calories: 340, protein: 5, fat: 14, carbs: 48 },
      active: true,
    });
    const createdItem = created.menuItems.find((item) => item.name === 'Пирог дня');

    expect(createdItem).toBeDefined();
    expect(service.deleteMenuItem(createdItem?.id ?? '').menuItems).not.toContain(createdItem);
  });
});
