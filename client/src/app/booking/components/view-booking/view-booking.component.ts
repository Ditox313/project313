import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MaterialService } from 'src/app/shared/services/material.service';
import { Booking, Summa } from 'src/app/shared/types/interfaces';
import { BookingsService } from '../../services/bookings.service';
import * as moment from 'moment';
import { PaysService } from 'src/app/pays/services/pays.service';
import { DocumentsService } from 'src/app/documents/services/documents.service';
import { Subscription } from 'rxjs';

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

  constructor(
    private bookings: BookingsService,
    private router: Router,
    private rote: ActivatedRoute,
    private pay: PaysService,
    private ducumentsServise: DocumentsService
  ) {}

  ngOnInit(): void {
    this.getParams();
    this.getBookingById();
    this.getPaysByBookingId();
    MaterialService.updateTextInputs();
  }

  ngOnDestroy(): void {
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

      // this.bookings.getById(this.bookingId).subscribe((res) => {
      //   this.bookingStatus = res.status;
      // });

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

      if (dicision)
      {
        this.subToggleStatus$ = this.bookings.toggleStatus(status, this.bookingId).subscribe((res) => {
          this.bookingStatus = res.status;
          MaterialService.toast(`Новый статус брони -  ${status}`);
        });
      }
    }
    else{
      this.subToggleStatus$ = this.bookings.toggleStatus(status, this.bookingId).subscribe((res) => {
        this.bookingStatus = res.status;
        MaterialService.toast(`Новый статус брони -  ${status}`);
      });
    }
  }



  checkedTarif(countDay: any)
  {
    if (this.summa.booking_days < 3)
    {
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

  clickAct(e)
  {
    this.clickedAct = true
    const booking : any = {
      dop_info_open: {
        clickedAct: true,
        clear_auto: this.actualBooking.dop_info_open.clear_auto,
        full_tank: this.actualBooking.dop_info_open.full_tank
      },
    };

    this.subUpdateAct$ = this.bookings.updateAct(this.bookingId, booking).subscribe((booking) => {
      this.router.navigate(['/booking-act', this.bookingId]);
    });
  }

}
