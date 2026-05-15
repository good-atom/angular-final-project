import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TuiButton, TuiLoader } from '@taiga-ui/core';
import { TuiBadge } from '@taiga-ui/kit';

import { orderTotal, splitOrderTotal } from '../../core/api/calculations';
import { MenuItem, Order, OrderItem, OrderStatus } from '../../core/models/cafe.models';
import { CafeStore } from '../../core/state/cafe.store';
import { MetricCard } from '../../shared/components/metric-card/metric-card';
import { OrderStatusControl } from '../../shared/components/order-status-control/order-status-control';

@Component({
  selector: 'app-dashboard',
  imports: [ReactiveFormsModule, TuiButton, TuiBadge, TuiLoader, MetricCard, OrderStatusControl],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard {
  protected readonly store = inject(CafeStore);
  private readonly fb = inject(FormBuilder);

  protected readonly draftItems = signal<OrderItem[]>([]);
  protected readonly form = this.fb.nonNullable.group({
    tableId: [''],
    guestCount: [1, [Validators.required, Validators.min(1), Validators.max(20)]],
    promoCode: [''],
  });

  protected addItem(menuItem: MenuItem): void {
    this.draftItems.update((items) => {
      const existing = items.find((item) => item.menuItemId === menuItem.id);

      if (existing) {
        return items.map((item) =>
          item.menuItemId === menuItem.id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }

      return [
        ...items,
        { menuItemId: menuItem.id, name: menuItem.name, price: menuItem.price, quantity: 1 },
      ];
    });
  }

  protected removeDraftItem(menuItemId: string): void {
    this.draftItems.update((items) => items.filter((item) => item.menuItemId !== menuItemId));
  }

  protected async createOrder(): Promise<void> {
    if (this.form.invalid || this.draftItems().length === 0) {
      this.form.markAllAsTouched();
      return;
    }

    const { tableId, guestCount, promoCode } = this.form.getRawValue();

    await this.store.createOrder({
      tableId: tableId || null,
      guestCount,
      items: this.draftItems(),
      discountPercent: this.discountPercent(),
      promoCode: promoCode.trim() ? promoCode.trim().toUpperCase() : null,
    });

    this.draftItems.set([]);
    this.form.reset({ tableId: '', guestCount: 1, promoCode: '' });
  }

  protected async removeOrderItem(order: Order, menuItemId: string): Promise<void> {
    await this.store.updateOrderItems(
      order.id,
      order.items.filter((item) => item.menuItemId !== menuItemId),
    );
  }

  protected updateStatus(orderId: string, status: OrderStatus): Promise<void> {
    return this.store.updateOrderStatus(orderId, status);
  }

  protected tableLabel(tableId: string | null): string {
    const table = this.store.tables().find((item) => item.id === tableId);
    return table ? `Стол ${table.number}` : 'С собой';
  }

  protected statusLabel(status: OrderStatus): string {
    return {
      accepted: 'Принят',
      preparing: 'Готовится',
      ready: 'Готов',
      served: 'Выдан',
    }[status];
  }

  protected categoryName(categoryId: string): string {
    return (
      this.store.categories().find((category) => category.id === categoryId)?.name ??
      'Без категории'
    );
  }

  protected itemSum(item: OrderItem): number {
    return item.price * item.quantity;
  }

  protected discountPercent(): number {
    const promo = this.form.controls.promoCode.value.trim().toUpperCase();
    return this.store.promoCodes().find((item) => item.code === promo)?.discountPercent ?? 0;
  }

  protected draftTotal(): number {
    return orderTotal({
      items: this.draftItems(),
      discountPercent: this.discountPercent(),
    });
  }

  protected orderTotal(order: Order): number {
    return orderTotal(order);
  }

  protected splitTotal(order: Order): number {
    return splitOrderTotal(order);
  }

  protected money(value: number): string {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(value);
  }
}
