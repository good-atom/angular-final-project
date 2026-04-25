import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { Establishment, UserSession } from '../models/cafe.models';

const SESSION_KEY = 'cafe-orders-session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly sessionSignal = signal<UserSession | null>(this.readSession());

  readonly session = this.sessionSignal.asReadonly();
  readonly isAuthenticated = computed(() => Boolean(this.sessionSignal()));
  readonly establishmentId = computed(() => this.sessionSignal()?.user.establishmentId ?? null);

  async login(email: string, password: string, establishmentId: string): Promise<void> {
    const session = await firstValueFrom(
      this.http.post<UserSession>('/api/auth/login', { email, password, establishmentId }),
    );

    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    this.sessionSignal.set(session);
  }

  logout(): void {
    localStorage.removeItem(SESSION_KEY);
    this.sessionSignal.set(null);
    void this.router.navigateByUrl('/login');
  }

  token(): string | null {
    return this.sessionSignal()?.token ?? null;
  }

  async establishments(): Promise<Establishment[]> {
    return firstValueFrom(this.http.get<Establishment[]>('/api/establishments'));
  }

  private readSession(): UserSession | null {
    const value = localStorage.getItem(SESSION_KEY);

    if (!value) {
      return null;
    }

    try {
      return JSON.parse(value) as UserSession;
    } catch {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
  }
}
