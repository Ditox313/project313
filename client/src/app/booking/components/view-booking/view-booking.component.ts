import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MaterialService } from 'src/app/shared/services/material.service';
import { Booking, Settings, Summa, User } from 'src/app/shared/types/interfaces';
import { BookingsService } from '../../services/bookings.service';
import * as moment from 'moment';
import { PaysService } from 'src/app/pays/services/pays.service';
import { DocumentsService } from 'src/app/documents/services/documents.service';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/services/auth.service';
import { AccountService } from '../../../account/services/account.service';
import { DatePipe } from '@angular/common';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-view-booking',
  templateUrl: './view-booking.component.html',
  styleUrls: ['./view-booking.component.css'],
})
export class ViewBookingComponent implements OnInit, OnDestroy {
  @ViewChild('tabs') tabs!: ElementRef;

  summa: Summa = {
    car: {},
    tariff: '',
    booking_start: '',
    booking_end: '',
    summa: '',
    booking_days: '',
    summaFull: '',
    dop_hours: '',
    checkedTarif: '',
    paidCount: 0
  };

  actualBooking!: Booking;

  bookingId!: string;

  form: any;

  booking_days_fin!: any;

  xsActualClient!: any;

  xstore$!: any;

  bookingStatus!: any;

  pays!: any;

  clear_auto!: any;

  full_tank!: any;

  clickedAct: boolean = false

  actualActs: any = [];

  subGetBookingById$: Subscription;
  
  subGetActsByIdBooking$: Subscription;

  subGetPaysByBookingId$: Subscription;

  subToggleStatus$: Subscription;

  subUpdateAct$: Subscription;

  responsibleUser!: User
  responsibleUser$: Subscription

  // Получаем настройки текущего пользователя
  currentUserSetings$: Subscription = null;
  currentUserSetings!: Settings

  // Получаем текущего юзера
  currentUser$: Subscription = null;
  currentUser!: User


  // Логируем статус в брони
  update_after_booking_status$: Subscription


  

  constructor(
    private bookings: BookingsService,
    private router: Router,
    private rote: ActivatedRoute,
    private pay: PaysService,
    private ducumentsServise: DocumentsService,
    private auth: AuthService,
    private AccountService: AccountService,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.getParams();
    this.getBookingById();
    this.getPaysByBookingId();
    MaterialService.updateTextInputs();
    this.get_user();
  }

  ngOnDestroy(): void {
    if (this.responsibleUser$) {
      this.responsibleUser$.unsubscribe();
    }
    if (this.subGetBookingById$)
    {
      this.subGetBookingById$.unsubscribe();
    }
    if (this.subGetActsByIdBooking$)
    {
      this.subGetActsByIdBooking$.unsubscribe();
    }
    if (this.subGetPaysByBookingId$)
    {
      this.subGetPaysByBookingId$.unsubscribe();
    }
    if (this.subToggleStatus$)
    {
      this.subToggleStatus$.unsubscribe();
    }
    if (this.subUpdateAct$)
    {
      this.subUpdateAct$.unsubscribe();
    }
    if (this.currentUserSetings$)
    {
      this.currentUserSetings$.unsubscribe();
    }
    if (this.currentUser$)
    {
      this.currentUser$.unsubscribe();
    }
    if (this.update_after_booking_status$) {
      this.update_after_booking_status$.unsubscribe();
    }
  }

  get_user()
  {
    this.currentUser$ = this.auth.get_user().subscribe(res => {
      this.currentUser = res;
      
       this.currentUserSetings$ = this.AccountService.get_settings_user(this.currentUser._id).subscribe(res => {
         this.currentUserSetings = res;
       })
    })
  }

  getParams()
  {
    this.rote.params.subscribe((params: any) => {
      this.bookingId = params['id'];
    });
  }

  getBookingById()
  {
    this.subGetBookingById$ = this.bookings.getById(this.bookingId).subscribe((res) => {
      this.actualBooking = res;
      

      this.responsibleUser$ = this.auth.get_user_by_id(this.actualBooking.user).subscribe(user => {
        this.responsibleUser = user;
      })

      

      this.summa.car = res.car;
      this.summa.sale = res.sale;
      this.summa.tariff = res.tariff;
      this.summa.booking_start = res.booking_start;
      this.summa.booking_end = res.booking_end;
      this.summa.summa = res.summa;
      this.summa.summaFull = res.summaFull;
      this.summa.booking_days = res.booking_days;
      this.summa.dop_hours = res.dop_hours;
      this.xsActualClient = res.client;


      this.bookingStatus = res.status;

      // Получаем список всех актов по данной брони
      this.subGetActsByIdBooking$ = this.ducumentsServise.getActsByIdBooking(this.bookingId).subscribe(acts => {
        this.actualActs = acts;
      })

      // Высчитываем какой тариф выбран
      this.checkedTarif(this.summa.booking_days)
    });
  }

  getPaysByBookingId()
  {
    this.subGetPaysByBookingId$ = this.pay.getPaysByBookingId(this.bookingId).subscribe((res) => {
      this.pays = res;
    });
  }


