import {createFeatureSelector, createSelector} from '@ngrx/store'
import { CarsStateInterface } from 'src/app/shared/types/interfaces'

export const carsFeatureSelector = createFeatureSelector<CarsStateInterface>('cars');



// Выбираем нужное поле из нашей фичи
export const carsListSelector = createSelector(
  carsFeatureSelector,
  (carsState: CarsStateInterface) => carsState.cars
);



