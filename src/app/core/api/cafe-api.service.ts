import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { CafeSnapshot, CafeTable, MenuItem, Order, OrderStatus } from '../models/cafe.models';

@Injectable({ providedIn: 'root' })
export class CafeApiService {
  private readonly http = inject(HttpClient);

  snapshot(): Promise<CafeSnapshot> {
    return firstValueFrom(this.http.get<CafeSnapshot>('/api/snapshot'));
  }

  createOrder(order: Omit<Order, 'id' | 'createdAt' | 'status'>): Promise<CafeSnapshot> {
    return firstValueFrom(this.http.post<CafeSnapshot>('/api/orders', order));
  }

  updateOrderStatus(orderId: string, status: OrderStatus): Promise<CafeSnapshot> {
    return firstValueFrom(
      this.http.patch<CafeSnapshot>(`/api/orders/${orderId}/status`, { status }),
    );
  }

  updateOrderItems(orderId: string, items: Order['items']): Promise<CafeSnapshot> {
    return firstValueFrom(this.http.patch<CafeSnapshot>(`/api/orders/${orderId}/items`, { items }));
  }

  upsertMenuItem(item: MenuItem): Promise<CafeSnapshot> {
    return firstValueFrom(this.http.put<CafeSnapshot>('/api/menu-items', item));
  }

  deleteMenuItem(itemId: string): Promise<CafeSnapshot> {
    return firstValueFrom(this.http.delete<CafeSnapshot>(`/api/menu-items/${itemId}`));
  }

  updateTable(table: CafeTable): Promise<CafeSnapshot> {
    return firstValueFrom(this.http.put<CafeSnapshot>('/api/tables', table));
  }
}
