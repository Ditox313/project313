import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { Booking, Car, Pay, ReportSmena, Settings, Smena, User } from 'src/app/shared/types/interfaces';
import { SmenaService } from '../../services/smena.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MaterialService } from 'src/app/shared/services/material.service';
import { CarsService } from 'src/app/cars/services/cars.service';
import { DatePipe } from '@angular/common';
import { AccountService } from '../../../account/services/account.service';
import { AuthService } from 'src/app/auth/services/auth.service';
import { DocumentsService } from 'src/app/documents/services/documents.service';
import { BookingsService } from 'src/app/booking/services/bookings.service';
import { PaysService } from 'src/app/pays/services/pays.service';

@Component({
  selector: 'app-view-smena',
  templateUrl: './view-smena.component.html',
  styleUrls: ['./view-smena.component.css']
})
export class ViewSmenaComponent implements OnInit, OnDestroy {

  // Получаем контент
  @ViewChild('content') content!: ElementRef;

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

  // Храним платежи
  pays$: Subscription
  xspays: Pay[] = [];


  todayDate: any = new Date().toDateString();
  todayDateFormat = this.datePipe.transform(this.todayDate, 'yyyy-MM-dd');


  // Храним отчет
  report$: Subscription
  report: ReportSmena = null


  // Храним суммы расчетов
  xsSumma: any = {} 

  constructor(
    private smenaService: SmenaService,
    private bookings: BookingsService,
    private router: Router,
    private rote: ActivatedRoute,
    private ducumentsServise: DocumentsService,
    private auth: AuthService,
    private AccountService: AccountService,
    private datePipe: DatePipe,
    private cars: CarsService,
    private pays: PaysService,
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
    if (this.pays$) {
      this.pays$.unsubscribe();
    }
  }

  filteredBookings(bookings: any[]): any[] {
    const xsbookings =  bookings.filter(booking => booking.status !== 'Закрыта');
  
    return xsbookings
  }


  filteredBookings2(bookings: any[]): any[] {
    const xsbookings = bookings.filter(booking => booking.status !== 'Закрыта');
    const xsbookingsReturn = xsbookings.filter(booking => booking.smenaId === this.smenaId);

    return xsbookingsReturn
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

    this.pays$ = this.pays.getPaysBySmenaId(this.smenaId).subscribe(res => {
      this.xspays = res;
      this.xsSumma = this.calculationMoney(this.xspays)})

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
    })
  }

  you_need_to_give_out_a_car(data) {
    let xs_a = new Date().toISOString();
    let xs_b = new Date(data.booking_start).toISOString();

    return xs_a > xs_b;
  }




  calculationMoney(data: any[]) {
    const xspaysTerminal = data.filter(pay => pay.typePay === 'Терминал');
    let totalPriceTerminal = xspaysTerminal.reduce(function (sum, current) {
      return sum + current.pricePay;
    }, 0);

    const xspaysnal = data.filter(pay => pay.typePay === 'Наличные');
    let totalPriceNal = xspaysnal.reduce(function (sum, current) {
      return sum + current.pricePay;
    }, 0);

    const xspaysCard = data.filter(pay => pay.typePay === 'На карту');
    let totalPriceCard = xspaysCard.reduce(function (sum, current) {
      return sum + current.pricePay;
    }, 0);

    const xspaysRS = data.filter(pay => pay.typePay === 'Р/с');
    let totalPriceRS = xspaysRS.reduce(function (sum, current) {
      return sum + current.pricePay;
    }, 0);

    const xspaysZalog = data.filter(pay => pay.vidPay === 'Залог');
    let totalPriceZalog = xspaysZalog.reduce(function (sum, current) {
      return sum + current.pricePay;
    }, 0);


  
    const xsdata  = {
      terminal: totalPriceTerminal,
      nal: totalPriceNal,
      card: totalPriceCard,
      rs: totalPriceRS,
      zalogSumma: totalPriceZalog,
      full: totalPriceTerminal + totalPriceNal + totalPriceCard + totalPriceRS 
    }

    return xsdata
  }




  closeSmena(event)
  {
    const data = {
      close_date: this.datePipe.transform(new Date(), 'dd.MM.yyyy'),
      close_date_time: this.datePipe.transform(new Date(), 'HH:mm:ss')
    }

    

    



    this.closeSmena$ = this.smenaService.close(this.smenaId, data).subscribe(res =>{
      this.actualSmena = res


      const report = {
        smena: res,
        user: this.currentUser,
        content: this.content.nativeElement.innerHTML,
        bookings: this.xsbookings,
        cars: this.xscars,
        money: this.xsSumma
      }

      this.report$ = this.ducumentsServise.create_report_smena(report).subscribe(res => {
        this.report = res
      })
    })
  }
}
