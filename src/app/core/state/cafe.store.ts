import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';

import { CafeApiService } from '../api/cafe-api.service';
import { metricsForDay, orderTotal, popularItems } from '../api/calculations';
import { AuthService } from '../auth/auth.service';
import {
  CafeSnapshot,
  CafeTable,
  MenuItem,
  Order,
  OrderItem,
  OrderStatus,
} from '../models/cafe.models';

interface CafeState extends CafeSnapshot {
  loading: boolean;
  error: string | null;
  selectedDay: string;
  orderSearch: string;
  menuSearch: string;
  statusFilter: OrderStatus | 'all';
}

const emptySnapshot: CafeSnapshot = {
  establishments: [],
  categories: [],
  menuItems: [],
  tables: [],
  orders: [],
  promoCodes: [],
};

const initialState: CafeState = {
  ...emptySnapshot,
  loading: false,
  error: null,
  selectedDay: new Date().toISOString().slice(0, 10),
  orderSearch: '',
  menuSearch: '',
  statusFilter: 'all',
};

export const CafeStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store, auth = inject(AuthService)) => ({
    establishmentId: computed(() => auth.establishmentId()),
    currentMenuItems: computed(() => {
      const query = store.menuSearch().trim().toLowerCase();
      const establishmentId = auth.establishmentId();

      return store
        .menuItems()
        .filter((item) => item.establishmentId === establishmentId && item.active)
        .filter((item) => item.name.toLowerCase().includes(query))
        .sort((a, b) => a.name.localeCompare(b.name));
    }),
    currentTables: computed(() =>
      store
        .tables()
        .filter((table) => table.establishmentId === auth.establishmentId())
        .sort((a, b) => a.number - b.number),
    ),
    currentOrders: computed(() => {
      const query = store.orderSearch().trim().toLowerCase();
      const status = store.statusFilter();
      const establishmentId = auth.establishmentId();

      return store
        .orders()
        .filter((order) => order.establishmentId === establishmentId)
        .filter((order) => order.createdAt.slice(0, 10) === store.selectedDay())
        .filter((order) => status === 'all' || order.status === status)
        .filter(
          (order) =>
            order.id.includes(query) ||
            order.items.some((item) => item.name.toLowerCase().includes(query)),
        )
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }),
    activeOrders: computed(() =>
      store
        .orders()
        .filter(
          (order) => order.establishmentId === auth.establishmentId() && order.status !== 'served',
        )
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    ),
    dayOrders: computed(() =>
      store
        .orders()
        .filter(
          (order) =>
            order.establishmentId === auth.establishmentId() &&
            order.createdAt.slice(0, 10) === store.selectedDay(),
        )
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    ),
    metrics: computed(() =>
      metricsForDay(
        store.orders().filter((order) => order.establishmentId === auth.establishmentId()),
        store.selectedDay(),
      ),
    ),
    popularItems: computed(() =>
      popularItems(
        store.orders().filter((order) => order.establishmentId === auth.establishmentId()),
        store.selectedDay(),
      ).slice(0, 5),
    ),
  })),
  withMethods((store, api = inject(CafeApiService), auth = inject(AuthService)) => ({
    async load(): Promise<void> {
      patchState(store, { loading: true, error: null });
      await applySnapshot(store, () => api.snapshot());
    },
    setOrderSearch(orderSearch: string): void {
      patchState(store, { orderSearch });
    },
    setMenuSearch(menuSearch: string): void {
      patchState(store, { menuSearch });
    },
    setStatusFilter(statusFilter: OrderStatus | 'all'): void {
      patchState(store, { statusFilter });
    },
    setSelectedDay(selectedDay: string): void {
      patchState(store, { selectedDay });
    },
    async createOrder(payload: {
      tableId: string | null;
      guestCount: number;
      items: OrderItem[];
      discountPercent: number;
      promoCode: string | null;
    }): Promise<void> {
      const establishmentId = auth.establishmentId();

      if (!establishmentId) {
        patchState(store, { error: 'Не выбрано заведение' });
        return;
      }

      await applySnapshot(store, () =>
        api.createOrder({
          ...payload,
          establishmentId,
        }),
      );
    },
    async updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
      await applySnapshot(store, () => api.updateOrderStatus(orderId, status));
    },
    async updateOrderItems(orderId: string, items: Order['items']): Promise<void> {
      await applySnapshot(store, () => api.updateOrderItems(orderId, items));
    },
    async upsertMenuItem(item: MenuItem): Promise<void> {
      await applySnapshot(store, () => api.upsertMenuItem(item));
    },
    async deleteMenuItem(itemId: string): Promise<void> {
      await applySnapshot(store, () => api.deleteMenuItem(itemId));
    },
    async updateTable(table: CafeTable): Promise<void> {
      await applySnapshot(store, () => api.updateTable(table));
    },
    totalFor(order: Order): number {
      return orderTotal(order);
    },
  })),
);

async function applySnapshot(
  store: Parameters<typeof patchState<CafeState>>[0],
  request: () => Promise<CafeSnapshot>,
): Promise<void> {
  patchState(store, { loading: true, error: null });

  try {
    patchState(store, { ...(await request()), loading: false, error: null });
  } catch (error) {
    patchState(store, {
      loading: false,
      error: error instanceof Error ? error.message : 'Не удалось обновить данные',
    });
  }
}
