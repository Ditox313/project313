import {createAction, props} from '@ngrx/store'
import {ActionTypes} from 'src/app/cars/store/actionTypes'
import { CarsStateInterface } from 'src/app/shared/types/interfaces';


export const carsAddAction = createAction(ActionTypes.CARSADD,props<any>());
export const carsDeleteAction = createAction(ActionTypes.CARSDELETE, props<{cars: any}>());

