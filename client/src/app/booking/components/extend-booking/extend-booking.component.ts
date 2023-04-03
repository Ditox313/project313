import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { CarsService } from 'src/app/cars/services/cars.service';
import { ClientsService } from 'src/app/clients/services/clients.service';
import { MaterialService } from 'src/app/shared/services/material.service';
import { Booking, Summa } from 'src/app/shared/types/interfaces';
import { BookingsService } from '../../services/bookings.service';

import * as moment from 'moment';
import { PaysService } from 'src/app/pays/services/pays.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-extend-booking',
  templateUrl: './extend-booking.component.html',
  styleUrls: ['./extend-booking.component.css']
})


export class ExtendBookingComponent implements OnInit, AfterViewInit, OnDestroy {

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
  };

  summa_extend: any = {
    car: {},
    tariff: '',
    booking_start: '',
    booking_end: '',
    summa: '',
    booking_days: '',
    summaFull: '',
    dop_hours: '',
  };

  xs_extend_price: any = 0;

  bookingId!: string;

  bookingViewRef!: string;

  form!: FormGroup;

  xscars$!: any;

  booking_days_fin!: any;

  xsclients$!: any;

  xsActualClient!: any;

  actualBooking!: Booking;

  extendDays: any;

  isSaleCheck: boolean = false; 

  xsExtendSummBeforeSale: number = 0;


  PayTypes: Array<any> = [
    {
      type: "terminal",
      value: "Терминал"
    },
    {
      type: "card",
      value: "На карту"
    },
    {
      type: "rs",
      value: "Р/с"
    },
  ]

  defaultValueArenda: string = 'Наличные';
  defaultValueZalog: string = 'Наличные';
  subBookingById$: Subscription;
  subBookingExtend$: Subscription;



  constructor(
    private bookings: BookingsService,
    private router: Router,
    private cars: CarsService,
    private clients: ClientsService,
    private rote: ActivatedRoute,
    private pays: PaysService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.getParams();
    this.getBookingById();
    this.xscars$ = this.cars.fetch();
    this.xsclients$ = this.clients.fetch();
    MaterialService.updateTextInputs();
  }

  ngOnDestroy(): void {
    if (this.subBookingById$)
    {
      this.subBookingById$.unsubscribe();
    }
    if (this.subBookingExtend$)
    {
      this.subBookingExtend$.unsubscribe();
    }
  }

  initForm()
  {
    this.form = new FormGroup({
      car: new FormControl('', [Validators.required]),
      client: new FormControl('', [Validators.required]),
      booking_start: new FormControl('', [Validators.required]),
      booking_end: new FormControl('', [Validators.required]),
      place_start: new FormControl('', [Validators.required]),
      place_end: new FormControl('', [Validators.required]),
      tariff: new FormControl('', [Validators.required]),
      comment: new FormControl(''),
      arenda: new FormControl('',),
      typePayArenda: new FormControl('',),
      isSaleCheckbox: new FormControl('',),
    });
  }

  getBookingById()
  {
    this.subBookingById$ = this.bookings.getById(this.bookingId).subscribe((res) => {
      this.actualBooking = res;
      this.form.patchValue({
        car: JSON.stringify(res.car, null, 2),
        client: JSON.stringify(res.client, null, 2),
        booking_start: res.booking_start,
        booking_end: res.booking_end,
        place_start: res.place_start,
        place_end: res.place_end,
        tariff: res.tariff,
        comment: res.comment,
      });

      this.summa.car = res.car;
      this.summa.tariff = res.tariff;
      this.summa.booking_start = res.booking_start;
      this.summa.booking_end = res.booking_end;
      this.summa.summa = res.summa;
      this.summa.summaFull = res.summaFull;
      this.summa.booking_days = res.booking_days;
      this.summa.dop_hours = res.dop_hours;


      this.xsActualClient = res.client;
      MaterialService.updateTextInputs();
    });
  }

  getParams()
  {
    this.rote.params.subscribe((params: any) => {
      this.bookingId = params['id'];

      if (params.view) {
        this.bookingViewRef = params.view;
      }
    });
  }

  
  ngAfterViewInit(): void {
    MaterialService.updateTextInputs();
  }

  // При выборе атомобиля
  onChangeCar(e: any) {
    // Получаем выбранный автомобиль
    this.summa.car = JSON.parse(e)

    // Если все необходимое заполнено то считаем суммы для тарифов
    if (this.summa.car !== {} && this.summa.tariff !== '' && this.summa.booking_start !== '' && this.summa.booking_end !== '') {
      if (this.summa.tariff === 'Город') {
        if (this.summa.booking_days < 3) {
          if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_1_2
            this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
          }
          if (this.summa.dop_hours >= 12) {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_1_2
            this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog)
          }
          if (this.summa.dop_hours === 0) {
            this.summa.summa = this.summa.booking_days * this.summa.car.days_1_2;
            this.summa.summaFull = +this.summa.summa + +this.summa.car.zalog;
          }

        }
        else if (this.summa.booking_days >= 3 && this.summa.booking_days <= 7) {
          if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_3_7
            this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
          }
          if (this.summa.dop_hours >= 12) {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_3_7
            this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog)
          }
          if (this.summa.dop_hours === 0) {
            this.summa.summa = this.summa.booking_days * this.summa.car.days_3_7;
            this.summa.summaFull = +this.summa.summa + +this.summa.car.zalog;
          }
        }
        else if (this.summa.booking_days > 7 && this.summa.booking_days <= 14) {
          if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_8_14
            this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
          }
          if (this.summa.dop_hours >= 12) {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_8_14
            this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog)
          }
          if (this.summa.dop_hours === 0) {
            this.summa.summa = this.summa.booking_days * this.summa.car.days_8_14;
            this.summa.summaFull = +this.summa.summa + +this.summa.car.zalog;
          }
        }
        else if (this.summa.booking_days > 14 && this.summa.booking_days <= 31) {
          if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_15_30
            this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
          }
          if (this.summa.dop_hours >= 12) {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_15_30
            this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog)
          }
          if (this.summa.dop_hours === 0) {
            this.summa.summa = this.summa.booking_days * this.summa.car.days_15_30;
            this.summa.summaFull = +this.summa.summa + +this.summa.car.zalog;
          }
        }
        else if (this.summa.booking_days > 31) {
          if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_31_more
            this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
          }
          if (this.summa.dop_hours >= 12) {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_31_more
            this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog)
          }
          if (this.summa.dop_hours === 0) {
            this.summa.summa = this.summa.booking_days * this.summa.car.days_31_more;
            this.summa.summaFull = +this.summa.summa + +this.summa.car.zalog;
          }
        }
      }
      else if (this.summa.tariff === 'Межгород') {
        if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
          this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.mezgorod
          this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog_mej) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
        }
        if (this.summa.dop_hours >= 12) {
          this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.mezgorod
          this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog_mej)
        }
        if (this.summa.dop_hours === 0) {
          this.summa.summa = this.summa.booking_days * this.summa.car.mezgorod;
          this.summa.summaFull = +this.summa.summa + +this.summa.car.zalog_mej;
        }
      }
      else if (this.summa.tariff === 'Россия') {
        if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
          this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.russia
          this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog_rus) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
        }
        if (this.summa.dop_hours >= 12) {
          this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.russia
          this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog_rus)
        }
        if (this.summa.dop_hours === 0) {
          this.summa.summa = this.summa.booking_days * this.summa.car.russia;
          this.summa.summaFull = +this.summa.summa + +this.summa.car.zalog_rus;
        }
      }

    }
  }


  // При выборе начала аренды
  bookingStartDate(e: any) {
    // Получаем начало аренды
    this.summa.booking_start = e.target.value

    // Получаем знапчения начала и конца аренды
    const booking_start__x: any = new Date(this.form.value.booking_start);
    const booking_end__x: any = new Date(this.form.value.booking_end);


    // Считаем дополнительные часы
    const dop_hour_days = (booking_end__x - booking_start__x) / (1000 * 60 * 60 * 24);

    if (!Number.isInteger(dop_hour_days)) {
      this.summa.dop_hours = Math.floor(((booking_end__x - booking_start__x) / (1000 * 60 * 60)) % 24);
    }
    else {
      this.summa.dop_hours = 0
    }



    // Назначаем переменную для колличества дней аренды
    this.summa.booking_days = (booking_end__x - booking_start__x) / (1000 * 60 * 60 * 24);

    // Если все необходимое заполнено то считаем суммы для тарифов
    if (this.summa.car !== {} && this.summa.tariff !== '' && this.summa.booking_start !== '' && this.summa.booking_end !== '') {
      if (this.summa.tariff === 'Город') {
        if (this.summa.booking_days < 3) {
          if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_1_2
            this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
          }
          if (this.summa.dop_hours >= 12) {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_1_2
            this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog)
          }
          if (this.summa.dop_hours === 0) {
            this.summa.summa = this.summa.booking_days * this.summa.car.days_1_2;
            this.summa.summaFull = +this.summa.summa + +this.summa.car.zalog;
          }

        }
        else if (this.summa.booking_days >= 3 && this.summa.booking_days <= 7) {
          if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_3_7
            this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
          }
          if (this.summa.dop_hours >= 12) {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_3_7
            this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog)
          }
          if (this.summa.dop_hours === 0) {
            this.summa.summa = this.summa.booking_days * this.summa.car.days_3_7;
            this.summa.summaFull = +this.summa.summa + +this.summa.car.zalog;
          }
        }
        else if (this.summa.booking_days > 7 && this.summa.booking_days <= 14) {
          if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_8_14
            this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
          }
          if (this.summa.dop_hours >= 12) {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_8_14
            this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog)
          }
          if (this.summa.dop_hours === 0) {
            this.summa.summa = this.summa.booking_days * this.summa.car.days_8_14;
            this.summa.summaFull = +this.summa.summa + +this.summa.car.zalog;
          }
        }
        else if (this.summa.booking_days > 14 && this.summa.booking_days <= 31) {
          if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_15_30
            this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
          }
          if (this.summa.dop_hours >= 12) {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_15_30
            this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog)
          }
          if (this.summa.dop_hours === 0) {
            this.summa.summa = this.summa.booking_days * this.summa.car.days_15_30;
            this.summa.summaFull = +this.summa.summa + +this.summa.car.zalog;
          }
        }
        else if (this.summa.booking_days > 31) {
          if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_31_more
            this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
          }
          if (this.summa.dop_hours >= 12) {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_31_more
            this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog)
          }
          if (this.summa.dop_hours === 0) {
            this.summa.summa = this.summa.booking_days * this.summa.car.days_31_more;
            this.summa.summaFull = +this.summa.summa + +this.summa.car.zalog;
          }
        }
      }
      else if (this.summa.tariff === 'Межгород') {
        if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
          this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.mezgorod
          this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog_mej) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
        }
        if (this.summa.dop_hours >= 12) {
          this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.mezgorod
          this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog_mej)
        }
        if (this.summa.dop_hours === 0) {
          this.summa.summa = this.summa.booking_days * this.summa.car.mezgorod;
          this.summa.summaFull = +this.summa.summa + +this.summa.car.zalog_mej;
        }
      }
      else if (this.summa.tariff === 'Россия') {
        if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
          this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.russia
          this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog_rus) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
        }
        if (this.summa.dop_hours >= 12) {
          this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.russia
          this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog_rus)
        }
        if (this.summa.dop_hours === 0) {
          this.summa.summa = this.summa.booking_days * this.summa.car.russia;
          this.summa.summaFull = +this.summa.summa + +this.summa.car.zalog_rus;
        }
      }

    }
  }


  // При выборе конца аренды
  bookingEndDate(e: any) {
    // Получаем конец аренды
    this.summa.booking_end = e.target.value

    // Получаем знапчения начала и конца аренды
    const booking_start__x: any = new Date(this.form.value.booking_start);
    const booking_end__x: any = new Date(this.form.value.booking_end);


    // Считаем дополнительные часы
    const dop_hour_days = (booking_end__x - booking_start__x) / (1000 * 60 * 60 * 24);

    if (!Number.isInteger(dop_hour_days)) {
      this.summa.dop_hours = Math.floor(((booking_end__x - booking_start__x) / (1000 * 60 * 60)) % 24);
    }
    else {
      this.summa.dop_hours = 0
    }



    // Назначаем переменную для колличества дней аренды
    this.summa.booking_days = (booking_end__x - booking_start__x) / (1000 * 60 * 60 * 24);

    // Если все необходимое заполнено то считаем суммы для тарифов
    if (this.summa.car !== {} && this.summa.tariff !== '' && this.summa.booking_start !== '' && this.summa.booking_end !== '') {
      if (this.summa.tariff === 'Город') {
        if (this.summa.booking_days < 3) {
          if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_1_2
            this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
          }
          if (this.summa.dop_hours >= 12) {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_1_2
            this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog)
          }
          if (this.summa.dop_hours === 0) {
            this.summa.summa = this.summa.booking_days * this.summa.car.days_1_2;
            this.summa.summaFull = +this.summa.summa + +this.summa.car.zalog;
          }

        }
        else if (this.summa.booking_days >= 3 && this.summa.booking_days <= 7) {
          if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_3_7
            this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
          }
          if (this.summa.dop_hours >= 12) {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_3_7
            this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog)
          }
          if (this.summa.dop_hours === 0) {
            this.summa.summa = this.summa.booking_days * this.summa.car.days_3_7;
            this.summa.summaFull = +this.summa.summa + +this.summa.car.zalog;
          }
        }
        else if (this.summa.booking_days > 7 && this.summa.booking_days <= 14) {
          if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_8_14
            this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
          }
          if (this.summa.dop_hours >= 12) {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_8_14
            this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog)
          }
          if (this.summa.dop_hours === 0) {
            this.summa.summa = this.summa.booking_days * this.summa.car.days_8_14;
            this.summa.summaFull = +this.summa.summa + +this.summa.car.zalog;
          }
        }
        else if (this.summa.booking_days > 14 && this.summa.booking_days <= 31) {
          if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_15_30
            this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
          }
          if (this.summa.dop_hours >= 12) {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_15_30
            this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog)
          }
          if (this.summa.dop_hours === 0) {
            this.summa.summa = this.summa.booking_days * this.summa.car.days_15_30;
            this.summa.summaFull = +this.summa.summa + +this.summa.car.zalog;
          }
        }
        else if (this.summa.booking_days > 31) {
          if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_31_more
            this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
          }
          if (this.summa.dop_hours >= 12) {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_31_more
            this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog)
          }
          if (this.summa.dop_hours === 0) {
            this.summa.summa = this.summa.booking_days * this.summa.car.days_31_more;
            this.summa.summaFull = +this.summa.summa + +this.summa.car.zalog;
          }
        }
      }
      else if (this.summa.tariff === 'Межгород') {
        if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
          this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.mezgorod
          this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog_mej) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
        }
        if (this.summa.dop_hours >= 12) {
          this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.mezgorod
          this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog_mej)
        }
        if (this.summa.dop_hours === 0) {
          this.summa.summa = this.summa.booking_days * this.summa.car.mezgorod;
          this.summa.summaFull = +this.summa.summa + +this.summa.car.zalog_mej;
        }
      }
      else if (this.summa.tariff === 'Россия') {
        if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
          this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.russia
          this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog_rus) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
        }
        if (this.summa.dop_hours >= 12) {
          this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.russia
          this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog_rus)
        }
        if (this.summa.dop_hours === 0) {
          this.summa.summa = this.summa.booking_days * this.summa.car.russia;
          this.summa.summaFull = +this.summa.summa + +this.summa.car.zalog_rus;
        }
      }

    }



    // Считаем дни продления брони
    let exD1 : any = new Date(this.form.value.booking_end);
    let exD2 : any = new Date(this.actualBooking.booking_end);
    this.extendDays = (exD1 - exD2) / (1000 * 60 * 60 * 24) ;
    this.extendSumm();


    // Автоматически подставляем ссумму продления в поле оплата
    if (this.summa_extend.summa > 0)
    {
      this.form.patchValue({
        arenda: this.summa_extend.summa,
      });

      this.xsExtendSummBeforeSale = this.summa_extend.summa;
    }

   

  
  }


  // При ваыборе тарифа
  onChangeTariff(e: any) {
    // Получаем тариф
    this.summa.tariff = e

    // Если все необходимое заполнено то считаем суммы для тарифов
    if (this.summa.car !== {} && this.summa.tariff !== '' && this.summa.booking_start !== '' && this.summa.booking_end !== '') {
      if (this.summa.tariff === 'Город') {
        if (this.summa.booking_days < 3) {
          if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_1_2
            this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
          }
          if (this.summa.dop_hours >= 12) {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_1_2
            this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog)
          }
          if (this.summa.dop_hours === 0) {
            this.summa.summa = this.summa.booking_days * this.summa.car.days_1_2;
            this.summa.summaFull = +this.summa.summa + +this.summa.car.zalog;
          }

        }
        else if (this.summa.booking_days >= 3 && this.summa.booking_days <=7) {
          if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_3_7
            this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
          }
          if (this.summa.dop_hours >= 12) {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_3_7
            this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog)
          }
          if (this.summa.dop_hours === 0) {
            this.summa.summa = this.summa.booking_days * this.summa.car.days_3_7;
            this.summa.summaFull = +this.summa.summa + +this.summa.car.zalog;
          }
        }
        else if (this.summa.booking_days > 7 && this.summa.booking_days <=14) {
          if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_8_14
            this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
          }
          if (this.summa.dop_hours >= 12) {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_8_14
            this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog)
          }
          if (this.summa.dop_hours === 0) {
            this.summa.summa = this.summa.booking_days * this.summa.car.days_8_14;
            this.summa.summaFull = +this.summa.summa + +this.summa.car.zalog;
          }
        }
        else if (this.summa.booking_days > 14 && this.summa.booking_days <=31) {
          if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_15_30
            this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
          }
          if (this.summa.dop_hours >= 12) {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_15_30
            this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog)
          }
          if (this.summa.dop_hours === 0) {
            this.summa.summa = this.summa.booking_days * this.summa.car.days_15_30;
            this.summa.summaFull = +this.summa.summa + +this.summa.car.zalog;
          }
        }
        else if (this.summa.booking_days >= 31) {
          if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_31_more
            this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
          }
          if (this.summa.dop_hours >= 12) {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_31_more
            this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog)
          }
          if (this.summa.dop_hours === 0) {
            this.summa.summa = this.summa.booking_days * this.summa.car.days_31_more;
            this.summa.summaFull = +this.summa.summa + +this.summa.car.zalog;
          }
        }
      }
      else if (this.summa.tariff === 'Межгород') {
        if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
          this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.mezgorod
          this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog_mej) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
        }
        if (this.summa.dop_hours >= 12) {
          this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.mezgorod
          this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog_mej)
        }
        if (this.summa.dop_hours === 0) {
          this.summa.summa = this.summa.booking_days * this.summa.car.mezgorod;
          this.summa.summaFull = +this.summa.summa + +this.summa.car.zalog_mej;
        }
      }
      else if (this.summa.tariff === 'Россия') {
        if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
          this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.russia
          this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog_rus) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
        }
        if (this.summa.dop_hours >= 12) {
          this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.russia
          this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog_rus)
        }
        if (this.summa.dop_hours === 0) {
          this.summa.summa = this.summa.booking_days * this.summa.car.russia;
          this.summa.summaFull = +this.summa.summa + +this.summa.car.zalog_rus;
        }
      }

    }

    this.extendSumm();
  }

  // Проверяем нажат ли чекбокс для скидки
  xs_isSaleCheck() {
    this.isSaleCheck = !this.isSaleCheck;

    
  }



  // При вводе значения в поле скидки
  xs_isSaleValue(e)
  {
    if (e.target.value > 0) {
      this.form.patchValue({
        arenda: this.xsExtendSummBeforeSale - e.target.value,
      });
    }
    
  }


  // Считаем сумму продлени брони
  extendSumm()
  {
    
    let alldays = this.summa.booking_days;

    if (this.summa.car !== {} && this.summa.tariff !== '' && this.summa.booking_start !== '' && this.summa.booking_end !== '')
    {
      if (this.summa.tariff === 'Город') {
      if (alldays < 3) {
          
          if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
            this.summa_extend.summa = Math.round(this.extendDays) * this.summa.car.days_1_2
            this.summa.summaFull = (+this.actualBooking.summaFull) + (+this.summa_extend.summa);
            this.summa.summa = (+this.actualBooking.summa) + (+this.summa_extend.summa)
            
          }
          if (this.summa.dop_hours >= 12) {
            this.summa_extend.summa = Math.round(this.extendDays) * this.summa.car.days_1_2
            this.summa.summaFull = (+this.actualBooking.summaFull) + (+this.summa_extend.summa);
            this.summa.summa = (+this.actualBooking.summa) + (+this.summa_extend.summa)
          }
          if (this.summa.dop_hours === 0) {
            this.summa_extend.summa = Math.round(this.extendDays) * this.summa.car.days_1_2
            this.summa.summaFull = (+this.actualBooking.summaFull) + (+this.summa_extend.summa);
            this.summa.summa = (+this.actualBooking.summa) + (+this.summa_extend.summa)
          }

        }
      else if (alldays >= 3 && alldays <= 7) {
          if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
            this.summa_extend.summa = Math.round(this.extendDays) * this.summa.car.days_3_7
            this.summa.summaFull = (+this.actualBooking.summaFull) + (+this.summa_extend.summa);
            this.summa.summa = (+this.actualBooking.summa) + (+this.summa_extend.summa)
          }
          if (this.summa.dop_hours >= 12) {
            this.summa_extend.summa = Math.round(this.extendDays) * this.summa.car.days_3_7
            this.summa.summaFull = (+this.actualBooking.summaFull) + (+this.summa_extend.summa);
            this.summa.summa = (+this.actualBooking.summa) + (+this.summa_extend.summa)
          }
          if (this.summa.dop_hours === 0) {
            this.summa_extend.summa = Math.round(this.extendDays) * this.summa.car.days_3_7
            this.summa.summaFull = (+this.actualBooking.summaFull) + (+this.summa_extend.summa);
            this.summa.summa = (+this.actualBooking.summa) + (+this.summa_extend.summa)
          }
        }
      else if (alldays > 7 && alldays <= 14) {
          if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
            this.summa_extend.summa = Math.round(this.extendDays) * this.summa.car.days_8_14
            this.summa.summaFull = (+this.actualBooking.summaFull) + (+this.summa_extend.summa);
            this.summa.summa = (+this.actualBooking.summa) + (+this.summa_extend.summa)
          }
          if (this.summa.dop_hours >= 12) {
            this.summa_extend.summa = Math.round(this.extendDays) * this.summa.car.days_8_14
            this.summa.summaFull = (+this.actualBooking.summaFull) + (+this.summa_extend.summa);
            this.summa.summa = (+this.actualBooking.summa) + (+this.summa_extend.summa)
          }
          if (this.summa.dop_hours === 0) {
            this.summa_extend.summa = Math.round(this.extendDays) * this.summa.car.days_8_14
            this.summa.summaFull = (+this.actualBooking.summaFull) + (+this.summa_extend.summa);
            this.summa.summa = (+this.actualBooking.summa) + (+this.summa_extend.summa)
          }
        }
      else if (alldays > 14 && alldays <= 31) {
          if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
            this.summa_extend.summa = Math.round(this.extendDays) * this.summa.car.days_15_30
            this.summa.summaFull = (+this.actualBooking.summaFull) + (+this.summa_extend.summa);
            this.summa.summa = (+this.actualBooking.summa) + (+this.summa_extend.summa)
          }
          if (this.summa.dop_hours >= 12) {
            this.summa_extend.summa = Math.round(this.extendDays) * this.summa.car.days_15_30
            this.summa.summaFull = (+this.actualBooking.summaFull) + (+this.summa_extend.summa);
            this.summa.summa = (+this.actualBooking.summa) + (+this.summa_extend.summa)
          }
          if (this.summa.dop_hours === 0) {
            this.summa_extend.summa = Math.round(this.extendDays) * this.summa.car.days_15_30
            this.summa.summaFull = (+this.actualBooking.summaFull) + (+this.summa_extend.summa);
            this.summa.summa = (+this.actualBooking.summa) + (+this.summa_extend.summa)
          }
        }
      else if (alldays > 31) {
          if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
            this.summa_extend.summa = Math.round(this.extendDays) * this.summa.car.days_31_more
            this.summa.summaFull = (+this.actualBooking.summaFull) + (+this.summa_extend.summa);
            this.summa.summa = (+this.actualBooking.summa) + (+this.summa_extend.summa)
          }
          if (this.summa.dop_hours >= 12) {
            this.summa_extend.summa = Math.round(this.extendDays) * this.summa.car.days_31_more
            this.summa.summaFull = (+this.actualBooking.summaFull) + (+this.summa_extend.summa);
            this.summa.summa = (+this.actualBooking.summa) + (+this.summa_extend.summa)
          }
          if (this.summa.dop_hours === 0) {
            this.summa_extend.summa = Math.round(this.extendDays) * this.summa.car.days_31_more
            this.summa.summaFull = (+this.actualBooking.summaFull) + (+this.summa_extend.summa);
            this.summa.summa = (+this.actualBooking.summa) + (+this.summa_extend.summa)
          }
        }
      }
      else if (this.summa.tariff === 'Межгород') {
        if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
          this.summa_extend.summa = Math.round(this.extendDays) * this.summa.car.mezgorod
          this.summa.summaFull = (+this.actualBooking.summaFull) + (+this.summa_extend.summa);
          this.summa.summa = (+this.actualBooking.summa) + (+this.summa_extend.summa)
        }
        if (this.summa.dop_hours >= 12) {
          this.summa_extend.summa = Math.round(this.extendDays) * this.summa.car.mezgorod
          this.summa.summaFull = (+this.actualBooking.summaFull) + (+this.summa_extend.summa);
          this.summa.summa = (+this.actualBooking.summa) + (+this.summa_extend.summa)
        }
        if (this.summa.dop_hours === 0) {
          this.summa_extend.summa = this.extendDays * this.summa.car.mezgorod;
          this.summa.summaFull = (+this.actualBooking.summaFull) + (+this.summa_extend.summa);
          this.summa.summa = (+this.actualBooking.summa) + (+this.summa_extend.summa)
        }
      }
      else if (this.summa.tariff === 'Россия') {
        if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
          this.summa_extend.summa = Math.round(this.extendDays) * this.summa.car.russia
          this.summa.summaFull = (+this.actualBooking.summaFull) + (+this.summa_extend.summa);
          this.summa.summa = (+this.actualBooking.summa) + (+this.summa_extend.summa)
        }
        if (this.summa.dop_hours >= 12) {
          this.summa_extend.summa = Math.round(this.extendDays) * this.summa.car.russia
          this.summa.summaFull = (+this.actualBooking.summaFull) + (+this.summa_extend.summa);
          this.summa.summa = (+this.actualBooking.summa) + (+this.summa_extend.summa)
        }
        if (this.summa.dop_hours === 0) {
          this.summa_extend.summa = Math.round(this.extendDays) * this.summa.car.russia
          this.summa.summaFull = (+this.actualBooking.summaFull) + (+this.summa_extend.summa);
          this.summa.summa = (+this.actualBooking.summa) + (+this.summa_extend.summa)
        }
      }
    }
  }

  
  onSubmit() {


    // Получаем знапчения начала и конца аренды
    const booking_start__x: any = new Date(this.form.value.booking_start);
    const booking_end__x: any = new Date(this.form.value.booking_end);

    if (booking_start__x === undefined && booking_end__x !== undefined) {
      this.booking_days_fin = moment(booking_end__x, 'DD.MM.YYYY').diff(
        moment(this.form.value.booking_start, 'DD.MM.YYYY'),
        'days'
      );
    } else if (booking_end__x === undefined && booking_start__x !== undefined) {
      this.booking_days_fin = moment(
        this.form.value.booking_end,
        'DD.MM.YYYY'
      ).diff(moment(booking_start__x, 'DD.MM.YYYY'), 'days');
    } else if ((booking_end__x && booking_start__x) === undefined) {
      this.booking_days_fin = moment(
        this.form.value.booking_end,
        'DD.MM.YYYY'
      ).diff(moment(this.form.value.booking_start, 'DD.MM.YYYY'), 'days');
    } else if (booking_end__x !== undefined && booking_start__x !== undefined) {
      this.booking_days_fin =
        (booking_end__x - booking_start__x) / (1000 * 60 * 60 * 24);
    }

    const xs_sale = this.form.value.isSaleCheckbox;



    if (xs_sale <= 0)
    {

      const pay = {
        vid: 'Продление',
        pricePay: this.form.value.arenda,
        typePay: this.form.value.typePayArenda,
        bookingId: this.bookingId,
      };


      const booking = {
        car: JSON.parse(this.form.value.car),
        sale: (+this.actualBooking.sale),
        client: JSON.parse(this.form.value.client),
        place_start: this.form.value.place_start,
        place_end: this.form.value.place_end,
        tariff: this.form.value.tariff,
        comment: this.form.value.comment,
        booking_start: this.form.value.booking_start,
        booking_end: this.form.value.booking_end,
        booking_days: (+this.actualBooking.booking_days) + (+this.extendDays) ,
        summaFull: this.summa.summaFull,
        summa:this.summa.summa,
        dop_hours: this.summa.dop_hours,
        extend: {
          date: new Date(),
          days: this.extendDays,
          summ: this.form.value.arenda,
          sale: xs_sale || 0
        }
      };

      this.subBookingExtend$ = this.bookings.extend(this.bookingId, booking).pipe(
        map(res => {
          this.pays.create(pay).subscribe((pay) => {
            MaterialService.toast('Платеж создан');
            this.router.navigate(['/view-booking', this.bookingId]);
          });
          return res;
        })
      ).subscribe((booking) => {
        MaterialService.toast('Бронь продлена');
      });


    }
    else if(xs_sale > 0)
    {

      const pay = {
        vid: 'Продление',
        pricePay: (+this.form.value.arenda),
        typePay: this.form.value.typePayArenda,
        bookingId: this.bookingId,
      };


      const booking = {
        car: JSON.parse(this.form.value.car),
        sale: (+this.actualBooking.sale) + (+xs_sale),
        client: JSON.parse(this.form.value.client),
        place_start: this.form.value.place_start,
        place_end: this.form.value.place_end,
        tariff: this.form.value.tariff,
        comment: this.form.value.comment,
        booking_start: this.form.value.booking_start,
        booking_end: this.form.value.booking_end,
        booking_days: (+this.actualBooking.booking_days) + (+this.extendDays),
        summaFull: (+this.summa.summaFull) - (+xs_sale),
        summa: (+this.summa.summa) - (+xs_sale),
        dop_hours: this.summa.dop_hours,
        extend: {
          date: new Date(),
          days: this.extendDays,
          summ: (+this.form.value.arenda),
          sale: xs_sale
        }
      };

      this.subBookingExtend$ = this.bookings.extend(this.bookingId, booking).pipe(
        map(res => {
          this.pays.create(pay).subscribe((pay) => {
            MaterialService.toast('Платеж создан');
            this.router.navigate(['/view-booking', this.bookingId]);
          });
          return res;
        })
      ).subscribe((booking) => {
        MaterialService.toast('Бронь продлена');
      });
    }

  }

}
