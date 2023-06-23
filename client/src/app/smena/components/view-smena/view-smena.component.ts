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
      console.log(res)
      this.xsSumma = this.calculationMoney(this.xspays)
    })

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

    // Рассчитываем сколько всего у нас платежей по типам для данной смены
    const xspaysTerminal = data.filter(pay => pay.typePay === 'Терминал' && pay.vidPay !== 'Возврат залога' && pay.vidPay !== 'Частичный возврат залога'
    && pay.vidPay !== 'Мойка');
    let totalPriceTerminal = xspaysTerminal.reduce(function (sum, current) {
      return sum + current.pricePay;
    }, 0);

    const xspaysnal = data.filter(pay => pay.typePay === 'Наличные' && pay.vidPay !== 'Возврат залога' && pay.vidPay !== 'Частичный возврат залога'
      && pay.vidPay !== 'Мойка');
    let totalPriceNal = xspaysnal.reduce(function (sum, current) {
      return sum + current.pricePay;
    }, 0);

    const xspaysCard = data.filter(pay => pay.typePay === 'На карту' && pay.vidPay !== 'Возврат залога' && pay.vidPay !== 'Частичный возврат залога'
      && pay.vidPay !== 'Мойка');
    let totalPriceCard = xspaysCard.reduce(function (sum, current) {
      return sum + current.pricePay;
    }, 0);

    const xspaysRS = data.filter(pay => pay.typePay === 'Р/с' && pay.vidPay !== 'Возврат залога' && pay.vidPay !== 'Частичный возврат залога'
      && pay.vidPay !== 'Мойка');
    let totalPriceRS = xspaysRS.reduce(function (sum, current) {
      return sum + current.pricePay;
    }, 0);

    const summaAllPays = totalPriceTerminal + totalPriceNal + totalPriceCard + totalPriceRS

    



  
    // Считаем залог по всем типам платежей
    const xspaysZalogTerminal = data.filter(pay => pay.vidPay === 'Залог' && pay.typePay === 'Терминал');
    let totalPriceZalogTerminal = xspaysZalogTerminal.reduce(function (sum, current) {
      return sum + current.pricePay;
    }, 0);

    const xspaysZalogNal = data.filter(pay => pay.vidPay === 'Залог' && pay.typePay === 'Наличные');
    let totalPriceZalogNal = xspaysZalogNal.reduce(function (sum, current) {
      return sum + current.pricePay;
    }, 0);

    const xspaysZalogCard = data.filter(pay => pay.vidPay === 'Залог' && pay.typePay === 'На карту');
    let totalPriceZalogCard = xspaysZalogCard.reduce(function (sum, current) {
      return sum + current.pricePay;
    }, 0);

    const xspaysZalogRS = data.filter(pay => pay.vidPay === 'Залог' && pay.typePay === 'Р/с');
    let totalPriceZalogRS = xspaysZalogRS.reduce(function (sum, current) {
      return sum + current.pricePay;
    }, 0);

    const zalogSummaAllTypes = totalPriceZalogTerminal + totalPriceZalogNal + totalPriceZalogCard + totalPriceZalogRS


  








    // Считаем возврат залога по всем типам платежей
    const xsBackZalogTerminal = data.filter(pay => pay.vidPay === 'Возврат залога' && pay.typePay === 'Терминал');
    let totalxsBackZalogTerminal = xsBackZalogTerminal.reduce(function (sum, current) {
      return sum + current.pricePay;
    }, 0);

    const xsBackZalogNal = data.filter(pay => pay.vidPay === 'Возврат залога' && pay.typePay === 'Наличные');
    let totalxsBackZalogNal = xsBackZalogNal.reduce(function (sum, current) {
      return sum + current.pricePay;
    }, 0);

    const xsBackZalogCard = data.filter(pay => pay.vidPay === 'Возврат залога' && pay.typePay === 'На карту');
    let totalxsBackZalogCard = xsBackZalogCard.reduce(function (sum, current) {
      return sum + current.pricePay;
    }, 0);

    const xsBackZalogRS = data.filter(pay => pay.vidPay === 'Возврат залога' && pay.typePay === 'Р/с');
    let totalxsBackZalogRS = xsBackZalogRS.reduce(function (sum, current) {
      return sum + current.pricePay;
    }, 0);

    const zalogBackSummaAllTypes = totalxsBackZalogTerminal + totalxsBackZalogNal + totalxsBackZalogCard + totalxsBackZalogRS

    




    // Считаем частичный возврат залога по всем типам платежей
    const xsBackZalogPartTerminal = data.filter(pay => pay.vidPay === 'Частичный возврат залога' && pay.typePay === 'Терминал');
    let totalxsBackZalogPartTerminal = xsBackZalogPartTerminal.reduce(function (sum, current) {
      return sum + current.pricePay;
    }, 0);

    const xsBackZalogPartNal = data.filter(pay => pay.vidPay === 'Частичный возврат залога' && pay.typePay === 'Наличные');
    let totalxsBackZalogPartNal = xsBackZalogPartNal.reduce(function (sum, current) {
      return sum + current.pricePay;
    }, 0);

    const xsBackZalogPartCard = data.filter(pay => pay.vidPay === 'Частичный возврат залога' && pay.typePay === 'На карту');
    let totalxsBackZalogPartCard = xsBackZalogPartCard.reduce(function (sum, current) {
      return sum + current.pricePay;
    }, 0);

    const xsBackZalogPartRS = data.filter(pay => pay.vidPay === 'Частичный возврат залога' && pay.typePay === 'Р/с');
    let totalxsBackZalogPartRS = xsBackZalogPartRS.reduce(function (sum, current) {
      return sum + current.pricePay;
    }, 0);

    const zalogBackPartSummaAllTypes = totalxsBackZalogPartTerminal + totalxsBackZalogPartNal + totalxsBackZalogPartCard + totalxsBackZalogPartRS




    // Считаем оплату мойки если авто грязный при закрытии по всем типам платежей
    const xsWashTerminal = data.filter(pay => pay.vidPay === 'Мойка' && pay.typePay === 'Терминал');
    let totalxsWashTerminal = xsWashTerminal.reduce(function (sum, current) {
      return sum + current.pricePay;
    }, 0);

    const xsWashNal = data.filter(pay => pay.vidPay === 'Мойка' && pay.typePay === 'Наличные');
    let totalxsWashNal = xsWashNal.reduce(function (sum, current) {
      return sum + current.pricePay;
    }, 0);

    const xsWashCard = data.filter(pay => pay.vidPay === 'Мойка' && pay.typePay === 'На карту');
    let totalxsWasCard = xsWashCard.reduce(function (sum, current) {
      return sum + current.pricePay;
    }, 0);

    const xsWashRS = data.filter(pay => pay.vidPay === 'Мойка' && pay.typePay === 'Р/с');
    let totalxsWasRS = xsWashRS.reduce(function (sum, current) {
      return sum + current.pricePay;
    }, 0);

    const washSummaAllTypes = totalxsWashTerminal + totalxsWashNal + totalxsWasCard + totalxsWasRS




    // Если у нас нет возвратных платежей то бронь еще не закрывалась
    if (zalogBackSummaAllTypes == 0 && zalogBackPartSummaAllTypes == 0 && washSummaAllTypes == 0)
    {
      const xsdata = {
        terminal: totalPriceTerminal,
        nal: totalPriceNal,
        card: totalPriceCard,
        rs: totalPriceRS,
        zalogSumma: zalogSummaAllTypes,
        full: (totalPriceTerminal + totalPriceNal + totalPriceCard + totalPriceRS) - (+zalogSummaAllTypes) 
      }

      return xsdata
    }
    else 
    {
      const xsdata = {
        terminal: totalPriceTerminal - totalxsBackZalogTerminal - totalxsBackZalogPartTerminal + totalxsWashTerminal,
        nal: totalPriceNal - totalxsBackZalogNal - totalxsBackZalogPartNal + totalxsWashNal,
        card: totalPriceCard - totalxsBackZalogCard - totalxsBackZalogPartCard + totalxsWasCard,
        rs: totalPriceRS - totalxsBackZalogRS - totalxsBackZalogPartRS + totalxsWasRS,
        zalogSumma: zalogSummaAllTypes - zalogBackSummaAllTypes - zalogBackPartSummaAllTypes,
        full: (totalPriceTerminal + totalPriceNal + totalPriceCard + totalPriceRS) - zalogBackSummaAllTypes - zalogBackPartSummaAllTypes + washSummaAllTypes
      }

      console.log(totalxsBackZalogPartNal)

      return xsdata
    }

    
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
