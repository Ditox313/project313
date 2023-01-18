import {Injectable} from '@angular/core'
import {createEffect, Actions, ofType} from '@ngrx/effects'
import {map, catchError, switchMap, tap} from 'rxjs/operators'
import {HttpErrorResponse} from '@angular/common/http'




import {
  loginAction,
  loginSuccessAction,
  loginFailureAction,
} from 'src/app/auth/store/actions/login.action';

import {AuthService} from '../../services/auth.service'
import {of} from 'rxjs'
import {Router} from '@angular/router'
import {User } from 'src/app/shared/types/interfaces'
import { MaterialService } from 'src/app/shared/services/material.service'



@Injectable()
export class LoginEffect {
  constructor(
    private actions$: Actions,
    private authService: AuthService,
    private router: Router
  ) {}

  login$ = createEffect(() =>
    this.actions$.pipe(
      //Получаем все actions
      ofType(loginAction), //Получаем нужный нам action
      switchMap(({ user }) => {
        //Редактируем поток и возвращаем новый
        return this.authService.login(user).pipe(
          map((data) => {
            return loginSuccessAction(data); //Вызываем action registerSuccessAction и передаем props
          }),
          catchError((errorResponse: HttpErrorResponse) => {
            MaterialService.toast(errorResponse.error.message);
            return of(
              loginFailureAction({ errors: errorResponse.error.errors })
            );
          })
        );
      })
    )
  );

  redirectAfterSubmit$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(loginSuccessAction),
        tap(() => {
          this.router.navigate(['/cars-page']);
        })
      ),
    { dispatch: false }
  );
}
