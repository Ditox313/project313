
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from "@angular/core";
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Booking, Client, Smena } from 'src/app/shared/types/interfaces';



@Injectable({
  providedIn: 'root', 
})
export class SmenaService {


  
  constructor(private http: HttpClient) {}

  create(smena: Smena): Observable<Smena> {
    return this.http.post<Smena>(`/api/smena/create`, smena);
  }





  // close(id: string, xsbooking: Booking): Observable<Booking> {
  //   xsbooking._id = id;
  //   return this.http.patch<Booking>(`/api/bookings/close/${id}`, xsbooking);
  // }

}