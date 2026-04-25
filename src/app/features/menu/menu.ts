import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TuiButton } from '@taiga-ui/core';
import { TuiBadge } from '@taiga-ui/kit';

import { AuthService } from '../../core/auth/auth.service';
import { MenuItem } from '../../core/models/cafe.models';
import { CafeStore } from '../../core/state/cafe.store';

@Component({
  selector: 'app-menu',
  imports: [ReactiveFormsModule, TuiButton, TuiBadge],
  templateUrl: './menu.html',
  styleUrl: './menu.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Menu {
  protected readonly store = inject(CafeStore);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  protected readonly editingId = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    categoryId: ['main', Validators.required],
    price: [100, [Validators.required, Validators.min(1)]],
    active: [true],
  });

  protected edit(item: MenuItem): void {
    this.editingId.set(item.id);
    this.form.setValue({
      name: item.name,
      categoryId: item.categoryId,
      price: item.price,
      active: item.active,
    });
  }

  protected async save(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const establishmentId = this.auth.establishmentId();

    if (!establishmentId) {
      return;
    }

    await this.store.upsertMenuItem({
      id: this.editingId() ?? '',
      establishmentId,
      ...this.form.getRawValue(),
    });
    this.cancel();
  }

  protected cancel(): void {
    this.editingId.set(null);
    this.form.reset({ name: '', categoryId: 'main', price: 100, active: true });
  }

  protected categoryName(categoryId: string): string {
    return (
      this.store.categories().find((category) => category.id === categoryId)?.name ??
      'Без категории'
    );
  }

  protected money(value: number): string {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(value);
  }
}
