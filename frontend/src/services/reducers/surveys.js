import { SAVE_SURVEYS, UPDATE_SURVEYS } from '../actions/surveys'
const initialState = {
  surveys: [],
};

export const surveysReducer = (state = initialState, action) => {
  switch (action.type) {
    case SAVE_SURVEYS: {
      return {
         ...state,
        surveys: action.payload
      };
    }
    case UPDATE_SURVEYS:{
        return {
            ...state,
            surveys: state.surveys.map((t) =>{
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
