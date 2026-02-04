import { SAVE_TESTS, UPDATE_TESTS } from '../actions/tests'
const initialState = {
  tests: [],
};

export const testsReducer = (state = initialState, action) => {
  switch (action.type) {
    case SAVE_TESTS: {
      return {
         ...state,
        tests: action.payload
      };
    }
    case UPDATE_TESTS:{
        return {
            ...state,
            tests: state.tests.map((t) =>{
                if (t._id==action.payload._id) return action.payload
                else return t
            })
        }
    }
    default: {
      return state;
    }
  }
};
