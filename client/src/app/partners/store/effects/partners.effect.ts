import {Injectable} from '@angular/core'
import {createEffect, Actions, ofType} from '@ngrx/effects'
import {map, catchError, switchMap, tap} from 'rxjs/operators'
import {HttpErrorResponse} from '@angular/common/http'



@Injectable()
export class PartnersEffect {
  constructor() {}

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
