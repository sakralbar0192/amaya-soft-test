# Meadow Tales — Paywall

Мобильный paywall для условной детской игры: выбор тарифа, тестовая покупка через server route, сохранение в Postgres. Стек: **Nuxt 4 + TypeScript**, frontend и backend в одном проекте.

**Figma:** [макет paywall](https://www.figma.com/design/UCj2QUnELbXS7ybhYvqk3t/amaya-soft-test?node-id=0-1&t=gfBdzTvUxpmGRYEg-1)  
**Live:** [danilmakes.ru/paywall/](https://danilmakes.ru/paywall/)

## Локальный запуск

Нужны Node.js 20+, Docker (для Postgres).

```bash
# 1. Зависимости
npm install

# 2. Окружение
cp .env.example .env

# 3. Миграции и dev-сервер
npm run db:migrate
npm run dev
```

Откройте [http://localhost:3000/paywall/](http://localhost:3000/paywall/).

## Структура

| Часть | Где |
| --- | --- |
| UI paywall | `app/pages/index.vue` |
| Дизайн-токены | `app/assets/css/tokens.css` |
| Тарифы | `server/api/offers.get.ts` → `GET /api/offers` |
| Покупка | `server/api/purchase.post.ts` → `POST /api/purchase` |
| Проверка доступа | `server/api/purchase.get.ts` → `GET /api/purchase?userId=` |
| Отмена (для демо) | `server/api/purchase.delete.ts` → `DELETE /api/purchase` |
| Схема БД | `server/db/schema.ts` (таблица `purchases`: `offerId`, `userId`, `createdAt`) |
| Подключение к БД | `server/utils/db.ts` (Drizzle + `postgres`) |
| Миграции | `drizzle/`, команды `npm run db:generate` / `db:migrate` |


## Деплой и БД

- **БД:** PostgreSQL + Drizzle. Локально и на проде — обычный Postgres (Docker / инстанс на том же VPS), строка подключения через `DATABASE_URL`. Без managed-сервисов вроде Neon: проще для учебного мини-сервиса и совпадает с локальной схемой.
- **Хостинг:** VPS **danilmakes** на подпути `/paywall/` (поэтому в `nuxt.config.ts` задан `app.baseURL`). Node-хостинг с server routes, не статический HTML: [https://danilmakes.ru/paywall/](https://danilmakes.ru/paywall/).

## AI-инструменты и что проверил сам

- **Cursor** — план, код, API, схема БД.
- **Vibma / Figma** — макет paywall (390px) и токены, перенесённые в CSS.

Сам проверил: загрузку тарифов, выбор карточки, CTA → запись в `purchases`, success/error/loading, повторный заход с тем же `userId`, `npm run lint`. Pixel-perfect сверял визуально с макетом на мобильной ширине.

## Если бы было ещё 2 часа

1. Доделать «Восстановить покупки» (toast из макета / явный restore по `userId`).
2. Короткий smoke-тест и мониторинг API на проде.
3. Упростить откат демо-доступа или убрать его из UI.
