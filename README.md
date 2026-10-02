# Diplom — система тестирования (frontend + backend)

Веб-приложение для создания и прохождения тестов и опросов: регистрация и вход
(в том числе с двухфакторной аутентификацией), создание тестов и опросов,
прохождение тестов, публичный доступ к тестам по QR-коду, аналитика результатов
с помощью диаграмм.

Проект состоит из двух частей:

| Директория | Стек                                             | Порт (в Docker) | Назначение                                      |
| ---------- | ------------------------------------------------ | --------------- | ----------------------------------------------- |
| `backend`  | Node.js 20, Express, Mongoose, MongoDB           | 3005            | REST API, отправка писем с кодами подтверждения |
| `frontend` | React 17 (CRA), React Router, Redux, Material-UI | 3000            | SPA-интерфейс, раздаётся nginx'ом               |

---

## Быстрый старт (Docker)

### 1. Настройте переменные окружения

```bash
cp .env.example .env
```

Минимально нужно заменить `JWT_SECRET` в `.env`.

### Почта и код двухфакторной аутентификации

На `/api/signin` всегда отправляется код 2FA на email. Есть два режима
(переключается переменной `DEV_2FA_CODE` в `.env`):

- **`DEV_2FA_CODE=true`** (по умолчанию) — режим локальной разработки без
  почты: письма не отправляются, код печатается в логах backend
  (`docker compose logs backend`) и показывается в окне входа на фронтенде.
  Значения `EMAIL_USER`/`EMAIL_PASSWORD` не нужны.
- **`DEV_2FA_CODE=false`** — коды отправляются на почту. Тогда заполните
  `EMAIL_USER` и `EMAIL_PASSWORD`; для mail.ru это должен быть **пароль
  приложения** («Настройки → Безопасность → Пароль приложения»), а не
  обычный пароль от почты. Неверные данные приводят к `500` на `/api/signin`.

На сервере обязательно используйте `DEV_2FA_CODE=false`, иначе код
подтверждения будет виден в логах и в ответе API.

### 2. Запустите проект

```bash
docker compose up --build
```

После запуска:

- интерфейс — <http://localhost:3000>
- API — <http://localhost:3005/api>
- MongoDB доступна только внутри сети Docker (порт наружу не публикуется),
  данные сохраняются в томе `mongo-data`

Приложение автоматически дождётся готовности MongoDB (healthcheck), так что
отдельный запуск БД не нужен.

### 3. Остановите / пересоберите

```bash
docker compose down          # остановить
docker compose down -v       # остановить и удалить данные MongoDB
docker compose up --build -d # фоновый режим
docker compose logs -f backend
```

### Частые проблемы

- `Bind for 0.0.0.0:3000 failed: port is already allocated` — порт 3000 занят
  на машине. Поменяйте `FRONTEND_PORT` (и/или `BACKEND_PORT`) в `.env` и
  выполните `docker compose up -d` заново.
- После изменения `REACT_APP_API_URL` выполните `docker compose up --build` —
  переменная вшивается в JS на этапе сборки.
- `500 Internal Server Error` на `/api/signin` при `DEV_2FA_CODE=false` —
  mail.ru отклоняет авторизацию. Укажите пароль приложения mail.ru в
  `EMAIL_PASSWORD` либо включите `DEV_2FA_CODE=true`.

---

## Как это устроено

`frontend` — многостадийная сборка: на стадии `build` выполняется
`npm run build` (react-scripts), на стадии `production` готовые статические
файлы из `build/` копируются в nginx. Nginx:

- отдаёт SPA с fallback на `index.html` (нужно для маршрутов React Router);
- проксирует `/api`, `/send-twofactor-code`, `/send-reset-code`,
  `/verify-reset-code` на `backend:3005` — благодаря этому в браузере запросы
  идут на тот же домен и CORS/куки работают без дополнительной настройки;
- отдаёт статику с кэшированием на 7 дней.

`backend` — обычный Express-сервер на образе `node:20-slim`. Он подключается
к MongoDB по `BASE_URL` (в Docker — `mongodb://mongo:27017/diplom`), слушает
`PORT` (в Docker — 3005) на `0.0.0.0`.

### Переменные окружения

Корень `.env` (используется docker compose):

| Переменная                      | По умолчанию | Описание                                                                       |
| ------------------------------- | ------------ | ------------------------------------------------------------------------------ |
| `FRONTEND_PORT`                 | `3000`       | Порт, на котором доступен интерфейс                                            |
| `BACKEND_PORT`                  | `3005`       | Порт, на котором доступен API напрямую                                         |
| `REACT_APP_API_URL`             | `/api`       | Адрес API, вшивается в билд фронтенда на этапе сборки                          |
| `JWT_SECRET`                    | —            | Секрет подписи JWT (**обязательно заменить**)                                  |
| `EMAIL_USER` / `EMAIL_PASSWORD` | —            | Учётные данные почты mail.ru для писем с кодами                                |
| `DEV_2FA_CODE`                  | `true`       | `true` — вход без почты (код в логах и в окне входа), `false` — отправка писем |

