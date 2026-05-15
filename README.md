# Cafe Orders

Angular 21 приложение для управления заказами в небольшом кафе. Проект реализует
создание меню, прием заказов, статусы кухни, модификацию состава заказа, скидки,
разделение счета между гостями, историю продаж, популярные позиции, посадку за столы
и разделение данных между заведениями.

## Стек

- Angular 21, TypeScript, standalone components, lazy routes
- Taiga UI 5, SCSS, адаптивная верстка
- NgRx Signal Store для состояния смены
- Mock API через `HttpClient` interceptors и seed-данные
- localStorage для JWT-сессии, настроек и mock-состояния
- Jest unit tests, Playwright e2e scenarios
- ESLint, Prettier, Stylelint
- GitHub Actions + Vercel

## Запуск

```bash
npm ci
npm run dev
```

Приложение: `http://localhost:4200`

Демо-аккаунт:

```text
admin@cafe.local
demo1234
```

На экране входа можно выбрать заведение. Данные разных заведений фильтруются по
`establishmentId`.

## Скрипты

```bash
npm start          # Angular dev server
npm run dev       # Angular dev server, alias for local work
npm run mock      # JSON mock server on http://localhost:3001
npm test          # Jest unit tests
npm run test:e2e  # Playwright scenarios
npm run lint      # ESLint + Stylelint
npm run build     # Production build
```

Основная демо-версия работает без отдельного backend: запросы `/api/*` обрабатывает
mock interceptor, а состояние сохраняется в localStorage. `npm run mock` оставлен как
отдельный artifact mock-сервера на базе `server/db.json`.

## Архитектура

```text
src/app/core       auth, guards, interceptors, API, state, models
src/app/features   lazy-экраны login, shell, dashboard, menu, tables, history
src/app/shared     переиспользуемые UI-компоненты
docs               анализ, UX-концепция, low-fidelity прототип
server             db.json для mock-server script
e2e                Playwright сценарии
```

Ключевые решения:

- защищенные маршруты через `authGuard`;
- token и error handling через HTTP interceptors;
- mock API изолирован в `MockDatabaseService` и `mockApiInterceptor`;
- расчеты выручки, среднего чека, промокодов и split bill вынесены в чистые функции;
- feature routes загружаются лениво, компоненты используют `OnPush`.

## Деплой

Vercel настроен для фронтенда в `vercel.json`: Angular собирается командой
`npm run build`, статический результат берется из `dist/cafe-orders/browser`, все
SPA-маршруты переписываются на `index.html`.

Для деплоя из GitHub Actions нужно добавить repository secrets:

```text
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
```

Публичный URL после подключения проекта в Vercel нужно указать здесь:

```text
https://<your-vercel-project>.vercel.app/
```

## Проверки

```bash
npm run lint
npm run format:check
npm test
npm run build
npm run test:e2e
```
