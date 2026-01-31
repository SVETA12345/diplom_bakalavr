import { combineReducers } from 'redux';
import { userReducer } from './user';
import { testsReducer } from './tests';

export const rootReducer = combineReducers({
  user: userReducer,
  tests: testsReducer
});