`REACT_APP_API_URL` вшивается в JS **на этапе сборки**, поэтому после его
изменения нужно пересобрать фронтенд (`docker compose up --build`).
Значение `/api` означает «запросы на текущий домен» (рекомендуется для Docker).
Для обращения к API напрямую укажите `http://localhost:3005/api`.

### Запуск без Docker (для разработки)

Нужны Node.js 18+ и локальный MongoDB.

```bash
# backend
cd backend
cp .env.example .env      # BASE_URL=mongodb://127.0.0.1:27017/diplom
npm install
npm run dev               # nodemon, http://localhost:3005

# frontend (в отдельном терминале)
cd frontend
npm install --legacy-peer-deps   # Material-UI 4 конфликтует с @types/react 19
npm start                 # http://localhost:3000
```

Сборка продакшн-версии фронтенда локально:

```bash
cd frontend
REACT_APP_API_URL=/api npm run build   # результат в frontend/build
```

Значение `REACT_APP_API_URL` можно задать один раз, создав `frontend/.env.local`
(файл в `.gitignore`), например `REACT_APP_API_URL=http://localhost:3005/api`.

---

## Структура проекта

```
.
├── docker-compose.yml       # mongo + backend + frontend
├── .env.example             # пример переменных окружения для Docker
├── backend/                 # Express API
│   ├── app.js               # точка входа
│   ├── controllers/         # логика эндпоинтов
│   ├── routes/              # описание маршрутов
│   ├── middlewares/         # auth, логирование
│   ├── models/              # Mongoose-модели
│   ├── errors/              # классы ошибок и обработчик
│   ├── utils/emailService.js# отправка писем (nodemailer)
│   ├── validation.js        # валидация запросов (celebrate)
│   └── Dockerfile
└── frontend/                # React SPA
    ├── public/
    ├── src/
    │   ├── components/      # переиспользуемые компоненты
    │   ├── pages/           # страницы приложения
    │   ├── services/        # Redux actions/reducers
    │   ├── utils/           # API-клиенты и константы
    │   └── images/
    ├── nginx.conf           # конфигурация nginx (прокси + SPA fallback)
    └── Dockerfile
```

Подробное описание фронтенда (компоненты, скрипты) — в
[`frontend/README.md`](frontend/README.md).

---

## Основные API-маршруты

| Метод                 | Путь                   | Описание                                   |
| --------------------- | ---------------------- | ------------------------------------------ |
| `POST`                | `/api/signup`          | Регистрация                                |
| `POST`                | `/api/signin`          | Вход (в т.ч. с кодом 2FA)                  |
| `POST`                | `/api/signout`         | Выход                                      |
| `GET`/`PATCH`         | `/api/users/me`        | Данные текущего пользователя               |
| `POST`                | `/send-reset-code`     | Код для сброса пароля на почту             |
| `POST`                | `/verify-reset-code`   | Смена пароля по коду                       |
| `POST`                | `/send-twofactor-code` | Отправка кода двухфакторной аутентификации |
| `POST`/`GET`/`DELETE` | `/api/tests`           | Тесты                                      |
| `POST`/`GET`/`DELETE` | `/api/questions`       | Вопросы                                    |
| `POST`/`GET`/`DELETE` | `/api/attempts`        | Попытки прохождения                        |
| `POST`/`GET`/`DELETE` | `/api/surveys`         | Опросы                                     |
| `POST`/`GET`/`DELETE` | `/api/surveyQuestions` | Вопросы опросов                            |
| `POST`/`GET`/`DELETE` | `/api/attemptsSurvey`  | Попытки прохождения опросов                |

---

## Развёртывание

```bash
docker compose up --build -d
```

Для размещения на сервере скопируйте репозиторий, создайте `.env` из
`.env.example` (задайте `JWT_SECRET`, при необходимости `EMAIL_USER` /
`EMAIL_PASSWORD`), пробросьте порты и запустите compose. Если фронтенд
доступен по домену, задайте `REACT_APP_API_URL=/api` — тогда весь API
будет отдаваться с того же домена через nginx.

Учтите, что cookie авторизации выставляется с флагами `SameSite=None; Secure`,
поэтому для доступа извне (не с `localhost`) сайт должен работать по HTTPS —
иначе браузер не сохранит cookie сессии.
