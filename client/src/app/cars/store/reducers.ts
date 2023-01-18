import {createReducer, on, Action} from '@ngrx/store'


import {
  carsAddAction,
  carsDeleteAction,
} from 'src/app/cars/store/actions/cars.action';
import { CarsStateInterface } from 'src/app/shared/types/interfaces';



// Инициализируем состояние
const initialState: CarsStateInterface = {
  cars: []
};



const carsReducer = createReducer(
  initialState,
  on(
    carsAddAction,
    (state, action): CarsStateInterface => ({
      ...state,
      cars: action.cars,
    })
  ),
  on(
    carsDeleteAction,
    (state, action): CarsStateInterface => ({
      ...state,
      cars: action.cars,
    })
  )
);







// Вызываем Reducer
export function reducers(state: CarsStateInterface, action: Action) {
  return carsReducer(state, action);
}
