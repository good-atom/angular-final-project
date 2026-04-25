# Cafe Orders

Angular 21 приложение для управления заказами в небольшом кафе: меню, столы,
активные заказы, скидки, разделение счета и история продаж.

## Демо и доступ

- Login: `admin@cafe.local`
- Password: `demo1234`
- Заведение выбирается на экране входа.
- Public URL: будет добавлен после подключения Vercel project к репозиторию.

## Стек

- Angular 21, standalone components, lazy routes
- Taiga UI 5
- NgRx Signal Store
- Mock API через `HttpClient` interceptors и seed-данные
- localStorage для JWT-сессии, настроек и mock-состояния
- Jest unit tests, Playwright e2e tests
- ESLint, Prettier, Stylelint
- GitHub Actions + Vercel config

## Структура

```text
src/app/core       auth, guards, interceptors, API, state, models
src/app/features   lazy-экраны login, shell, dashboard, menu, tables, history
src/app/shared     переиспользуемые UI-компоненты
docs               анализ, UX-концепция, прототип
server             db.json для mock-server script
e2e                Playwright сценарии
```

## Запуск

Рекомендуемая версия Node: `22.x LTS`. Node 25 запускает CLI с предупреждением и в
некоторых окружениях может нестабильно выполнять build.

```bash
npm ci
npm run start
```

Приложение откроется на `http://localhost:4200`.

## Проверки

```bash
npm run lint
npm run format:check
npm test
npm run build
npm run e2e
```

Mock-server artifact:

```bash
npm run mock:server
```

Основное приложение работает через in-memory mock API interceptor на `/api/*`, поэтому
отдельный сервер не нужен для локальной демонстрации.
