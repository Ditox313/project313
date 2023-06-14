
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from "@angular/core";
import { Observable } from 'rxjs';
import { Pay } from 'src/app/shared/types/interfaces';


// Даем возможность инжектировать сервисы в класс
@Injectable({
  providedIn: 'root', //Автоматичеки регистриует сервис в главном модуле
})
export class PaysService {
  constructor(private http: HttpClient) {}

  create(pay: any): Observable<Pay> {
    return this.http.post<Pay>(`/api/pays`, pay);
  }

  vozvrat_zaloga(pay: any): Observable<Pay> {
    return this.http.post<Pay>(`/api/pays/vozvrat_zaloga`, pay);
  }


  getPaysByBookingId(id: string): Observable<Pay[]> {
    return this.http.get<Pay[]>(`/api/pays/${id}`);
  }

  getPaysBySmenaId(id: string): Observable<Pay[]> {
    return this.http.get<Pay[]>(`/api/pays/get-all-by-smenaId/${id}`);
  }


}