import {Injectable} from '@angular/core'
import {createEffect, Actions, ofType} from '@ngrx/effects'
import {map, catchError, switchMap, tap} from 'rxjs/operators'
import {HttpErrorResponse} from '@angular/common/http'

import {
  registerAction,
  registerSuccessAction,
  registerFailureAction
} from '../actions/register.action'

import {AuthService} from '../../services/auth.service'
import {of} from 'rxjs'
import {Router} from '@angular/router'
import { User } from 'src/app/shared/types/interfaces'
import { MaterialService } from 'src/app/shared/services/material.service'

@Injectable()
export class RegisterEffect {
  constructor(
    private actions$: Actions,
    private authService: AuthService,
    private router: Router
  ) {}

  register$ = createEffect(() =>
    this.actions$.pipe(
      //Получаем все actions
      ofType(registerAction), //Получаем нужный нам action
      switchMap(({ user }) => {
        //Редактируем поток и возвращаем новый
        return this.authService.register(user).pipe(
          map((currentUser: User) => {
            return registerSuccessAction({ currentUser: currentUser }); //Вызываем action registerSuccessAction и передаем props
          }),

          catchError((errorResponse: HttpErrorResponse) => {
            MaterialService.toast(errorResponse.error.message);
            return of(
              registerFailureAction({ errors: errorResponse.error.errors })
            );
          })
        );
      })
    )
  );

  redirectAfterSubmit$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(registerSuccessAction),
        tap(() => {
          this.router.navigate(['/login'], {
            queryParams: {
              registered: true,
            },
          });
        })
      ),
    { dispatch: false }
  );
}
