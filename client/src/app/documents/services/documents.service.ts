
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from "@angular/core";
import { Observable } from 'rxjs';
import { BookingAct, Dogovor } from 'src/app/shared/types/interfaces';


// Даем возможность инжектировать сервисы в класс
@Injectable({
  providedIn: 'root', //Автоматичеки регистриует сервис в главном модуле
})
export class DocumentsService {
  constructor(private http: HttpClient) {}

  // Создаем договор
  create_dogovor(dogovor: Dogovor): Observable<Dogovor> {
    return this.http.post<Dogovor>(`/api/documents/create_dogovor`, dogovor);
  }


  // Создаем акт для брони
  create_booking_act(act: BookingAct): Observable<BookingAct> {
    return this.http.post<BookingAct>(`/api/documents/create_booking_act`, act);
  }

  //  Получаем список договоров по id клиента
  getDogovorsById(id: string): Observable<Dogovor[]> {
    return this.http.get<Dogovor[]>(`/api/documents/dogovors_list/${id}`);
  }


  //  Получаем активный договор для клиента
  getDogovorActive(id: string): Observable<Dogovor> {
    return this.http.get<Dogovor>(`/api/documents/dogovor_active/${id}`);
  }

  //  Получаем договор по id 
  getDogovorById(id: string): Observable<Dogovor> {
    return this.http.get<Dogovor>(`/api/documents/dogovor/${id}`);
  }
  

  //  Получаем список актов для брони по id брони
  getActsByIdBooking(id: string): Observable<BookingAct> {
    return this.http.get<BookingAct>(`/api/documents/get_acts_by_id_booking/${id}`);
  }


  //  Получаем акт по id
  getActById(id: string): Observable<BookingAct> {
    return this.http.get<BookingAct>(`/api/documents/get_act_by_id/${id}`);
  }


  // Удалить договор
  delete_dogovor(id: any): Observable<any> {
    return this.http.delete<any>(`/api/documents/dogovor-delete/${id}`);
  }


  // Удалить акт
  delete_act(id: any): Observable<any> {
    return this.http.delete<any>(`/api/documents/act-delete/${id}`);
  }


  // Получаем список всех договоров
  fetch(params: any = {}): Observable<Dogovor[]> {
    return this.http.get<Dogovor[]>('/api/documents', {
      params: new HttpParams({
        fromObject: params,
      }),
    });
  }


  // Получаем список всех актов
  fetch_acts(params: any = {}): Observable<BookingAct[]> {
    return this.http.get<BookingAct[]>('/api/documents/fetch_acts', {
      params: new HttpParams({
        fromObject: params,
      }),
    });
  }




}