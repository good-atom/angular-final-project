import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TuiButton } from '@taiga-ui/core';

import { AuthService } from '../../core/auth/auth.service';
import { CafeStore } from '../../core/state/cafe.store';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TuiButton],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Shell implements OnInit {
  protected readonly store = inject(CafeStore);
  protected readonly auth = inject(AuthService);

  protected readonly links = [
    { path: '/dashboard', label: 'Заказы' },
    { path: '/menu', label: 'Меню' },
    { path: '/tables', label: 'Столы' },
    { path: '/history', label: 'История' },
  ];

  ngOnInit(): void {
    void this.store.load();
  }
}
