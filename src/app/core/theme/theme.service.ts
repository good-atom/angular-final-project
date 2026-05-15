import { Injectable, signal } from '@angular/core';

export type AppTheme = 'light' | 'dark';

const THEME_KEY = 'cafe-orders-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly themeSignal = signal<AppTheme>(this.readTheme());

  readonly theme = this.themeSignal.asReadonly();

  constructor() {
    this.apply(this.themeSignal());
  }

  toggle(): void {
    this.setTheme(this.themeSignal() === 'dark' ? 'light' : 'dark');
  }

  setTheme(theme: AppTheme): void {
    this.themeSignal.set(theme);
    localStorage.setItem(THEME_KEY, theme);
    this.apply(theme);
  }

  private readTheme(): AppTheme {
    const saved = localStorage.getItem(THEME_KEY);

    if (saved === 'light' || saved === 'dark') {
      return saved;
    }

    return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  private apply(theme: AppTheme): void {
    document.documentElement.dataset['theme'] = theme;
    document.documentElement.style.colorScheme = theme;
  }
}
