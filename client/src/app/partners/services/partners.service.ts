
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Partner } from 'src/app/shared/types/interfaces';

@Injectable({
  providedIn: 'root',
})
export class PartnersService {
  constructor(private http: HttpClient) {}

  // Создаем нового партнера
  create(
    partner: Partner,
    passport__1?: File,
    passport__2?: File
  ): Observable<Partner> {
    const fd = new FormData();
    fd.append('name', partner.name);
    fd.append('surname', partner.surname);
    fd.append('lastname', partner.lastname);
    fd.append('passport_seria', partner.passport_seria);
    fd.append('passport_number', partner.passport_number);
    fd.append('passport_date', partner.passport_date);
    fd.append('passport_who_take', partner.passport_who_take);
    fd.append('code_podrazdeleniya', partner.code_podrazdeleniya);
    fd.append('passport_register', partner.passport_register);
    fd.append('phone_main', partner.phone_main);

    if (passport__1) {
      fd.append('passport_1_img', passport__1, passport__1.name);
    }

    if (passport__2) {
      fd.append('passport_2_img', passport__2, passport__2.name);
    }

    return this.http.post<Partner>(`/api/partners`, fd);
  }

  // Получаем список всех позиций
  fetch(params: any = {}): Observable<Partner[]> {
    return this.http.get<Partner[]>('/api/partners', {
      params: new HttpParams({
        fromObject: params,
      }),
    });
  }

  get_all(): Observable<Partner[]> {
    return this.http.get<Partner[]>('/api/partners/all');
  }

  // Обновление
  update(
    id: string,
    xspartner: Partner,
    passport__1?: File,
    passport__2?: File
  ): Observable<Partner> {
    const fd = new FormData();
    fd.append('name', xspartner.name);
    fd.append('surname', xspartner.surname);
    fd.append('lastname', xspartner.lastname);
    fd.append('passport_seria', xspartner.passport_seria);
    fd.append('passport_number', xspartner.passport_number);
    fd.append('passport_date', xspartner.passport_date);
    fd.append('passport_who_take', xspartner.passport_who_take);
    fd.append('code_podrazdeleniya', xspartner.code_podrazdeleniya);
    fd.append('passport_register', xspartner.passport_register);
    fd.append('phone_main', xspartner.phone_main);
    fd.append('partnerId', id);

    if (passport__1) {
      fd.append('passport_1_img', passport__1, passport__1.name);
    }

    if (passport__2) {
      fd.append('passport_2_img', passport__2, passport__2.name);
    }

    return this.http.patch<Partner>(`/api/partners/update/${id}`, fd);
  }

  // Получаем позицию по id
  getById(id: string): Observable<Partner> {
    return this.http.get<Partner>(`/api/partners/${id}`);
  }

  // Удаление
  delete(id: any): Observable<any> {
    return this.http.delete<any>(`/api/partners/${id}`);
  }
}
