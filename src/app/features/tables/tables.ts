import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TuiButton } from '@taiga-ui/core';
import { TuiBadge } from '@taiga-ui/kit';

import { CafeTable } from '../../core/models/cafe.models';
import { CafeStore } from '../../core/state/cafe.store';

@Component({
  selector: 'app-tables',
  imports: [TuiButton, TuiBadge],
  templateUrl: './tables.html',
  styleUrl: './tables.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Tables {
  protected readonly store = inject(CafeStore);

  protected toggle(table: CafeTable): Promise<void> {
    return this.store.updateTable({ ...table, occupied: !table.occupied });
  }
}