  toggleStatus(status: string) {
    if (+this.actualBooking.paidCount < (+this.summa.summaFull))
    {
      const dicision = window.confirm(`Бронь не оплачена! Вы уверены что хотите выдать автомобиль?`);

      const status_log = {
        status: 'В аренде',
        data: this.datePipe.transform(new Date(), 'dd.MM.yyyy HH:mm:ss')
      }


      if (dicision)
      {
        this.subToggleStatus$ = this.bookings.toggleStatus(status, this.bookingId).subscribe((res) => {
          this.bookingStatus = res.status;
          MaterialService.toast(`Новый статус брони -  ${status}`);
        });

        this.update_after_booking_status$ = this.bookings.update_after_booking_status(this.bookingId, status_log).subscribe(res=> {})
      }
    }
    else{
      const status_log = {
        status: 'В аренде',
        data: this.datePipe.transform(new Date(), 'dd.MM.yyyy HH:mm:ss')
      }

      this.subToggleStatus$ = this.bookings.toggleStatus(status, this.bookingId).subscribe((res) => {
        this.bookingStatus = res.status;
        MaterialService.toast(`Новый статус брони -  ${status}`);
      });

      this.update_after_booking_status$ = this.bookings.update_after_booking_status(this.bookingId, status_log).subscribe(res => { })
    }



    // this.subToggleStatus$ = this.bookings.toggleStatus(status, this.bookingId).pipe(
    //   switchMap(res => this.bookings.update_after_booking_status(this.bookingId, status_log)),
    // ).subscribe((res) => {
    //   this.bookingStatus = res.status;
    //   MaterialService.toast(`Новый статус брони -  ${status}`);
    // });


  }



  checkedTarif(countDay: any)
  {
    

    if (this.actualBooking.tariff === 'Город')
    {
      if (this.summa.booking_days < 3) {
        this.summa.checkedTarif = this.summa.car.days_1_2
      }
      if (this.summa.booking_days >= 3 && this.summa.booking_days < 7) {
        this.summa.checkedTarif = this.summa.car.days_3_7
      }
      if (this.summa.booking_days >= 7 && this.summa.booking_days < 14) {
        this.summa.checkedTarif = this.summa.car.days_8_14
      }
      if (this.summa.booking_days >= 14 && this.summa.booking_days < 31) {
        this.summa.checkedTarif = this.summa.car.days_15_30
      }
      if (this.summa.booking_days >= 31) {
        this.summa.checkedTarif = this.summa.car.days_31_more
      }
    }
    else if(this.actualBooking.tariff === 'Межгород')
      {
        if (this.summa.booking_days < 3) {
          this.summa.checkedTarif = this.summa.car.mezgorod
        }
        if (this.summa.booking_days >= 3 && this.summa.booking_days < 7) {
          this.summa.checkedTarif = this.summa.car.mezgorod
        }
        if (this.summa.booking_days >= 7 && this.summa.booking_days < 14) {
          this.summa.checkedTarif = this.summa.car.mezgorod
        }
        if (this.summa.booking_days >= 14 && this.summa.booking_days < 31) {
          this.summa.checkedTarif = this.summa.car.mezgorod
        }
        if (this.summa.booking_days >= 31) {
          this.summa.checkedTarif = this.summa.car.mezgorod
        }
    }
    else if (this.actualBooking.tariff === 'Россия') {
      if (this.summa.booking_days < 3) {
        this.summa.checkedTarif = this.summa.car.russia
      }
      if (this.summa.booking_days >= 3 && this.summa.booking_days < 7) {
        this.summa.checkedTarif = this.summa.car.russia
      }
      if (this.summa.booking_days >= 7 && this.summa.booking_days < 14) {
        this.summa.checkedTarif = this.summa.car.russia
      }
      if (this.summa.booking_days >= 14 && this.summa.booking_days < 31) {
        this.summa.checkedTarif = this.summa.car.russia
      }
      if (this.summa.booking_days >= 31) {
        this.summa.checkedTarif = this.summa.car.russia
      }
    }
  }

  clickAct(e)
  {
    this.clickedAct = true
    const booking : any = {
      dop_info_open: {
        clickedAct: true,
        full_tank: this.actualBooking.dop_info_open.full_tank,
        moyka: this.actualBooking.dop_info_open.moyka,
        place_start_price: this.actualBooking.dop_info_open.place_start_price,
        place_end_price: this.actualBooking.dop_info_open.place_end_price,
        additional_services_price: this.actualBooking.dop_info_open.additional_services_price,
        additional_services_chair: this.actualBooking.dop_info_open.additional_services_chair,
        additional_services_buster: this.actualBooking.dop_info_open.additional_services_buster,
        additional_services_videoregister: this.actualBooking.dop_info_open.additional_services_videoregister,
        additional_services_battery_charger: this.actualBooking.dop_info_open.additional_services_battery_charger,
        additional_services_moyka: this.actualBooking.dop_info_open.additional_services_moyka,
        additional_services_antiradar: this.actualBooking.dop_info_open.additional_services_antiradar,
        isCustomePlaceStart: this.actualBooking.dop_info_open.isCustomePlaceStart,
        isCustomeZalog: this.actualBooking.dop_info_open.isCustomeZalog
      },
    };

    this.subUpdateAct$ = this.bookings.updateAct(this.bookingId, booking).subscribe((booking) => {
      this.router.navigate(['/booking-act', this.bookingId]);
    });
  }

}
