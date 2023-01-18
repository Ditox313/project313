import {createReducer, on, Action} from '@ngrx/store'


import {
  clientsAddAction,
  clientsDeleteAction,
} from 'src/app/clients/store/actions/clients.action';
import { ClientsStateInterface } from 'src/app/shared/types/interfaces';



// Инициализируем состояние
const initialState: ClientsStateInterface = {
  clients: [],
};



const clientsReducer = createReducer(
  initialState,
  on(
    clientsAddAction,
    (state, action): ClientsStateInterface => ({
      ...state,
      clients: action.clients,
    })
  ),
  on(
    clientsDeleteAction,
    (state, action): ClientsStateInterface => ({
      ...state,
      clients: action.clients,
    })
  )
);







// Вызываем Reducer
export function reducers(state: ClientsStateInterface, action: Action) {
  return clientsReducer(state, action);
}
