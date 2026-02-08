# Frontend

React-приложение для системы тестирования с использованием Material-UI.

## Описание проекта

Фронтенд часть веб-приложения для создания и прохождения тестов. Включает в себя:
- Аутентификацию пользователей
- Создание и редактирование тестов
- Прохождение тестов
- Публичный доступ к тестам по QR-коду

## Технологии

- **React 17** - JavaScript библиотека для построения пользовательских интерфейсов
- **Material-UI 4** - Библиотека компонентов React
- **React Router 6** - Маршрутизация в приложении
- **Redux** - Управление состоянием приложения
- **React Bootstrap** - Дополнительные UI компоненты
- **QRCode** - Генерация QR-кодов

## Установка и запуск

### Предварительные требования
- Node.js (версия 14 или выше)
- npm

### Установка зависимостей
```bash
npm install
```

### Запуск приложения
```bash
npm start
```

Приложение будет доступно по адресу `http://localhost:3000`

### Сборка для продакшена
```bash
npm run build
```

### Запуск тестов
```bash
npm test
```

## Структура проекта

```
src/
├── components/          # Переиспользуемые компоненты
│   ├── CreateQuestionForm/
│   ├── DialogQr/
│   ├── Header/
│   ├── LoginForm/
│   ├── Main/
│   ├── ModalStatus/
│   ├── OptionCard/
│   ├── OverviewFeatures/
│   ├── ProtectedRoute/
│   ├── QuestionsList/
│   ├── RegisterForm/
│   ├── SnackbarCustom/
│   └── TestsFilter/
├── pages/               # Страницы приложения
│   ├── App/
│   ├── Glavnay/
│   ├── Login/
│   ├── PublicTestPage/
│   ├── QuestionsStudent/
│   ├── Registr/
│   ├── TestEditor/
│   └── TestListPage/
├── services/            # Redux store
│   ├── actions/
│   └── reducers/
├── utils/               # API утилиты
│   ├── authApi.js
│   ├── questionsApi.js
│   └── testsApi.js
├── images/              # Изображения
├── App.css
├── index.css
├── index.js
└── setupTests.js
```

## Основные функции

- **Аутентификация**: Регистрация и вход пользователей
- **Управление тестами**: Создание, редактирование и удаление тестов
- **Вопросы**: Добавление различных типов вопросов к тестам
- **Прохождение тестов**: Интерфейс для прохождения созданных тестов
- **Публичные тесты**: Доступ к тестам по QR-коду без регистрации
- **Фильтрация**: Поиск и фильтрация тестов

## Скрипты

- `npm start` - Запуск development сервера
- `npm run build` - Сборка production версии
- `npm test` - Запуск тестов
- `npm run eject` - Извлечение конфигурации (необратимо)

## Лицензия

Проект является учебным/дипломным проектом.(https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
