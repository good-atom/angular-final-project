import { HttpResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { delay, of, throwError } from 'rxjs';

import { MockDatabaseService } from '../api/mock-database.service';
import { CafeTable, MenuItem, Order, OrderStatus } from '../models/cafe.models';

const API_DELAY_MS = 180;

export const mockApiInterceptor: HttpInterceptorFn = (request, next) => {
  if (!request.url.startsWith('/api/')) {
    return next(request);
  }

  const database = inject(MockDatabaseService);

  try {
    const response = routeRequest(database, request.method, request.url, request.body);
    return of(new HttpResponse({ status: 200, body: response })).pipe(delay(API_DELAY_MS));
  } catch (error) {
    return throwError(() => ({
      status: 400,
      error: { message: error instanceof Error ? error.message : 'Ошибка mock API' },
    }));
  }
};

function routeRequest(
  database: MockDatabaseService,
  method: string,
  url: string,
  body: unknown,
): unknown {
  const snapshot = database.snapshot();

  if (method === 'GET' && url === '/api/establishments') {
    return snapshot.establishments;
  }

  if (method === 'POST' && url === '/api/auth/login') {
    const payload = body as { email: string; password: string; establishmentId: string };
    return database.login(payload.email, payload.password, payload.establishmentId);
  }

  if (method === 'GET' && url === '/api/snapshot') {
    return snapshot;
  }

  if (method === 'PATCH' && url.startsWith('/api/orders/') && url.endsWith('/status')) {
    const orderId = url.split('/')[3];
    return database.updateOrderStatus(orderId, (body as { status: OrderStatus }).status);
  }

  if (method === 'PATCH' && url.startsWith('/api/orders/') && url.endsWith('/items')) {
    const orderId = url.split('/')[3];
    return database.updateOrderItems(orderId, (body as { items: Order['items'] }).items);
  }

  if (method === 'POST' && url === '/api/orders') {
    return database.createOrder(body as Omit<Order, 'id' | 'createdAt' | 'status'>);
  }

  if (method === 'PUT' && url === '/api/menu-items') {
    return database.upsertMenuItem(body as MenuItem);
  }

  if (method === 'DELETE' && url.startsWith('/api/menu-items/')) {
    return database.deleteMenuItem(url.split('/').at(-1) ?? '');
  }

  if (method === 'PUT' && url === '/api/tables') {
    return database.updateTable(body as CafeTable);
  }

  throw new Error(`Mock API route is not implemented: ${method} ${url}`);
}
