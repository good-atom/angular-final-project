import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { OrderStatus } from '../../../core/models/cafe.models';

@Component({
  selector: 'app-order-status-control',
  imports: [],
  templateUrl: './order-status-control.html',
  styleUrl: './order-status-control.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderStatusControl {
  @Input({ required: true }) status: OrderStatus = 'accepted';
  @Output() statusChange = new EventEmitter<OrderStatus>();

  readonly statuses: Array<{ value: OrderStatus; label: string }> = [
    { value: 'accepted', label: 'Принят' },
    { value: 'preparing', label: 'Готовится' },
    { value: 'ready', label: 'Готов' },
    { value: 'served', label: 'Выдан' },
  ];

  protected update(value: string): void {
    this.statusChange.emit(value as OrderStatus);
  }
}
