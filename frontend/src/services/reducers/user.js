
import { 
  CREATE_USER, 
  DELETE_USER, 
  LOGIN_USER, 
  LOGOUT_USER 
} from '../actions/user';

const initialState = {
  name: '',
  surname: '',
  patronomic: '',
  department: '',
  email: '',
  password: '',
  isAuthenticated: false,
  role: ''
};

export const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case CREATE_USER: {
      return {
        ...state,
        name: action.name,
        surname: action.surname,
        patronomic: action.patronomic,
        department: action.department,
        email: action.email,
        password: action.password,
        role: action.rol
      };
    }
    
    case LOGIN_USER: {
      return {
        ...state,
        ...action.payload,
        isAuthenticated: true
      };
    }
    
    case LOGOUT_USER: {
      return initialState;
    }
    
    case DELETE_USER: {
      return initialState;
    }
    
    default: {
      return state;
    }
  }
};

