export const CREATE_USER = 'CREATE_USER';
export const DELETE_USER = 'DELETE_USER';
export const LOGIN_USER = 'LOGIN_USER';
export const LOGOUT_USER = 'LOGOUT_USER';

// Создание пользователя
export const createUser = (userData) => ({
  type: CREATE_USER,
  ...userData
});

// Удаление пользователя
export const deleteUser = () => ({
  type: DELETE_USER
});

// Вход пользователя
export const loginUser = (userData) => ({
  type: LOGIN_USER,
  payload: userData
});

// Выход пользователя
export const logoutUser = () => ({
  type: LOGOUT_USER
});