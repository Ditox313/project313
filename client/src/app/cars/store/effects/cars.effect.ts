import {Injectable} from '@angular/core'
import {createEffect, Actions, ofType} from '@ngrx/effects'
import {map, catchError, switchMap, tap} from 'rxjs/operators'
import {HttpErrorResponse} from '@angular/common/http'

import {
  carsAddAction,
} from '../actions/cars.action';

import {of} from 'rxjs'
import {Router} from '@angular/router'
import { MaterialService } from 'src/app/shared/services/material.service'
import { CarsService } from '../../services/cars.service';
import { Car } from 'src/app/shared/types/interfaces';

@Injectable()
export class CarsEffect {
  constructor(
    private actions$: Actions,
    private carsService: CarsService,
    private router: Router
  ) {}

  // carsFetch$ = createEffect(() =>
  //   this.actions$.pipe(
  //     //Получаем все actions
  //     ofType(carsAddAction), //Получаем нужный нам action
  //     switchMap(({ params }) => {
  //       return this.carsService.fetch(params).pipe(
  //         map((cars: any) => {
  //           return carsFetchSuccessAction(cars);
  //         }),

  //         catchError((errorResponse: HttpErrorResponse) => {
  //           MaterialService.toast(errorResponse.error.message);
  //           return of(
  //             carsFetchFailureAction({ errors: errorResponse.error.errors })
  //           );
  //         })
  //       );
  //     })
  //   )
  // );

  // redirectAfterSubmit$ = createEffect(
  //   () =>
  //     this.actions$.pipe(
  //       ofType(registerSuccessAction),
  //       tap(() => {
  //         this.router.navigate(['/login'], {
  //           queryParams: {
  //             registered: true,
  //           },
  //         });
  //       })
  //     ),
  //   { dispatch: false }
  // );
}
