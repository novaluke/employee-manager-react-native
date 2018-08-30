import {
  applyMiddleware,
  combineReducers,
  createStore,
  Store,
} from "redux";
import reduxThunk from "redux-thunk";

import { AuthAction, authReducer, IAuthState } from "./Auth";

const rootReducer = combineReducers({
  auth: authReducer,
});

interface IRootState {
  auth: IAuthState;
}

export const store: Store<IRootState, RootAction> = createStore(
  rootReducer,
  {},
  applyMiddleware(reduxThunk),
);

export type RootAction = AuthAction;
