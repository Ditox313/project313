
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from "@angular/core";
import { Observable } from 'rxjs';
import { Settings, User } from 'src/app/shared/types/interfaces';


@Injectable({
  providedIn: 'root', //Автоматичеки регистриует сервис в главном модуле
})
export class AccountService {
  constructor(private http: HttpClient) {}

  // Обновляем настроки
  update_settings(data: Settings): Observable<Settings> {
    return this.http.patch<Settings>('/api/settings/save_settings/', data);
  }


  // Получаем настройки пользователя
  get_settings_user(userId: string): Observable<Settings> {
    return this.http.get<Settings>(`/api/settings/get_settings_user/${userId}/`);
  }
}