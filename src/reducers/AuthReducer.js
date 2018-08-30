import {
  EMAIL_CHANGED,
  PASSWORD_CHANGED,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  LOGIN_START
} from "../actions/types";

const INITIAL_STATE = {
  email: "",
  password: "",
  loading: false,
  error: "",
  user: null
};

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case EMAIL_CHANGED:
      return { ...state, email: action.payload };
    case PASSWORD_CHANGED:
      return { ...state, password: action.payload };
    case LOGIN_START:
      return { ...state, loading: true, error: "" };
    case LOGIN_SUCCESS:
      return { ...state, ...INITIAL_STATE, user: action.payload };
    case LOGIN_FAIL:
      return { ...state, loading: false, error: "Something went wrong!" };
    default:
      return state;
  }
};
