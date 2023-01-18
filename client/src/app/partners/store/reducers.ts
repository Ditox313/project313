import {createReducer, on, Action} from '@ngrx/store'


import {
  partnersAddAction,
  partnersDeleteAction,
} from 'src/app/partners/store/actions/partners.action';
import { PartnersStateInterface } from 'src/app/shared/types/interfaces';



// Инициализируем состояние
const initialState: PartnersStateInterface = {
  partners: [],
};



const partnersReducer = createReducer(
  initialState,
  on(
    partnersAddAction,
    (state, action): PartnersStateInterface => ({
      ...state,
      partners: action.partners,
    })
  ),
  on(
    partnersDeleteAction,
    (state, action): PartnersStateInterface => ({
      ...state,
      partners: action.partners,
    })
  )
);







// Вызываем Reducer
export function reducers(state: PartnersStateInterface, action: Action) {
  return partnersReducer(state, action);
}
