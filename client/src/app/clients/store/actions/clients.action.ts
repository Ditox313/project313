import {createAction, props} from '@ngrx/store'
import {ActionTypes} from 'src/app/clients/store/actionTypes'


export const clientsAddAction = createAction(ActionTypes.CLIENTADD, props<any>());



export const clientsDeleteAction = createAction(
  ActionTypes.CLIENTDELETE,
  props<{ clients: any }>()
);

