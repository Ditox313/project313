
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from "@angular/core";
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Booking, Client } from 'src/app/shared/types/interfaces';



@Injectable({
  providedIn: 'root', 
})
export class BookingsService {


  



  constructor(private http: HttpClient) {}

  create(booking: Booking): Observable<Booking> {
    return this.http.post<Booking>(`/api/bookings`, booking);
  }

  
  fetch(params: any = {}): Observable<Booking[]> {
    return this.http.get<Booking[]>('/api/bookings', {
      params: new HttpParams({
        fromObject: params,
      }),
    });
  }

 
  getById(id: string): Observable<Booking> {
    return this.http.get<Booking>(`/api/bookings/${id}`);
  }

  update(id: string, xsbooking: Booking): Observable<Booking> {
    xsbooking._id = id;
    return this.http.patch<Booking>(`/api/bookings/${id}`, xsbooking);
  }

  updateAct(id: string, xsbooking: any): Observable<Booking> {
    xsbooking._id = id;
    return this.http.patch<Booking>(`/api/bookings/updateActClicked/${id}`, xsbooking);
  }

  extend(id: string, xsbooking: Booking): Observable<Booking> {
    xsbooking._id = id;
    return this.http.patch<Booking>(`/api/bookings/extend/${id}`, xsbooking);
  }

  close(id: string, xsbooking: Booking): Observable<Booking> {
    xsbooking._id = id;
    return this.http.patch<Booking>(`/api/bookings/close/${id}`, xsbooking);
  }

  delete(id: any): Observable<any> {
    return this.http.delete<any>(`/api/bookings/${id}`);
  }

  toggleStatus(status: string, bookingId: string): Observable<Booking> {
    const body = {
      status: status,
      bookingId: bookingId
    };
    return this.http.post<Booking>(`/api/bookings/toggleStatus`, body);
  }


  searchWidget(searchData: any): Observable<Client[]> {
    return this.http.post<Client[]>('/api/bookings/search_client', { searchData: searchData }).pipe(
      map(res => {
        return res;
      })
    )
  }


  update_after_booking_pay(id: string, data: any): Observable<any> {
    return this.http.patch<any>(`/api/bookings/update-after-booking-pay/${id}`, data);
  }

  update_after_booking_act(id: string, data: any): Observable<any> {
    return this.http.patch<any>(`/api/bookings/update-after-booking-act/${id}`, data);
  }

  update_after_booking_status(id: string, data: any): Observable<any> {
    return this.http.patch<any>(`/api/bookings/update-after-booking-status/${id}`, data);
  }

  update_after_booking_close(id: string, data: any): Observable<any> {
    return this.http.patch<any>(`/api/bookings/update-after-booking-close/${id}`, data);
  }

  getByIdSmena(id: string): Observable<Booking> {
    return this.http.get<Booking>(`/api/bookings/actual-bookings/${id}`);
  }

  getByIdCar(id: string): Observable<Booking[]> {
    return this.http.get<Booking[]>(`/api/bookings/bookings-by-id-car/${id}`);
  }
}