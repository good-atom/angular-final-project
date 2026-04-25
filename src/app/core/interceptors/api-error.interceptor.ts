import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const apiErrorInterceptor: HttpInterceptorFn = (request, next) =>
  next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      const message =
        typeof error.error?.message === 'string'
          ? error.error.message
          : 'Не удалось выполнить запрос. Попробуйте еще раз.';

      return throwError(() => new Error(message));
    }),
  );
