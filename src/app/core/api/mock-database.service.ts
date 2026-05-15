import { Injectable } from '@angular/core';

import { initialCafeSnapshot } from '../data/seed-data';
import {
  CafeSnapshot,
  CafeTable,
  MenuItem,
  NutritionFacts,
  Order,
  OrderStatus,
} from '../models/cafe.models';
import { orderTotal } from './calculations';

const DB_KEY = 'cafe-orders-db';

@Injectable({ providedIn: 'root' })
export class MockDatabaseService {
  snapshot(): CafeSnapshot {
    const value = localStorage.getItem(DB_KEY);

    if (!value) {
      this.persist(initialCafeSnapshot);
      return cloneSnapshot(initialCafeSnapshot);
    }

    try {
      const snapshot = normalizeSnapshot(JSON.parse(value) as CafeSnapshot);
      this.persist(snapshot);
      return snapshot;
    } catch {
      this.persist(initialCafeSnapshot);
      return cloneSnapshot(initialCafeSnapshot);
    }
  }

  login(email: string, password: string, establishmentId: string) {
    const snapshot = this.snapshot();
    const establishment = snapshot.establishments.find((item) => item.id === establishmentId);

    if (!establishment || password.length < 4) {
      throw new Error('Неверные учетные данные или заведение');
    }

    return {
      token: `mock-jwt-${establishmentId}-${Date.now()}`,
      user: {
        id: 'u-admin',
        email,
        name: 'Администратор смены',
        establishmentId,
      },
    };
  }

  updateOrderStatus(orderId: string, status: OrderStatus): CafeSnapshot {
    return this.update((snapshot) => ({
      ...snapshot,
      orders: snapshot.orders.map((order) => (order.id === orderId ? { ...order, status } : order)),
      tables:
        status === 'served'
          ? snapshot.tables.map((table) =>
              snapshot.orders.some((order) => order.id === orderId && order.tableId === table.id)
                ? { ...table, occupied: false }
                : table,
            )
          : snapshot.tables,
    }));
  }

  createOrder(order: Omit<Order, 'id' | 'createdAt' | 'status'>): CafeSnapshot {
    return this.update((snapshot) => {
      const nextId = String(Math.max(100, ...snapshot.orders.map((item) => Number(item.id))) + 1);
      const nextOrder: Order = {
        ...order,
        id: nextId,
        status: 'accepted',
        createdAt: new Date().toISOString(),
      };

      return {
        ...snapshot,
        orders: [nextOrder, ...snapshot.orders],
        tables: snapshot.tables.map((table) =>
          table.id === order.tableId ? { ...table, occupied: true } : table,
        ),
      };
    });
  }

  updateOrderItems(orderId: string, items: Order['items']): CafeSnapshot {
    return this.update((snapshot) => ({
      ...snapshot,
      orders: snapshot.orders.map((order) => (order.id === orderId ? { ...order, items } : order)),
    }));
  }

  upsertMenuItem(item: MenuItem): CafeSnapshot {
    return this.update((snapshot) => {
      const exists = snapshot.menuItems.some((menuItem) => menuItem.id === item.id);

      return {
        ...snapshot,
        menuItems: exists
          ? snapshot.menuItems.map((menuItem) => (menuItem.id === item.id ? item : menuItem))
          : [{ ...item, id: `m${Date.now()}` }, ...snapshot.menuItems],
      };
    });
  }

  deleteMenuItem(itemId: string): CafeSnapshot {
    return this.update((snapshot) => ({
      ...snapshot,
      menuItems: snapshot.menuItems.filter((item) => item.id !== itemId),
    }));
  }

  updateTable(table: CafeTable): CafeSnapshot {
    return this.update((snapshot) => ({
      ...snapshot,
      tables: snapshot.tables.map((item) => (item.id === table.id ? table : item)),
    }));
  }

  revenueForOrder(orderId: string): number {
    const order = this.snapshot().orders.find((item) => item.id === orderId);
    return order ? orderTotal(order) : 0;
  }

  private update(updater: (snapshot: CafeSnapshot) => CafeSnapshot): CafeSnapshot {
    const next = updater(this.snapshot());
    this.persist(next);
    return next;
  }

  private persist(snapshot: CafeSnapshot): void {
    localStorage.setItem(DB_KEY, JSON.stringify(snapshot));
  }
}

function cloneSnapshot(snapshot: CafeSnapshot): CafeSnapshot {
  return JSON.parse(JSON.stringify(snapshot)) as CafeSnapshot;
}

function normalizeSnapshot(snapshot: CafeSnapshot): CafeSnapshot {
  const seedById = new Map(initialCafeSnapshot.menuItems.map((item) => [item.id, item]));

  return {
    ...snapshot,
    menuItems: snapshot.menuItems.map((item) => {
      const seed = seedById.get(item.id);

      return {
        ...item,
        ingredients: item.ingredients || seed?.ingredients || 'Состав уточняется',
        nutrition: normalizeNutrition(item.nutrition, seed?.nutrition),
      };
    }),
  };
}

function normalizeNutrition(
  nutrition: NutritionFacts | undefined,
  fallback: NutritionFacts | undefined,
): NutritionFacts {
  return {
    calories: nutrition?.calories ?? fallback?.calories ?? 0,
    protein: nutrition?.protein ?? fallback?.protein ?? 0,
    fat: nutrition?.fat ?? fallback?.fat ?? 0,
    carbs: nutrition?.carbs ?? fallback?.carbs ?? 0,
  };
}
