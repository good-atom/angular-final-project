import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TuiBadge } from '@taiga-ui/kit';

import { Order, OrderStatus } from '../../core/models/cafe.models';
import { CafeStore } from '../../core/state/cafe.store';

@Component({
  selector: 'app-history',
  imports: [DatePipe, TuiBadge],
  templateUrl: './history.html',
  styleUrl: './history.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class History {
  protected readonly store = inject(CafeStore);
  protected readonly statuses: Array<{ value: OrderStatus | 'all'; label: string }> = [
    { value: 'all', label: 'Все' },
    { value: 'accepted', label: 'Принят' },
    { value: 'preparing', label: 'Готовится' },
    { value: 'ready', label: 'Готов' },
    { value: 'served', label: 'Выдан' },
  ];

  protected statusLabel(status: OrderStatus): string {
    return this.statuses.find((item) => item.value === status)?.label ?? status;
  }

  protected total(order: Order): string {
    return this.money(this.store.totalFor(order));
  }

  protected money(value: number): string {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(value);
  }
}
