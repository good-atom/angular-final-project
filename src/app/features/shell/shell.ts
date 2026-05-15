import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TuiButton } from '@taiga-ui/core';

import { AuthService } from '../../core/auth/auth.service';
import { CafeStore } from '../../core/state/cafe.store';
import { ThemeService } from '../../core/theme/theme.service';

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
  protected readonly theme = inject(ThemeService);

  protected readonly links = [
    { path: '/dashboard', label: 'Заказы', marker: '01' },
    { path: '/menu', label: 'Меню', marker: '02' },
    { path: '/tables', label: 'Столы', marker: '03' },
    { path: '/history', label: 'История', marker: '04' },
  ];

  ngOnInit(): void {
    void this.store.load();
  }
}
