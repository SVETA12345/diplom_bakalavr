import { SAVE_TESTS } from '../actions/tests'
const initialState = {
  tests: []
};

export const testsReducer = (state = initialState, action) => {
  switch (action.type) {
    case SAVE_TESTS: {
      return {
         ...state,
        tests: action.payload
      };
    }
    
    default: {
      return state;
    }
  }
};
