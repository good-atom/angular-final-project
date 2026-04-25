import { Routes } from '@angular/router';

import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/login/login').then((module) => module.Login),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./features/shell/shell').then((module) => module.Shell),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard').then((module) => module.Dashboard),
      },
      {
        path: 'menu',
        loadComponent: () => import('./features/menu/menu').then((module) => module.Menu),
      },
      {
        path: 'tables',
        loadComponent: () => import('./features/tables/tables').then((module) => module.Tables),
      },
      {
        path: 'history',
        loadComponent: () => import('./features/history/history').then((module) => module.History),
      },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
    ],
  },
  { path: '**', redirectTo: '' },
];
