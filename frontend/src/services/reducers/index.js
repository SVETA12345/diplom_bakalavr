import { combineReducers } from 'redux';
import { userReducer } from './user';
import { testsReducer } from './tests';
import { surveysReducer } from './surveys';

export const rootReducer = combineReducers({
  user: userReducer,
  tests: testsReducer,
  surveys: surveysReducer
});