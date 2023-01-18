
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from "@angular/core";
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root', //Автоматичеки регистриует сервис в главном модуле
})
export class AccountService {
  constructor(private http: HttpClient) {}

}