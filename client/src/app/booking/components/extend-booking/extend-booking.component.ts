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
import { Booking, Summa, SummaMixedTarif } from 'src/app/shared/types/interfaces';
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

  // Храним объект суммы
  summa: Summa = {
    car: {},
    tariff: [],
    booking_start: '',
    booking_end: '',
    summa: 0,
    booking_days: '',
    summaFull: 0,
    dop_hours: '',
    place_start_price: 0,
    place_end_price: 0,
    additional_services_price: 0
  }


  // Храним объект суммы для смешанного тарифа
  SummaMixedTarif: SummaMixedTarif = {
    tarifGorod: {},
    tarifMezjGorod: {},
    tarifRussia: {},
  }

  summa_extend: any = {
    car: {},
    tariff: '',
    booking_start: '',
    booking_end: '',
    summa: 0,
    booking_days: '',
    summaFull: 0,
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


  // Добавляем платеж в логировнаие брони
  extendPay$: Subscription


  // Цена тарифа
  tarifPrice: any = []

  // При выборе смешанного тарифа
  isMixedTarif: Boolean = false;





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
    if (this.extendPay$)
    {
      this.extendPay$.unsubscribe();
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
      tarif_mixed_gorod: new FormControl(''),
      tarif_mixed_gorod_days: new FormControl(''),
      tarif_mixed_mezjgorod: new FormControl(''),
      tarif_mixed_mezjgorod_days: new FormControl(''),
      tarif_mixed_russia: new FormControl(''),
      tarif_mixed_russia_days: new FormControl(''),
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
        tariff: res.tariff.length > 1 ? 'Смешанный' : res.tariff[0].name,
        comment: res.comment,
      });

      if (res.tariff.length === 1)
      {
        this.summa.tariff = res.tariff;
      }
      else
      {
        this.summa.tariff = []
      }
      this.summa.car = res.car;
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

    if(this.summa.tariff.length < 2)
    {
      // Если все необходимое заполнено то считаем суммы для тарифов
      if (this.summa.booking_start !== '' && this.summa.booking_end !== '') {
        if (this.summa.tariff[0].name === 'Город') {
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
        else if (this.summa.tariff[0].name === 'Межгород') {
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
        else if (this.summa.tariff[0].name === 'Россия') {
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

    if (this.summa.tariff.length < 2)
    {
      // Если все необходимое заполнено то считаем суммы для тарифов
      if (this.summa.booking_start !== '' && this.summa.booking_end !== '') {
        if (this.summa.tariff[0].name === 'Город') {
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
        else if (this.summa.tariff[0].name === 'Межгород') {
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
        else if (this.summa.tariff[0].name === 'Россия') {
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



    if (this.summa.tariff.length < 2)
    {
      if (this.summa.booking_start !== '' && this.summa.booking_end !== '') {
        if (this.summa.tariff[0].name === 'Город') {
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
        else if (this.summa.tariff[0].name === 'Межгород') {
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
        else if (this.summa.tariff[0].name === 'Россия') {
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
      let exD1: any = new Date(this.form.value.booking_end);
      let exD2: any = new Date(this.actualBooking.booking_end);
      this.extendDays = (exD1 - exD2) / (1000 * 60 * 60 * 24);


      this.extendSumm();

      // Автоматически подставляем ссумму продления в поле оплата
      if (this.summa_extend.summa > 0) {
        this.form.patchValue({
          arenda: this.summa_extend.summa,
      });

        this.xsExtendSummBeforeSale = this.summa_extend.summa;
      }
    }

  }


  // При ваыборе тарифа
  onChangeTariff(e: any) {
    if (e !== "Смешанный")
    {
      this.summa.tariff = this.actualBooking.tariff
  
      //Получаем тариф
      this.summa.tariff[0].name = e
      this.isMixedTarif = false

      
      // Если все необходимое заполнено то считаем суммы для тарифов
      if (this.summa.booking_start !== '' && this.summa.booking_end !== '') {
        if (this.summa.tariff[0].name === 'Город') {
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
        else if (this.summa.tariff[0].name === 'Межгород') {
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
        else if (this.summa.tariff[0].name === 'Россия') {
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

      // Автоматически подставляем ссумму продления в поле оплата
      if (this.summa_extend.summa > 0) {
        this.form.patchValue({
          arenda: this.summa_extend.summa,
        });

        this.xsExtendSummBeforeSale = this.summa_extend.summa;
      }
    }
    else
    {
      this.summa.summa -= this.summa_extend.summa
      this.summa.summaFull -= this.summa_extend.summa
      this.summa_extend.summa -= this.summa_extend.summa


      // Обнуляем массив с тарифами
      this.isMixedTarif = true;
      this.summa.tariff = [];
      this.form.controls['tarif_mixed_gorod_days'].disable();
      this.form.controls['tarif_mixed_mezjgorod_days'].disable();
      this.form.controls['tarif_mixed_russia_days'].disable();

      // Автоматически подставляем ссумму продления в поле оплата
      this.form.patchValue({
        arenda: 0,
      });

    }
  }


  // При выборе смешанного тарифа - Город
  onChangeMixedTarifGorod(e) {
    this.form.controls['tarif_mixed_gorod_days'].enable();
    if (this.form.value.tarif_mixed_gorod) {

      this.summa.tariff.push({
        name: 'Город',
        days: 0,
        summa: 0
      })

          
      this.form.patchValue({
        arenda: this.summa_extend.summa,
      });

    }
    else {
      
      this.form.patchValue({
        tarif_mixed_gorod_days: null,
      });

      this.form.controls['tarif_mixed_gorod_days'].disable();
      this.summa.tariff = this.summa.tariff.filter((t) => t.name !== 'Город')
      this.SummaMixedTarif.tarifGorod.summa = 0

      this.extendSumm();
      this.SummaMixedTarif.tarifGorod.days = 0

      this.form.patchValue({
        arenda: this.summa_extend.summa,
      });

      
    }
  }
  // При вводе колличества дней смешанного тарифа город
  onChangeMixedTarifGorodDays(e) {
    if (this.form.value.tarif_mixed_gorod_days) {
      this.summa.tariff.forEach(tarif => {
        if (tarif.name === 'Город') {
          tarif.days = this.form.value.tarif_mixed_gorod_days
          this.SummaMixedTarif.tarifGorod.days = this.form.value.tarif_mixed_gorod_days
        }

        if (tarif.name !== '' && this.summa.booking_start !== '' && this.summa.booking_end !== '') {
          if (tarif.name === 'Город') {
            if (this.form.value.tarif_mixed_gorod_days < 3) {
              if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
                this.SummaMixedTarif.tarifGorod.summa = Math.round(this.form.value.tarif_mixed_gorod_days) * this.summa.car.days_1_2
                this.SummaMixedTarif.tarifGorod.summaFull = +this.SummaMixedTarif.tarifGorod.summa + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
                tarif.summa = this.SummaMixedTarif.tarifGorod.summa
              }
              if (this.summa.dop_hours >= 12) {
                this.SummaMixedTarif.tarifGorod.summa = Math.round(this.form.value.tarif_mixed_gorod_days) * this.summa.car.days_1_2
                this.SummaMixedTarif.tarifGorod.summaFull = +this.SummaMixedTarif.tarifGorod.summa + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
                tarif.summa = this.SummaMixedTarif.tarifGorod.summa
              }
              if (this.summa.dop_hours === 0) {
                this.SummaMixedTarif.tarifGorod.summa = this.form.value.tarif_mixed_gorod_days * this.summa.car.days_1_2;
                this.SummaMixedTarif.tarifGorod.summaFull = +this.SummaMixedTarif.tarifGorod.summa + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
                tarif.summa = this.SummaMixedTarif.tarifGorod.summa
              }

            }
            else if (this.form.value.tarif_mixed_gorod_days >= 3 && this.form.value.tarif_mixed_gorod_days <= 7) {
              if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
                this.SummaMixedTarif.tarifGorod.summa = Math.round(this.form.value.tarif_mixed_gorod_days) * this.summa.car.days_3_7
                this.SummaMixedTarif.tarifGorod.summaFull = +this.SummaMixedTarif.tarifGorod.summa + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
                tarif.summa = this.SummaMixedTarif.tarifGorod.summa
              }
              if (this.summa.dop_hours >= 12) {
                this.SummaMixedTarif.tarifGorod.summa = Math.round(this.form.value.tarif_mixed_gorod_days) * this.summa.car.days_3_7
                this.SummaMixedTarif.tarifGorod.summaFull = +this.SummaMixedTarif.tarifGorod.summa + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
                tarif.summa = this.SummaMixedTarif.tarifGorod.summa
              }
              if (this.summa.dop_hours === 0) {
                this.SummaMixedTarif.tarifGorod.summa = this.form.value.tarif_mixed_gorod_days * this.summa.car.days_3_7;
                this.SummaMixedTarif.tarifGorod.summaFull = +this.SummaMixedTarif.tarifGorod.summa + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
                tarif.summa = this.SummaMixedTarif.tarifGorod.summa
              }
            }
            else if (this.form.value.tarif_mixed_gorod_days > 7 && this.form.value.tarif_mixed_gorod_days <= 14) {
              if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
                this.SummaMixedTarif.tarifGorod.summa = Math.round(this.form.value.tarif_mixed_gorod_days) * this.summa.car.days_8_14
                this.SummaMixedTarif.tarifGorod.summaFull = +this.SummaMixedTarif.tarifGorod.summa + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
                tarif.summa = this.SummaMixedTarif.tarifGorod.summa
              }
              if (this.summa.dop_hours >= 12) {
                this.SummaMixedTarif.tarifGorod.summa = Math.round(this.form.value.tarif_mixed_gorod_days) * this.summa.car.days_8_14
                this.SummaMixedTarif.tarifGorod.summaFull = +this.SummaMixedTarif.tarifGorod.summa + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
                tarif.summa = this.SummaMixedTarif.tarifGorod.summa
              }
              if (this.summa.dop_hours === 0) {
                this.SummaMixedTarif.tarifGorod.summa = this.form.value.tarif_mixed_gorod_days * this.summa.car.days_8_14;
                this.SummaMixedTarif.tarifGorod.summaFull = +this.SummaMixedTarif.tarifGorod.summa + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
                tarif.summa = this.SummaMixedTarif.tarifGorod.summa
              }
            }
            else if (this.form.value.tarif_mixed_gorod_days > 14 && this.form.value.tarif_mixed_gorod_days <= 31) {
              if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
                this.SummaMixedTarif.tarifGorod.summa = Math.round(this.form.value.tarif_mixed_gorod_days) * this.summa.car.days_15_30
                this.SummaMixedTarif.tarifGorod.summaFull = +this.SummaMixedTarif.tarifGorod.summa + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
                tarif.summa = this.SummaMixedTarif.tarifGorod.summa
              }
              if (this.summa.dop_hours >= 12) {
                this.SummaMixedTarif.tarifGorod.summa = Math.round(this.form.value.tarif_mixed_gorod_days) * this.summa.car.days_15_30
                this.SummaMixedTarif.tarifGorod.summaFull = +this.SummaMixedTarif.tarifGorod.summa + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
                tarif.summa = this.SummaMixedTarif.tarifGorod.summa
              }
              if (this.summa.dop_hours === 0) {
                this.SummaMixedTarif.tarifGorod.summa = this.form.value.tarif_mixed_gorod_days * this.summa.car.days_15_30;
                this.SummaMixedTarif.tarifGorod.summaFull = +this.SummaMixedTarif.tarifGorod.summa + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
                tarif.summa = this.SummaMixedTarif.tarifGorod.summa
              }
            }
            else if (this.form.value.tarif_mixed_gorod_days > 31) {
              if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
                this.SummaMixedTarif.tarifGorod.summa = Math.round(this.form.value.tarif_mixed_gorod_days) * this.summa.car.days_31_more
                this.SummaMixedTarif.tarifGorod.summaFull = +this.SummaMixedTarif.tarifGorod.summa + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
                tarif.summa = this.SummaMixedTarif.tarifGorod.summa
              }
              if (this.summa.dop_hours >= 12) {
                this.SummaMixedTarif.tarifGorod.summa = Math.round(this.form.value.tarif_mixed_gorod_days) * this.summa.car.days_31_more
                this.SummaMixedTarif.tarifGorod.summaFull = +this.SummaMixedTarif.tarifGorod.summa + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
                tarif.summa = this.SummaMixedTarif.tarifGorod.summa
              }
              if (this.summa.dop_hours === 0) {
                this.SummaMixedTarif.tarifGorod.summa = this.form.value.tarif_mixed_gorod_days * this.summa.car.days_31_more;
                this.SummaMixedTarif.tarifGorod.summaFull = +this.SummaMixedTarif.tarifGorod.summa + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
                tarif.summa = this.SummaMixedTarif.tarifGorod.summa
              }
            }
          }
        }

        this.extendSumm();
        
        this.form.patchValue({
          arenda: this.summa_extend.summa,
        });
      });
    }
    else {
      this.summa.tariff.forEach(element => {
        if (element.name === 'Город') {
          element.days = 0
        }
      });

      this.extendSumm();

      this.form.patchValue({
        arenda: this.summa_extend.summa,
      });
    }

  }

  // При выборе смешанного тарифа - Межгород
  onChangeMixedTarifMezjGorod(e) {
    this.form.controls['tarif_mixed_mezjgorod_days'].enable();
    if (this.form.value.tarif_mixed_mezjgorod) {
      this.summa.tariff.push({
        name: 'Межгород',
        days: 0,
        summa: 0
      })
      
      this.form.patchValue({
        arenda: this.summa_extend.summa,
      });
    }
    else {
      this.form.patchValue({
        tarif_mixed_mezjgorod_days: null,
      });
      this.form.controls['tarif_mixed_mezjgorod_days'].disable();
      this.summa.tariff = this.summa.tariff.filter((t) => t.name !== 'Межгород')
      this.SummaMixedTarif.tarifMezjGorod.summa = 0


      this.SummaMixedTarif.tarifMezjGorod.days = 0

      this.extendSumm();

      this.form.patchValue({
        arenda: this.summa_extend.summa,
      });
    }
  }

  // При вводе колличества дней смешанного тарифа Межгород
  onChangeMixedTarifMezjGorodDays(e) {
    if (this.form.value.tarif_mixed_mezjgorod_days) {
      this.summa.tariff.forEach(tarif => {
        if (tarif.name === 'Межгород') {
          tarif.days = this.form.value.tarif_mixed_mezjgorod_days
          this.SummaMixedTarif.tarifMezjGorod.days = this.form.value.tarif_mixed_mezjgorod_days

          if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
            this.SummaMixedTarif.tarifMezjGorod.summa = Math.round(this.form.value.tarif_mixed_mezjgorod_days) * this.summa.car.mezgorod
            this.SummaMixedTarif.tarifMezjGorod.summaFull = +this.SummaMixedTarif.tarifMezjGorod.summa + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
            tarif.summa = this.SummaMixedTarif.tarifMezjGorod.summa
          }
          if (this.summa.dop_hours >= 12) {
            this.SummaMixedTarif.tarifMezjGorod.summa = Math.round(this.form.value.tarif_mixed_mezjgorod_days) * this.summa.car.mezgorod
            this.SummaMixedTarif.tarifMezjGorod.summaFull = +this.SummaMixedTarif.tarifMezjGorod.summa + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
            tarif.summa = this.SummaMixedTarif.tarifMezjGorod.summa
          }
          if (this.summa.dop_hours === 0) {
            this.SummaMixedTarif.tarifMezjGorod.summa = this.form.value.tarif_mixed_mezjgorod_days * this.summa.car.mezgorod;
            this.SummaMixedTarif.tarifMezjGorod.summaFull = +this.SummaMixedTarif.tarifMezjGorod.summa + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
            tarif.summa = this.SummaMixedTarif.tarifMezjGorod.summa
          }
        }
      });
      this.extendSumm();




      this.form.patchValue({
        arenda: this.summa_extend.summa,
      });
    }
    else {
      this.summa.tariff.forEach(element => {
        if (element.name === 'Межгород') {
          element.days = 0
        }
      });
      this.extendSumm();

      this.form.patchValue({
        arenda: this.summa_extend.summa,
      });

    }
  }


  // При выборе смешанного тарифа - Россия
  onChangeMixedTarifRussia(e) {
    this.form.controls['tarif_mixed_russia_days'].enable();
    if (this.form.value.tarif_mixed_russia) {
      this.summa.tariff.push({
        name: 'Россия',
        days: 0,
        summa: 0
      })
      this.extendSumm();

      this.form.patchValue({
        arenda: this.summa_extend.summa,
      });
    }
    else {
      this.form.patchValue({
        tarif_mixed_russia_days: null,
      });
      this.form.controls['tarif_mixed_russia_days'].disable();
      this.summa.tariff = this.summa.tariff.filter((t) => t.name !== 'Россия')
      this.SummaMixedTarif.tarifRussia.summa = 0
      this.SummaMixedTarif.tarifRussia.days = 0
      this.extendSumm();

      this.form.patchValue({
        arenda: this.summa_extend.summa,
      });
    }
  }

  // При вводе колличества дней смешанного тарифа Россия
  onChangeMixedTarifRussiaDays(e) {
    if (this.form.value.tarif_mixed_russia_days) {
      this.summa.tariff.forEach(tarif => {
        if (tarif.name === 'Россия') {
          tarif.days = this.form.value.tarif_mixed_russia_days
          this.SummaMixedTarif.tarifRussia.days = this.form.value.tarif_mixed_russia_days


          if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
            this.SummaMixedTarif.tarifRussia.summa = Math.round(this.form.value.tarif_mixed_russia_days) * this.summa.car.russia
            this.SummaMixedTarif.tarifRussia.summaFull = +this.SummaMixedTarif.tarifRussia.summa + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
            tarif.summa = this.SummaMixedTarif.tarifRussia.summa
          }
          if (this.summa.dop_hours >= 12) {
            this.SummaMixedTarif.tarifRussia.summa = Math.round(this.form.value.tarif_mixed_russia_days) * this.summa.car.russia
            this.SummaMixedTarif.tarifRussia.summaFull = +this.SummaMixedTarif.tarifRussia.summa + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
            tarif.summa = this.SummaMixedTarif.tarifRussia.summa
          }
          if (this.summa.dop_hours === 0) {
            this.SummaMixedTarif.tarifRussia.summa = this.form.value.tarif_mixed_russia_days * this.summa.car.russia;
            this.SummaMixedTarif.tarifRussia.summaFull = +this.SummaMixedTarif.tarifRussia.summa + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
            tarif.summa = this.SummaMixedTarif.tarifRussia.summa
          }
        }
      });

      this.extendSumm();

      this.form.patchValue({
        arenda: this.summa_extend.summa,
      });

    }
    else {
      this.summa.tariff.forEach(element => {
        if (element.name === 'Россия') {
          element.days = 0
        }
      });

      this.extendSumm();

      this.form.patchValue({
        arenda: this.summa_extend.summa,
      });
    }
  }

  // Проверяем нажат ли чекбокс для скидки
  xs_isSaleCheck() {
    this.isSaleCheck = !this.isSaleCheck;
  }



  // При вводе значения в поле скидки
  xs_isSaleValue(e)
  {
    if (this.form.value.tariff !== "Смешанный")
    {
      if (e.target.value > 0) {
        this.form.patchValue({
          arenda: this.xsExtendSummBeforeSale - e.target.value,
        });
      }
    }
    else
    {
      if (e.target.value > 0) {
        this.form.patchValue({
          arenda: this.summa_extend.summa - e.target.value,
        });
      }
    }
    
    
    
  }


  // Считаем сумму продлени брони
  extendSumm()
  {
    this.summa_extend.summa = 0
    this.summa_extend.summaFull = 0

    
    if (this.form.value.tariff !== "Смешанный")
    {
      let alldays = this.summa.booking_days;
      this.summa.tariff[0].days =  Math.round(+this.extendDays)


      if (this.summa.booking_start !== '' && this.summa.booking_end !== '') {
        if (this.summa.tariff[0].name === 'Город') {
          if (alldays < 3) {

            if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
              this.summa_extend.summa = Math.round(this.extendDays) * this.summa.car.days_1_2
              this.summa.summaFull = (+this.actualBooking.summaFull) + (+this.summa_extend.summa);
              this.summa.summa = (+this.actualBooking.summa) + (+this.summa_extend.summa)
              this.summa.tariff[0].summa = this.summa_extend.summa
            }
            if (this.summa.dop_hours >= 12) {
              this.summa_extend.summa = Math.round(this.extendDays) * this.summa.car.days_1_2
              this.summa.summaFull = (+this.actualBooking.summaFull) + (+this.summa_extend.summa);
              this.summa.summa = (+this.actualBooking.summa) + (+this.summa_extend.summa)
              this.summa.tariff[0].summa = this.summa_extend.summa
            }
            if (this.summa.dop_hours === 0) {
              this.summa_extend.summa = Math.round(this.extendDays) * this.summa.car.days_1_2
              this.summa.summaFull = (+this.actualBooking.summaFull) + (+this.summa_extend.summa);
              this.summa.summa = (+this.actualBooking.summa) + (+this.summa_extend.summa)
              this.summa.tariff[0].summa = this.summa_extend.summa
            }

          }
          else if (alldays >= 3 && alldays <= 7) {
            if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
              this.summa_extend.summa = Math.round(this.extendDays) * this.summa.car.days_3_7
              this.summa.summaFull = (+this.actualBooking.summaFull) + (+this.summa_extend.summa);
              this.summa.summa = (+this.actualBooking.summa) + (+this.summa_extend.summa)
              this.summa.tariff[0].summa = this.summa_extend.summa
            }
            if (this.summa.dop_hours >= 12) {
              this.summa_extend.summa = Math.round(this.extendDays) * this.summa.car.days_3_7
              this.summa.summaFull = (+this.actualBooking.summaFull) + (+this.summa_extend.summa);
              this.summa.summa = (+this.actualBooking.summa) + (+this.summa_extend.summa)
              this.summa.tariff[0].summa = this.summa_extend.summa
            }
            if (this.summa.dop_hours === 0) {
              this.summa_extend.summa = Math.round(this.extendDays) * this.summa.car.days_3_7
              this.summa.summaFull = (+this.actualBooking.summaFull) + (+this.summa_extend.summa);
              this.summa.summa = (+this.actualBooking.summa) + (+this.summa_extend.summa)
              this.summa.tariff[0].summa = this.summa_extend.summa
            }
          }
          else if (alldays > 7 && alldays <= 14) {
            if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
              this.summa_extend.summa = Math.round(this.extendDays) * this.summa.car.days_8_14
              this.summa.summaFull = (+this.actualBooking.summaFull) + (+this.summa_extend.summa);
              this.summa.summa = (+this.actualBooking.summa) + (+this.summa_extend.summa)
              this.summa.tariff[0].summa = this.summa_extend.summa
            }
            if (this.summa.dop_hours >= 12) {
              this.summa_extend.summa = Math.round(this.extendDays) * this.summa.car.days_8_14
              this.summa.summaFull = (+this.actualBooking.summaFull) + (+this.summa_extend.summa);
              this.summa.summa = (+this.actualBooking.summa) + (+this.summa_extend.summa)
              this.summa.tariff[0].summa = this.summa_extend.summa
            }
            if (this.summa.dop_hours === 0) {
              this.summa_extend.summa = Math.round(this.extendDays) * this.summa.car.days_8_14
              this.summa.summaFull = (+this.actualBooking.summaFull) + (+this.summa_extend.summa);
              this.summa.summa = (+this.actualBooking.summa) + (+this.summa_extend.summa)
              this.summa.tariff[0].summa = this.summa_extend.summa
            }
          }
          else if (alldays > 14 && alldays <= 31) {
            if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
              this.summa_extend.summa = Math.round(this.extendDays) * this.summa.car.days_15_30
              this.summa.summaFull = (+this.actualBooking.summaFull) + (+this.summa_extend.summa);
              this.summa.summa = (+this.actualBooking.summa) + (+this.summa_extend.summa)
              this.summa.tariff[0].summa = this.summa_extend.summa
            }
            if (this.summa.dop_hours >= 12) {
              this.summa_extend.summa = Math.round(this.extendDays) * this.summa.car.days_15_30
              this.summa.summaFull = (+this.actualBooking.summaFull) + (+this.summa_extend.summa);
              this.summa.summa = (+this.actualBooking.summa) + (+this.summa_extend.summa)
              this.summa.tariff[0].summa = this.summa_extend.summa
            }
            if (this.summa.dop_hours === 0) {
              this.summa_extend.summa = Math.round(this.extendDays) * this.summa.car.days_15_30
              this.summa.summaFull = (+this.actualBooking.summaFull) + (+this.summa_extend.summa);
              this.summa.summa = (+this.actualBooking.summa) + (+this.summa_extend.summa)
              this.summa.tariff[0].summa = this.summa_extend.summa
            }
          }
          else if (alldays > 31) {
            if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
              this.summa_extend.summa = Math.round(this.extendDays) * this.summa.car.days_31_more
              this.summa.summaFull = (+this.actualBooking.summaFull) + (+this.summa_extend.summa);
              this.summa.summa = (+this.actualBooking.summa) + (+this.summa_extend.summa)
              this.summa.tariff[0].summa = this.summa_extend.summa
            }
            if (this.summa.dop_hours >= 12) {
              this.summa_extend.summa = Math.round(this.extendDays) * this.summa.car.days_31_more
              this.summa.summaFull = (+this.actualBooking.summaFull) + (+this.summa_extend.summa);
              this.summa.summa = (+this.actualBooking.summa) + (+this.summa_extend.summa)
              this.summa.tariff[0].summa = this.summa_extend.summa
            }
            if (this.summa.dop_hours === 0) {
              this.summa_extend.summa = Math.round(this.extendDays) * this.summa.car.days_31_more
              this.summa.summaFull = (+this.actualBooking.summaFull) + (+this.summa_extend.summa);
              this.summa.summa = (+this.actualBooking.summa) + (+this.summa_extend.summa)
              this.summa.tariff[0].summa = this.summa_extend.summa
            }
          }
        }
        else if (this.summa.tariff[0].name === 'Межгород') {
          if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
            this.summa_extend.summa = Math.round(this.extendDays) * this.summa.car.mezgorod
            this.summa.summaFull = (+this.actualBooking.summaFull) + (+this.summa_extend.summa);
            this.summa.summa = (+this.actualBooking.summa) + (+this.summa_extend.summa)
            this.summa.tariff[0].summa = this.summa_extend.summa
          }
          if (this.summa.dop_hours >= 12) {
            this.summa_extend.summa = Math.round(this.extendDays) * this.summa.car.mezgorod
            this.summa.summaFull = (+this.actualBooking.summaFull) + (+this.summa_extend.summa);
            this.summa.summa = (+this.actualBooking.summa) + (+this.summa_extend.summa)
            this.summa.tariff[0].summa = this.summa_extend.summa
          }
          if (this.summa.dop_hours === 0) {
            this.summa_extend.summa = this.extendDays * this.summa.car.mezgorod;
            this.summa.summaFull = (+this.actualBooking.summaFull) + (+this.summa_extend.summa);
            this.summa.summa = (+this.actualBooking.summa) + (+this.summa_extend.summa)
            this.summa.tariff[0].summa = this.summa_extend.summa
          }
        }
        else if (this.summa.tariff[0].name === 'Россия') {
          if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
            this.summa_extend.summa = Math.round(this.extendDays) * this.summa.car.russia
            this.summa.summaFull = (+this.actualBooking.summaFull) + (+this.summa_extend.summa);
            this.summa.summa = (+this.actualBooking.summa) + (+this.summa_extend.summa)
            this.summa.tariff[0].summa = this.summa_extend.summa
          }
          if (this.summa.dop_hours >= 12) {
            this.summa_extend.summa = Math.round(this.extendDays) * this.summa.car.russia
            this.summa.summaFull = (+this.actualBooking.summaFull) + (+this.summa_extend.summa);
            this.summa.summa = (+this.actualBooking.summa) + (+this.summa_extend.summa)
            this.summa.tariff[0].summa = this.summa_extend.summa
          }
          if (this.summa.dop_hours === 0) {
            this.summa_extend.summa = Math.round(this.extendDays) * this.summa.car.russia
            this.summa.summaFull = (+this.actualBooking.summaFull) + (+this.summa_extend.summa);
            this.summa.summa = (+this.actualBooking.summa) + (+this.summa_extend.summa)
            this.summa.tariff[0].summa = this.summa_extend.summa
          }
        }
      }
    }
    else
    {
      this.summa.tariff.forEach(tarif => {
        if (tarif.name === 'Город') 
        {
          let tarif_days_and_booking_days = Number(tarif.days) + Number(this.actualBooking.booking_days)
          
          
          if (tarif_days_and_booking_days < 3) {

            if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
              this.summa_extend.summa += Number(Math.round(tarif.days) * this.summa.car.days_1_2) 
              tarif.summa = this.summa_extend.summa
            }
            if (this.summa.dop_hours >= 12) {
              this.summa_extend.summa += Number(Math.round(tarif.days) * this.summa.car.days_1_2) 
              tarif.summa = this.summa_extend.summa
            }
            if (this.summa.dop_hours === 0) {
              this.summa_extend.summa += Number(Math.round(tarif.days) * this.summa.car.days_1_2) 
              // this.summa_extend.summaFull += (+this.actualBooking.summaFull) + Number(Math.round(tarif.days) * this.summa.car.days_1_2);
              tarif.summa = this.summa_extend.summa
            }

          }
          else if (tarif_days_and_booking_days >= 3 && tarif_days_and_booking_days <= 7) {
            if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
              this.summa_extend.summa += Number(Math.round(tarif.days) * this.summa.car.days_3_7)
              tarif.summa = this.summa_extend.summa
            }
            if (this.summa.dop_hours >= 12) {
              this.summa_extend.summa += Number(Math.round(tarif.days) * this.summa.car.days_3_7)
              tarif.summa = this.summa_extend.summa
            }
            if (this.summa.dop_hours === 0) {
              this.summa_extend.summa += Number(Math.round(tarif.days) * this.summa.car.days_3_7)
              tarif.summa = this.summa_extend.summa
              // this.summa_extend.summaFull += (+this.actualBooking.summaFull) + Number(Math.round(tarif.days) * this.summa.car.days_3_7);
            }
          }
          else if (tarif_days_and_booking_days > 7 && tarif_days_and_booking_days <= 14) {
            if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
              this.summa_extend.summa += Number(Math.round(tarif.days) * this.summa.car.days_8_14)
              tarif.summa = this.summa_extend.summa
            }
            if (this.summa.dop_hours >= 12) {
              this.summa_extend.summa += Number(Math.round(tarif.days) * this.summa.car.days_8_14)
              tarif.summa = this.summa_extend.summa
            }
            if (this.summa.dop_hours === 0) {
              this.summa_extend.summa += Number(Math.round(tarif.days) * this.summa.car.days_8_14)
              // this.summa_extend.summaFull += (+this.actualBooking.summaFull) + Number(Math.round(tarif.days) * this.summa.car.days_8_14);
              tarif.summa = this.summa_extend.summa
            }
          }
          else if (tarif_days_and_booking_days > 14 && tarif_days_and_booking_days <= 31) {
            if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
              this.summa_extend.summa += Number(Math.round(tarif.days) * this.summa.car.days_15_30)
              tarif.summa = this.summa_extend.summa
            }
            if (this.summa.dop_hours >= 12) {
              this.summa_extend.summa += Number(Math.round(tarif.days) * this.summa.car.days_15_30)
              tarif.summa = this.summa_extend.summa
            }
            if (this.summa.dop_hours === 0) {
              this.summa_extend.summa += Number(Math.round(tarif.days) * this.summa.car.days_15_30)
              tarif.summa = this.summa_extend.summa
              // this.summa_extend.summaFull += (+this.actualBooking.summaFull) + Number(Math.round(tarif.days) * this.summa.car.days_15_30);
            }
          }
          else if (tarif_days_and_booking_days > 31) {
            if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
              this.summa_extend.summa += Number(Math.round(tarif.days) * this.summa.car.days_31_more)
              tarif.summa = this.summa_extend.summa
            }
            if (this.summa.dop_hours >= 12) {
              this.summa_extend.summa += Number(Math.round(tarif.days) * this.summa.car.days_31_more)
              tarif.summa = this.summa_extend.summa
            }
            if (this.summa.dop_hours === 0) {
              this.summa_extend.summa += Number(Math.round(tarif.days) * this.summa.car.days_31_more)
              // this.summa_extend.summaFull += (+this.actualBooking.summaFull) + Number(Math.round(tarif.days) * this.summa.car.days_31_more);
              tarif.summa = this.summa_extend.summa
            }
          }
        }
        else if (tarif.name === 'Межгород') {
          if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
            this.summa_extend.summa += Number(Math.round(tarif.days) * this.summa.car.mezgorod)
            tarif.summa = this.summa_extend.summa
          }
          if (this.summa.dop_hours >= 12) {
            this.summa_extend.summa += Number(Math.round(tarif.days) * this.summa.car.mezgorod)
            tarif.summa = this.summa_extend.summa
          }
          if (this.summa.dop_hours === 0) {
            this.summa_extend.summa += Number(Math.round(tarif.days) * this.summa.car.mezgorod)
            // this.summa_extend.summaFull += (+this.actualBooking.summaFull) + Number(Math.round(tarif.days) * this.summa.car.mezgorod);
            tarif.summa = this.summa_extend.summa
          }
        }
        else if (tarif.name === 'Россия') {
          if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
            this.summa_extend.summa += Number(Math.round(tarif.days) * this.summa.car.russia)
            tarif.summa = this.summa_extend.summa
          }
          if (this.summa.dop_hours >= 12) {
            this.summa_extend.summa += Number(Math.round(tarif.days) * this.summa.car.russia)
            tarif.summa = this.summa_extend.summa
          }
          if (this.summa.dop_hours === 0) {
            this.summa_extend.summa += Number(Math.round(tarif.days) * this.summa.car.russia)
            // this.summa.summaFull += (+this.actualBooking.summaFull) + (+this.summa_extend.summa);
            tarif.summa = this.summa_extend.summa
          }
        }
      });
    }
  }



  checkedTarif() {

    // let tarif_days_and_booking_days = Number(this.summa.booking_days) + Number(this.actualBooking.booking_days)

    console.log(this.actualBooking.booking_days);
    
    
    if (this.form.value.tariff === 'Город') {
      if (this.summa.booking_days < 3) {
        this.tarifPrice.push({
          name: 'Город',
          price: this.summa.car.days_1_2
        })
      }
      if (this.summa.booking_days >= 3 && this.summa.booking_days < 7) {
        this.tarifPrice.push({
          name: 'Город',
          price: this.summa.car.days_3_7
        })
      }
      if (this.summa.booking_days >= 7 && this.summa.booking_days < 14) {
        this.tarifPrice.push({
          name: 'Город',
          price: this.summa.car.days_8_14
        })
      }
      if (this.summa.booking_days >= 14 && this.summa.booking_days < 31) {
        this.tarifPrice.push({
          name: 'Город',
          price: this.summa.car.days_15_30
        })
      }
      if (this.summa.booking_days >= 31) {
        this.tarifPrice.push({
          name: 'Город',
          price: this.summa.car.days_31_more
        })
      }
    }
    else if (this.form.value.tariff === 'Межгород') {
      if (this.summa.booking_days < 3) {
        this.tarifPrice = this.summa.car.mezgorod
        this.tarifPrice.push({
          name: 'Межгород',
          price: this.summa.car.mezgorod
        })
      }
      if (this.summa.booking_days >= 3 && this.summa.booking_days < 7) {
        this.tarifPrice.push({
          name: 'Межгород',
          price: this.summa.car.mezgorod
        })
      }
      if (this.summa.booking_days >= 7 && this.summa.booking_days < 14) {
        this.tarifPrice.push({
          name: 'Межгород',
          price: this.summa.car.mezgorod
        })
      }
      if (this.summa.booking_days >= 14 && this.summa.booking_days < 31) {
        this.tarifPrice.push({
          name: 'Межгород',
          price: this.summa.car.mezgorod
        })
      }
      if (this.summa.booking_days >= 31) {
        this.tarifPrice.push({
          name: 'Межгород',
          price: this.summa.car.mezgorod
        })
      }
    }
    else if (this.form.value.tariff === 'Россия') {
      if (this.summa.booking_days < 3) {
        this.tarifPrice.push({
          name: 'Россия',
          price: this.summa.car.russia
        })
      }
      if (this.summa.booking_days >= 3 && this.summa.booking_days < 7) {
        this.tarifPrice.push({
          name: 'Россия',
          price: this.summa.car.russia
        })
      }
      if (this.summa.booking_days >= 7 && this.summa.booking_days < 14) {
        this.tarifPrice.push({
          name: 'Россия',
          price: this.summa.car.russia
        })
      }
      if (this.summa.booking_days >= 14 && this.summa.booking_days < 31) {
        this.tarifPrice.push({
          name: 'Россия',
          price: this.summa.car.russia
        })
      }
      if (this.summa.booking_days >= 31) {
        this.tarifPrice.push({
          name: 'Россия',
          price: this.summa.car.russia
        })
      }
    }
    else if (this.form.value.tariff === 'Смешанный') {
      this.summa.tariff.forEach(tarif => {
        if (tarif.name === 'Город') {
          let all_days = +tarif.days + (+this.actualBooking.booking_days)

          if (all_days < 3) {
            this.tarifPrice.push({
              name: 'Город',
              price: this.summa.car.days_1_2
            })

          }
          if (all_days >= 3 && all_days < 7) {
            this.tarifPrice.push({
              name: 'Город',
              price: this.summa.car.days_3_7
            })

          }
          if (all_days >= 7 && all_days < 14) {
            this.tarifPrice.push({
              name: 'Город',
              price: this.summa.car.days_8_14
            })

          }
          if (all_days >= 14 && all_days < 31) {

            this.tarifPrice.push({
              name: 'Город',
              price: this.summa.car.days_15_30
            })
          }
          if (all_days >= 31) {
            this.tarifPrice.push({
              name: 'Город',
              price: this.summa.car.days_31_more
            })
          }
        }
        else if (tarif.name === 'Межгород') {
          if (tarif.days < 3) {
            this.tarifPrice.push({
              name: 'Межгород',
              price: this.summa.car.mezgorod
            })
          }
          if (tarif.days >= 3 && tarif.days < 7) {
            this.tarifPrice.push({
              name: 'Межгород',
              price: this.summa.car.mezgorod
            })
          }
          if (tarif.days >= 7 && tarif.days < 14) {
            this.tarifPrice.push({
              name: 'Межгород',
              price: this.summa.car.mezgorod
            })
          }
          if (tarif.days >= 14 && tarif.days < 31) {
            this.tarifPrice.push({
              name: 'Межгород',
              price: this.summa.car.mezgorod
            })
          }
          if (tarif.days >= 31) {
            this.tarifPrice.push({
              name: 'Межгород',
              price: this.summa.car.mezgorod
            })
          }
        }
        else if (tarif.name === 'Россия') {
          if (tarif.days < 3) {
            this.tarifPrice.push({
              name: 'Россия',
              price: this.summa.car.russia
            })
          }
          if (tarif.days >= 3 && tarif.days < 7) {
            this.tarifPrice.push({
              name: 'Россия',
              price: this.summa.car.russia
            })
          }
          if (tarif.days >= 7 && tarif.days < 14) {
            this.tarifPrice.push({
              name: 'Россия',
              price: this.summa.car.russia
            })
          }
          if (tarif.days >= 14 && tarif.days < 31) {
            this.tarifPrice.push({
              name: 'Россия',
              price: this.summa.car.russia
            })
          }
          if (tarif.days >= 31) {
            this.tarifPrice.push({
              name: 'Россия',
              price: this.summa.car.russia
            })
          }
        }
      });
    }

    
  }

  
  onSubmit() {

    this.checkedTarif();


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


    if (this.form.value.tariff !== "Смешанный")
    {
      if (xs_sale <= 0) {

        const pay = {
          vid: 'Продление',
          pricePay: this.form.value.arenda,
          typePay: this.form.value.typePayArenda,
          bookingId: this.bookingId,
          smenaId: this.actualBooking.smenaId,
        };


        const booking = {
          car: JSON.parse(this.form.value.car),
          sale: (+this.actualBooking.sale),
          client: JSON.parse(this.form.value.client),
          place_start: this.form.value.place_start,
          place_end: this.form.value.place_end,
          tariff: this.summa.tariff,
          comment: this.form.value.comment,
          booking_start: this.form.value.booking_start,
          booking_end: this.form.value.booking_end,
          booking_days: (+this.actualBooking.booking_days) + (+this.extendDays),
          summaFull: this.summa.summaFull,
          summa: this.summa.summa,
          dop_hours: this.summa.dop_hours,
          dop_info_open: {
            tarifPrice: [...this.tarifPrice] || 0
          },
          extend: {
            date: new Date(),
            days: this.extendDays,
            summ: this.form.value.arenda,
            sale: xs_sale || 0,
            tariff: this.summa.tariff
          }
        };
        
        

        this.extendPay$ = this.bookings.update_after_booking_pay(this.actualBooking._id, pay).subscribe(res => { })

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
      else if (xs_sale > 0) {

        const pay = {
          vid: 'Продление',
          pricePay: (+this.form.value.arenda),
          typePay: this.form.value.typePayArenda,
          bookingId: this.bookingId,
          smenaId: this.actualBooking.smenaId,
        };


        const booking = {
          car: JSON.parse(this.form.value.car),
          sale: (+this.actualBooking.sale) + (+xs_sale),
          client: JSON.parse(this.form.value.client),
          place_start: this.form.value.place_start,
          place_end: this.form.value.place_end,
          tariff: this.summa.tariff,
          comment: this.form.value.comment,
          booking_start: this.form.value.booking_start,
          booking_end: this.form.value.booking_end,
          booking_days: (+this.actualBooking.booking_days) + (+this.extendDays),
          summaFull: (+this.summa.summaFull) - (+xs_sale),
          summa: (+this.summa.summa) - (+xs_sale),
          dop_hours: this.summa.dop_hours,
          dop_info_open: {
            tarifPrice: [...this.tarifPrice] || 0
          },
          extend: {
            date: new Date(),
            days: this.extendDays,
            summ: (+this.form.value.arenda),
            sale: xs_sale,
            tariff: this.summa.tariff
          }
        };

        this.extendPay$ = this.bookings.update_after_booking_pay(this.actualBooking._id, pay).subscribe(res => { })

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
    else
    {
      if (xs_sale <= 0) {

        const pay = {
          vid: 'Продление',
          pricePay: this.summa_extend.summa,
          typePay: this.form.value.typePayArenda,
          bookingId: this.bookingId,
          smenaId: this.actualBooking.smenaId,
        };


        const booking = {
          car: JSON.parse(this.form.value.car),
          sale: (+this.actualBooking.sale),
          client: JSON.parse(this.form.value.client),
          place_start: this.form.value.place_start,
          place_end: this.form.value.place_end,
          tariff: this.summa.tariff,
          comment: this.form.value.comment,
          booking_start: this.form.value.booking_start,
          booking_end: this.form.value.booking_end,
          booking_days: (+this.actualBooking.booking_days) + (+this.SummaMixedTarif.tarifGorod.days || 0) + (+this.SummaMixedTarif.tarifMezjGorod.days || 0) + (+this.SummaMixedTarif.tarifRussia.days || 0),
          summaFull: +this.summa.summaFull + (+this.summa_extend.summa),
          summa: this.summa.summa + this.summa_extend.summa,
          dop_hours: this.summa.dop_hours,
          dop_info_open: {
            tarifPrice: [...this.tarifPrice] || 0
          },
          extend: {
            date: new Date(),
            days: (+this.SummaMixedTarif.tarifGorod.days || 0) + (+this.SummaMixedTarif.tarifMezjGorod.days || 0) + (+this.SummaMixedTarif.tarifRussia.days || 0),
            summ: this.form.value.arenda,
            sale: xs_sale || 0,
            tariff: this.summa.tariff
          }
        };


      
 
        
        

        

        this.extendPay$ = this.bookings.update_after_booking_pay(this.actualBooking._id, pay).subscribe(res => { })

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
      else if (xs_sale > 0) {

        const pay = {
          vid: 'Продление',
          pricePay: this.summa_extend.summa - (+xs_sale),
          typePay: this.form.value.typePayArenda,
          bookingId: this.bookingId,
          smenaId: this.actualBooking.smenaId,
        };


        const booking = {
          car: JSON.parse(this.form.value.car),
          sale: (+this.actualBooking.sale) + (+xs_sale),
          client: JSON.parse(this.form.value.client),
          place_start: this.form.value.place_start,
          place_end: this.form.value.place_end,
          tariff: this.summa.tariff,
          comment: this.form.value.comment,
          booking_start: this.form.value.booking_start,
          booking_end: this.form.value.booking_end,
          booking_days: (+this.actualBooking.booking_days) + (+this.SummaMixedTarif.tarifGorod.days || 0) + (+this.SummaMixedTarif.tarifMezjGorod.days || 0) + (+this.SummaMixedTarif.tarifRussia.days || 0),
          summaFull: (+this.summa.summaFull + this.summa_extend.summa) - (+xs_sale),
          summa: (+this.summa.summa + this.summa_extend.summa) - (+xs_sale),
          dop_hours: this.summa.dop_hours,
          dop_info_open: {
            tarifPrice: [...this.tarifPrice] || 0
          },
          extend: {
            date: new Date(),
            days: this.extendDays,
            summ: (+this.form.value.arenda),
            sale: xs_sale,
            tariff: this.summa.tariff
          }
        };

        this.extendPay$ = this.bookings.update_after_booking_pay(this.actualBooking._id, pay).subscribe(res => { })

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

}
