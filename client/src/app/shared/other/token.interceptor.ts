// Это такой класс, который перехватывает http запрос и может его изменять. Нам нужен для того, что бы перехватывать 
// http запросы которые мы отправляем на наш бэкэнд и добавлять к ним токен, который мы обработали в auth.login сервисе.
// Регистрация  в главном модуле по ключу [providers]


import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { Injectable } from "@angular/core";
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/services/auth.service';

@Injectable() //Означает что мы будем инжектировать в класс нужные сервисы

export class TokenInterceptor implements HttpInterceptor{

    // Инжектируем необходимые сервисы
    constructor(private auth: AuthService, private router: Router){}



    // Перехватываем и изменяем http запрос 
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // Если пользователь зарегестрирован 
        if(this.auth.isAuthenticated())
        {
            // Берем запрос и изменяем его, добавляя в хедер Authorization необходимый токет
            req = req.clone({
                setHeaders: {
                    Authorization: this.auth.getToken()
                }
            })
        }

        // Мы как перехватили запрос, изменили(добавили к нему токен) его и отправляем его дальше
        return next.handle(req).pipe(
            catchError((error: HttpErrorResponse) => this.handleAuthError(error)));
    }


    // Обрабатываем ошибку - если истекло время токена
    private handleAuthError(error : HttpErrorResponse) : Observable <any>
    {
        // Проверяем код ошибки
        if(error.status === 401)
        {
            // Делаем редирект на логин и зановим параметр ошибки
            this.router.navigate(['/login'] , {
                queryParams: {
                    sessionFailed: true
                }
            });
        }

        return throwError(error);
    }

}