import {createAction, props} from '@ngrx/store'

import {ActionTypes} from 'src/app/auth/store/actionTypes'
import {User } from 'src/app/shared/types/interfaces'


// Отправляем созданного user
export const registerAction = createAction(
  ActionTypes.REGISTER,
  props<{user: User}>()
)


// Получаем ответ Типа user
export const registerSuccessAction = createAction(
  ActionTypes.REGISTER_SUCCESS,
  props<{ currentUser: User }>()
);



// Получаем ответ типа error
export const registerFailureAction = createAction(
  ActionTypes.REGISTER_FAILURE,
  props<{errors: any}>()
)
