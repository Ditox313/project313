import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Booking, Car, Settings, Smena, User } from 'src/app/shared/types/interfaces';
import { SmenaService } from '../../services/smena.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MaterialService } from 'src/app/shared/services/material.service';
import { CarsService } from 'src/app/cars/services/cars.service';
import { DatePipe } from '@angular/common';
import { AccountService } from '../../../account/services/account.service';
import { AuthService } from 'src/app/auth/services/auth.service';
import { DocumentsService } from 'src/app/documents/services/documents.service';
import { BookingsService } from 'src/app/booking/services/bookings.service';

@Component({
  selector: 'app-view-smena',
  templateUrl: './view-smena.component.html',
  styleUrls: ['./view-smena.component.css']
})
export class ViewSmenaComponent implements OnInit, OnDestroy {

  // Получаем текущего юзера
  currentUser$: Subscription = null;
  currentUser!: User

  // Получаем настройки текущего пользователя
  currentUserSetings$: Subscription = null;
  currentUserSetings!: Settings


  // Закрываем смену
  closeSmena$: Subscription

  // Id смены
  smenaId!: any


  // Время закрытия
  close_date: string = null
  close_date_time: string = null


  // Получаем брони по id смены
  actualBookings$:Subscription
  xsbookings!: any


  //Получаем текущую смену
  actualSmena$: Subscription
  actualSmena!: Smena


  // Храним автомобили
  xscars$: Subscription
  xscars: Car[] = [];


  todayDate: any = new Date().toDateString();
  todayDateFormat = this.datePipe.transform(this.todayDate, 'yyyy-MM-dd');

  constructor(
    private smenaService: SmenaService,
    private bookings: BookingsService,
    private router: Router,
    private rote: ActivatedRoute,
    private ducumentsServise: DocumentsService,
    private auth: AuthService,
    private AccountService: AccountService,
    private datePipe: DatePipe,
    private cars: CarsService
  ) { }

  ngOnInit(): void {
    this.get_user()
    this.getParams()
    this.getBookingById()
  }


  ngOnDestroy(): void {
    if (this.actualSmena$) {
      this.actualSmena$.unsubscribe();
    }
    if (this.closeSmena$) {
      this.closeSmena$.unsubscribe();
    }
    if (this.xscars$) {
      this.xscars$.unsubscribe();
    }
  }

  filteredBookings(bookings: any[]): any[] {
    const xsbookings =  bookings.filter(booking => booking.status !== 'Закрыта');
    return xsbookings
  }

  get_user() {
    this.currentUser$ = this.auth.get_user().subscribe(res => {
      this.currentUser = res;

      this.currentUserSetings$ = this.AccountService.get_settings_user(this.currentUser._id).subscribe(res => {
        this.currentUserSetings = res;
      })
    })
  }

  getParams() {
    this.rote.params.subscribe((params: any) => {
      this.smenaId = params['id'];
    });
  }


  getBookingById() {
    this.actualSmena$ = this.smenaService.getById(this.smenaId).subscribe(res => {
      this.actualSmena = res

      this.actualBookings$ = this.bookings.getByIdSmena(this.smenaId).subscribe(res =>{
        this.xsbookings = res
      })
    })

    this.xscars$ = this.cars.fetchNoParams().subscribe(res =>{
      this.xscars = res
      console.log(res)
    })
  }

  you_need_to_give_out_a_car(data) {
    let xs_a = new Date().toISOString();
    let xs_b = new Date(data.booking_start).toISOString();

    return xs_a > xs_b;
  }



  closeSmena(event)
  {
    const data = {
      close_date: this.datePipe.transform(new Date(), 'dd.MM.yyyy'),
      close_date_time: this.datePipe.transform(new Date(), 'HH:mm:ss')
    }


    this.closeSmena$ = this.smenaService.close(this.smenaId, data).subscribe(res =>{
      this.actualSmena = res
    })
  }
}
