import {createAction, props} from '@ngrx/store'
import {ActionTypes} from 'src/app/partners/store/actionTypes'


export const partnersAddAction = createAction(ActionTypes.PARTNERADD, props<any>());



export const partnersDeleteAction = createAction(
  ActionTypes.PARTNERDELETE,
  props<{ partners: any }>()
);

