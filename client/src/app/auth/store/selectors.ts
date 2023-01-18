import {createFeatureSelector, createSelector} from '@ngrx/store'
import { AppStateInterface, AuthStateInterface } from 'src/app/shared/types/interfaces'

export const authFeatureSelector = createFeatureSelector< AuthStateInterface>('auth')



// Выбираем нужное поле из нашей фичи
// export const isSubmittingSelector = createSelector(
//   authFeatureSelector,
//   (authState: AuthStateInterface) => authState.isSubmitting
// )



// export const validationErrorsSelector = createSelector(
//   authFeatureSelector,
//   (authState: AuthStateInterface) => authState.validationErrors
// )
