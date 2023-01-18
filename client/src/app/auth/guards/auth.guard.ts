// Гуард защиты роутов

import { AuthService } from './../services/auth.service';
import { Observable, of } from 'rxjs';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, Router, RouterStateSnapshot } from "@angular/router";
import { Injectable } from '@angular/core';



@Injectable({
    providedIn: "root"  //Регистрируем данный сервис в главном файле модуль
})

export class AuthGuard implements CanActivate, CanActivateChild
{

    // Инжектируем необходимые сервисы
    constructor(private auth: AuthService, private router: Router){}


    // Если ответ true, то мы можем зайти на текущую страницу
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) : Observable <boolean> {
        // Проверяем есть ли у пользователя токен(то есть зареган ли он)
        if(this.auth.isAuthenticated())
        {
            return of(true); //Обернули ответ true в ответ в виде стрима
        }
        else
        {
            // Редирект пользователя на страницу логина если он не имеет токена. С определенным параметром для отображения соообщения
            this.router.navigate(['/login'], {
                queryParams: {
                    accessDenied: true
                }
            });

            return of(false);
        }
    }


    // Повторяем предыдущий метод(для детей)
    canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) : Observable <boolean> {
        return this.canActivate(route, state);
    }
}