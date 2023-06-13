import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Settings, Smena, User } from 'src/app/shared/types/interfaces';
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


  //Получаем текущую смену
  actualSmena$: Subscription
  actualSmena!: Smena

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
    })
  }

  closeSmena(event)
  {
    

    const data = {
      close_date: this.datePipe.transform(new Date(), 'dd.MM.yyyy'),
      close_date_time: this.datePipe.transform(new Date(), 'HH:mm:ss')
    }
    this.closeSmena$ = this.smenaService.close(this.smenaId, data).subscribe(res =>{
      console.log(res)
      this.actualSmena = res
    })
  }
}
