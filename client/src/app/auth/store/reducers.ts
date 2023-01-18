import {createReducer, on, Action} from '@ngrx/store'


import {
  registerAction,
  registerSuccessAction,
  registerFailureAction,
} from 'src/app/auth/store/actions/register.action';

import {
  loginAction,
  loginSuccessAction,
  loginFailureAction,
} from 'src/app/auth/store/actions/login.action';
import { AuthStateInterface } from 'src/app/shared/types/interfaces'


// Инициализируем состояние
const initialState: AuthStateInterface = {
  currentUser: null,
  isLoggedIn: false,
  token: '',
};



const authReducer = createReducer(
  initialState,
  on(
    registerAction,
    (state): AuthStateInterface => ({
      ...state,
    })
  ),

  on(
    registerSuccessAction,
    (state, action): AuthStateInterface => ({
      ...state,
      currentUser: action.currentUser,
    })
  ),
  on(
    registerFailureAction,
    (state, action): AuthStateInterface => ({
      ...state,
    })
  ),
  on(
    loginAction,
    (state): AuthStateInterface => ({
      ...state,
    })
  ),

  on(
    loginSuccessAction,
    (state, action): AuthStateInterface => ({
      ...state,
      isLoggedIn: true,
      token: action.token,
      currentUser: action.currentUser,
    })
  ),
  on(
    loginFailureAction,
    (state, action): AuthStateInterface => ({
      ...state,
    })
  )
);







// Вызываем Reducer
export function reducers(state: AuthStateInterface, action: Action) {
  return authReducer(state, action)
}
