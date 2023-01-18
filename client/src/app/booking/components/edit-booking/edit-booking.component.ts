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
import { CarsService } from 'src/app/cars/services/cars.service';
import { ClientsService } from 'src/app/clients/services/clients.service';
import { MaterialService } from 'src/app/shared/services/material.service';
import { MaterialDatepicker, Summa } from 'src/app/shared/types/interfaces';
import { BookingsService } from '../../services/bookings.service';

import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { DocumentsService } from 'src/app/documents/services/documents.service';

@Component({
  selector: 'app-edit-booking',
  templateUrl: './edit-booking.component.html',
  styleUrls: ['./edit-booking.component.css'],
})
export class EditBookingComponent implements OnInit, AfterViewInit, OnDestroy {
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

  bookingId!: string;
  bookingViewRef!: string;

  form: any;

  xscars$!: any;

  booking_days_fin!: any;

  xsclients$!: any;

  xsActualClient!: any;

  subUpdateBooking$: Subscription;

  // Результат поиска
  searchResult: any[] = [];
  searchResultLawFase: any[] = [];

  // Проверяем есть ли введенный запрос
  hasQuery: Boolean = false;
  hasQueryLawFase: Boolean = false;

  // Видимость полей поиска по умолчанию
  fizSearchIsVisible: Boolean = false;
  lawSearchIsVisible: Boolean = false;


  // Храним клиента выбранного при поиске
  xs_actual_search__client: any = null;
  xs_actual_search__client_no_json: any = null;
  xs_actual_search__client___lawfase: any = null;
  xs_actual_search__client___lawfase_no_json: any = null;


  // Храним выбранный тип клиента
  xs_actual_client_type: string = '';



  // Активный номер договора для физ/лица
  xs_dogovor_number__actual: string = '';


  // Есть ли у клиента активный договор
  isActiveDogovor: any = '';


  // Если договор закончится раньше брони
  is_dogovor_finish_compare_booking: any = '';


  // Подписка для активного договора
  getDogovorActive$ : Subscription;

  // Храним результат поиска клиента
  searchResultClient$: Subscription;

  constructor(
    private bookings: BookingsService,
    private router: Router,
    private cars: CarsService,
    private clients: ClientsService,
    private rote: ActivatedRoute,
    private documents: DocumentsService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.getParams();
    this.getByIdBookong();
    this.setMinDate();
    this.xscars$ = this.cars.fetch();
    this.xsclients$ = this.clients.fetch();
    MaterialService.updateTextInputs();
  }

  ngOnDestroy(): void {
    if (this.subUpdateBooking$)
    {
      this.subUpdateBooking$.unsubscribe();
    }
    if (this.getDogovorActive$)
    {
      this.getDogovorActive$.unsubscribe();
    }
    if (this.searchResultClient$)
    {
      this.searchResultClient$.unsubscribe();
    }
  }

  ngAfterViewInit(): void {
    MaterialService.initTabs(this.tabs.nativeElement);
    MaterialService.updateTextInputs();
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
      clear_auto: new FormControl(''),
      full_tank: new FormControl(''),
      isCustomeZalogControl: new FormControl(''),
      search_fiz: new FormControl(''),
      search_law: new FormControl(''),
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


  getByIdBookong()
  {
    this.bookings.getById(this.bookingId).subscribe((res) => {
      console.log('111', res);
      
      this.form.patchValue({
        car: JSON.stringify(res.car, null, 2),
        client: res.client.type,
        booking_start: res.booking_start,
        booking_end: res.booking_end,
        place_start: res.place_start,
        place_end: res.place_end,
        tariff: res.tariff,
        comment: res.comment,
        clear_auto: res.dop_info_open.clear_auto,
        full_tank: res.dop_info_open.full_tank,
      });

      this.changeClient(res.client)
      this.changeClientLawFase(res.client);

      this.summa.car = res.car;
      this.summa.tariff = res.tariff;
      this.summa.booking_start = res.booking_start;
      this.summa.booking_end = res.booking_end;
      this.summa.summa = res.summa;
      this.summa.summaFull = res.summaFull;
      this.summa.booking_days = res.booking_days;
      this.summa.dop_hours = res.dop_hours;


      this.xsActualClient = res.client;


      if (res.client.type === 'fiz') {
        this.lawSearchIsVisible = false;
        this.fizSearchIsVisible = true;
        this.xs_actual_client_type = 'fiz';
      }
      else if (res.client.type === 'law') {
        this.lawSearchIsVisible = true;
        this.fizSearchIsVisible = false;
        this.xs_actual_client_type = 'law';
      }
    });
  }

  // Задаем минимальный параметр даты
  setMinDate()
  {
    let booking_start: any = document.getElementById('booking_start');
    booking_start.min = new Date()
      .toISOString()
      .slice(0, new Date().toISOString().lastIndexOf(':'));

    let booking_end: any = document.getElementById('booking_end');
    booking_end.min = new Date()
      .toISOString()
      .slice(0, new Date().toISOString().lastIndexOf(':'));
  }


  // При выборе атомобиля
  onChangeCar(e: any)
  {
    // Получаем выбранный автомобиль
    this.summa.car = JSON.parse(e)

    // Если все необходимое заполнено то считаем суммы для тарифов
    if(this.summa.car !== {} && this.summa.tariff !== '' && this.summa.booking_start !== '' && this.summa.booking_end !== '')
    {
      if(this.summa.tariff === 'Город')
      {
        if(this.summa.booking_days < 3)
        {
          if(this.summa.dop_hours > 0 && this.summa.dop_hours < 12 )
          {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_1_2 
            this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
          }
          if( this.summa.dop_hours >= 12 )
          {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_1_2 
            this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog)
          }
          if (this.summa.dop_hours === 0 ) {
            this.summa.summa = this.summa.booking_days * this.summa.car.days_1_2;
            this.summa.summaFull = +this.summa.summa + +this.summa.car.zalog;
          }
          
        }
        else if(this.summa.booking_days >= 3 && this.summa.booking_days <7)
        {
            if(this.summa.dop_hours > 0 && this.summa.dop_hours < 12 )
            {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_3_7 
              this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
            }
            if( this.summa.dop_hours >= 12 )
            {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_3_7 
              this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog)
            }
            if (this.summa.dop_hours === 0 ) {
              this.summa.summa = this.summa.booking_days * this.summa.car.days_3_7;
              this.summa.summaFull = +this.summa.summa + +this.summa.car.zalog;
            }
        }
        else if(this.summa.booking_days >= 7 && this.summa.booking_days <14)
        {
            if(this.summa.dop_hours > 0 && this.summa.dop_hours < 12 )
            {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_8_14 
              this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
            }
            if( this.summa.dop_hours >= 12 )
            {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_8_14 
              this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog)
            }
            if (this.summa.dop_hours === 0 ) {
              this.summa.summa = this.summa.booking_days * this.summa.car.days_8_14;
              this.summa.summaFull = +this.summa.summa + +this.summa.car.zalog;
            }
        }
        else if(this.summa.booking_days >= 14 && this.summa.booking_days <31)
        {
            if(this.summa.dop_hours > 0 && this.summa.dop_hours < 12 )
            {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_15_30 
              this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
            }
            if( this.summa.dop_hours >= 12 )
            {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_15_30 
              this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog)
            }
            if (this.summa.dop_hours === 0 ) {
              this.summa.summa = this.summa.booking_days * this.summa.car.days_15_30;
              this.summa.summaFull = +this.summa.summa + +this.summa.car.zalog;
            }
        }
        else if(this.summa.booking_days >= 31)
        {
            if(this.summa.dop_hours > 0 && this.summa.dop_hours < 12 )
            {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_31_more 
              this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
            }
            if( this.summa.dop_hours >= 12 )
            {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_31_more 
              this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog)
            }
            if (this.summa.dop_hours === 0 ) {
              this.summa.summa = this.summa.booking_days * this.summa.car.days_31_more;
              this.summa.summaFull = +this.summa.summa + +this.summa.car.zalog;
            }
        }
      }
      else if(this.summa.tariff === 'Межгород')
      {
          if(this.summa.dop_hours > 0 && this.summa.dop_hours < 12 )
          {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.mezgorod 
            this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog_mej) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
          }
          if( this.summa.dop_hours >= 12 )
          {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.mezgorod 
            this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog_mej)
          }
          if (this.summa.dop_hours === 0 ) {
            this.summa.summa = this.summa.booking_days * this.summa.car.mezgorod;
            this.summa.summaFull = +this.summa.summa + +this.summa.car.zalog_mej;
          }
      }
      else if(this.summa.tariff === 'Россия')
      {
        if(this.summa.dop_hours > 0 && this.summa.dop_hours < 12 )
          {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.russia 
            this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog_rus) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
          }
          if( this.summa.dop_hours >= 12 )
          {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.russia 
            this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog_rus)
          }
          if (this.summa.dop_hours === 0 ) {
            this.summa.summa = this.summa.booking_days * this.summa.car.russia;
            this.summa.summaFull = +this.summa.summa + +this.summa.car.zalog_rus;
          }
      }
      
    }
  }


  // При выборе начала аренды
  bookingStartDate(e: any)
  {
    // Получаем начало аренды
    this.summa.booking_start = e.target.value

    // Получаем знапчения начала и конца аренды
    const booking_start__x: any = new Date(this.form.value.booking_start);
    const booking_end__x: any = new Date(this.form.value.booking_end);


    // Считаем дополнительные часы
    const dop_hour_days = (booking_end__x - booking_start__x) / (1000 * 60 * 60 * 24);
    
    if(!Number.isInteger(dop_hour_days))
    {
      this.summa.dop_hours = Math.floor(((booking_end__x - booking_start__x)/ (1000 * 60 * 60)) % 24);
    }
    else
    {
     this.summa.dop_hours = 0 
    }
    
    

    // Назначаем переменную для колличества дней аренды
    this.summa.booking_days = (booking_end__x - booking_start__x) / (1000 * 60 * 60 * 24);

    // Если все необходимое заполнено то считаем суммы для тарифов
    if(this.summa.car !== {} && this.summa.tariff !== '' && this.summa.booking_start !== '' && this.summa.booking_end !== '')
    {
      if(this.summa.tariff === 'Город')
      {
        if(this.summa.booking_days < 3)
        {
          if(this.summa.dop_hours > 0 && this.summa.dop_hours < 12 )
          {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_1_2 
            this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
          }
          if( this.summa.dop_hours >= 12 )
          {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_1_2 
            this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog)
          }
          if (this.summa.dop_hours === 0 ) {
            this.summa.summa = this.summa.booking_days * this.summa.car.days_1_2;
            this.summa.summaFull = +this.summa.summa + +this.summa.car.zalog;
          }
          
        }
        else if(this.summa.booking_days >= 3 && this.summa.booking_days <=7)
        {
            if(this.summa.dop_hours > 0 && this.summa.dop_hours < 12 )
            {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_3_7 
              this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
            }
            if( this.summa.dop_hours >= 12 )
            {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_3_7 
              this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog)
            }
            if (this.summa.dop_hours === 0 ) {
              this.summa.summa = this.summa.booking_days * this.summa.car.days_3_7;
              this.summa.summaFull = +this.summa.summa + +this.summa.car.zalog;
            }
        }
        else if(this.summa.booking_days > 7 && this.summa.booking_days <=14)
        {
            if(this.summa.dop_hours > 0 && this.summa.dop_hours < 12 )
            {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_8_14 
              this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
            }
            if( this.summa.dop_hours >= 12 )
            {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_8_14 
              this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog)
            }
            if (this.summa.dop_hours === 0 ) {
              this.summa.summa = this.summa.booking_days * this.summa.car.days_8_14;
              this.summa.summaFull = +this.summa.summa + +this.summa.car.zalog;
            }
        }
        else if(this.summa.booking_days > 14 && this.summa.booking_days <=31)
        {
            if(this.summa.dop_hours > 0 && this.summa.dop_hours < 12 )
            {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_15_30 
              this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
            }
            if( this.summa.dop_hours >= 12 )
            {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_15_30 
              this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog)
            }
            if (this.summa.dop_hours === 0 ) {
              this.summa.summa = this.summa.booking_days * this.summa.car.days_15_30;
              this.summa.summaFull = +this.summa.summa + +this.summa.car.zalog;
            }
        }
        else if(this.summa.booking_days > 31)
        {
            if(this.summa.dop_hours > 0 && this.summa.dop_hours < 12 )
            {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_31_more 
              this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
            }
            if( this.summa.dop_hours >= 12 )
            {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_31_more 
              this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog)
            }
            if (this.summa.dop_hours === 0 ) {
              this.summa.summa = this.summa.booking_days * this.summa.car.days_31_more;
              this.summa.summaFull = +this.summa.summa + +this.summa.car.zalog;
            }
        }
      }
      else if(this.summa.tariff === 'Межгород')
      {
          if(this.summa.dop_hours > 0 && this.summa.dop_hours < 12 )
          {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.mezgorod 
            this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog_mej) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
          }
          if( this.summa.dop_hours >= 12 )
          {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.mezgorod 
            this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog_mej)
          }
          if (this.summa.dop_hours === 0 ) {
            this.summa.summa = this.summa.booking_days * this.summa.car.mezgorod;
            this.summa.summaFull = +this.summa.summa + +this.summa.car.zalog_mej;
          }
      }
      else if(this.summa.tariff === 'Россия')
      {
        if(this.summa.dop_hours > 0 && this.summa.dop_hours < 12 )
          {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.russia 
            this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog_rus) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
          }
          if( this.summa.dop_hours >= 12 )
          {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.russia 
            this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog_rus)
          }
          if (this.summa.dop_hours === 0 ) {
            this.summa.summa = this.summa.booking_days * this.summa.car.russia;
            this.summa.summaFull = +this.summa.summa + +this.summa.car.zalog_rus;
          }
      }
      
    }
  }


  // При выборе конца аренды
  bookingEndDate(e: any)
  {
    // Получаем конец аренды
    this.summa.booking_end = e.target.value

    // Получаем знапчения начала и конца аренды
    const booking_start__x: any = new Date(this.form.value.booking_start);
    const booking_end__x: any = new Date(this.form.value.booking_end);


    // Считаем дополнительные часы
    const dop_hour_days = (booking_end__x - booking_start__x) / (1000 * 60 * 60 * 24);
    
    if(!Number.isInteger(dop_hour_days))
    {
      this.summa.dop_hours = Math.floor(((booking_end__x - booking_start__x)/ (1000 * 60 * 60)) % 24);
    }
    else
    {
     this.summa.dop_hours = 0 
    }
    
    

    // Назначаем переменную для колличества дней аренды
    this.summa.booking_days = (booking_end__x - booking_start__x) / (1000 * 60 * 60 * 24);

    // Если все необходимое заполнено то считаем суммы для тарифов
    if(this.summa.car !== {} && this.summa.tariff !== '' && this.summa.booking_start !== '' && this.summa.booking_end !== '')
    {
      if(this.summa.tariff === 'Город')
      {
        if(this.summa.booking_days < 3)
        {
          if(this.summa.dop_hours > 0 && this.summa.dop_hours < 12 )
          {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_1_2 
            this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
          }
          if( this.summa.dop_hours >= 12 )
          {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_1_2 
            this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog)
          }
          if (this.summa.dop_hours === 0 ) {
            this.summa.summa = this.summa.booking_days * this.summa.car.days_1_2;
            this.summa.summaFull = +this.summa.summa + +this.summa.car.zalog;
          }
          
        }
        else if(this.summa.booking_days >= 3 && this.summa.booking_days <=7)
        {
            if(this.summa.dop_hours > 0 && this.summa.dop_hours < 12 )
            {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_3_7 
              this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
            }
            if( this.summa.dop_hours >= 12 )
            {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_3_7 
              this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog)
            }
            if (this.summa.dop_hours === 0 ) {
              this.summa.summa = this.summa.booking_days * this.summa.car.days_3_7;
              this.summa.summaFull = +this.summa.summa + +this.summa.car.zalog;
            }
        }
        else if(this.summa.booking_days > 7 && this.summa.booking_days <=14)
        {
            if(this.summa.dop_hours > 0 && this.summa.dop_hours < 12 )
            {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_8_14 
              this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
            }
            if( this.summa.dop_hours >= 12 )
            {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_8_14 
              this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog)
            }
            if (this.summa.dop_hours === 0 ) {
              this.summa.summa = this.summa.booking_days * this.summa.car.days_8_14;
              this.summa.summaFull = +this.summa.summa + +this.summa.car.zalog;
            }
        }
        else if(this.summa.booking_days > 14 && this.summa.booking_days <=31)
        {
            if(this.summa.dop_hours > 0 && this.summa.dop_hours < 12 )
            {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_15_30 
              this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
            }
            if( this.summa.dop_hours >= 12 )
            {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_15_30 
              this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog)
            }
            if (this.summa.dop_hours === 0 ) {
              this.summa.summa = this.summa.booking_days * this.summa.car.days_15_30;
              this.summa.summaFull = +this.summa.summa + +this.summa.car.zalog;
            }
        }
        else if(this.summa.booking_days > 31)
        {
            if(this.summa.dop_hours > 0 && this.summa.dop_hours < 12 )
            {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_31_more 
              this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
            }
            if( this.summa.dop_hours >= 12 )
            {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_31_more 
              this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog)
            }
            if (this.summa.dop_hours === 0 ) {
              this.summa.summa = this.summa.booking_days * this.summa.car.days_31_more;
              this.summa.summaFull = +this.summa.summa + +this.summa.car.zalog;
            }
        }
      }
      else if(this.summa.tariff === 'Межгород')
      {
          if(this.summa.dop_hours > 0 && this.summa.dop_hours < 12 )
          {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.mezgorod 
            this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog_mej) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
          }
          if( this.summa.dop_hours >= 12 )
          {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.mezgorod 
            this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog_mej)
          }
          if (this.summa.dop_hours === 0 ) {
            this.summa.summa = this.summa.booking_days * this.summa.car.mezgorod;
            this.summa.summaFull = +this.summa.summa + +this.summa.car.zalog_mej;
          }
      }
      else if(this.summa.tariff === 'Россия')
      {
        if(this.summa.dop_hours > 0 && this.summa.dop_hours < 12 )
          {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.russia 
            this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog_rus) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
          }
          if( this.summa.dop_hours >= 12 )
          {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.russia 
            this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog_rus)
          }
          if (this.summa.dop_hours === 0 ) {
            this.summa.summa = this.summa.booking_days * this.summa.car.russia;
            this.summa.summaFull = +this.summa.summa + +this.summa.car.zalog_rus;
          }
      }
      
    }
  }


  // При ваыборе тарифа
  onChangeTariff(e: any)
  {
    // Получаем тариф
    this.summa.tariff = e
    
    // Если все необходимое заполнено то считаем суммы для тарифов
    if(this.summa.car !== {} && this.summa.tariff !== '' && this.summa.booking_start !== '' && this.summa.booking_end !== '')
    {
      if(this.summa.tariff === 'Город')
      {
        if(this.summa.booking_days < 3)
        {
          if(this.summa.dop_hours > 0 && this.summa.dop_hours < 12 )
          {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_1_2 
            this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
          }
          if( this.summa.dop_hours >= 12 )
          {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_1_2 
            this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog)
          }
          if (this.summa.dop_hours === 0 ) {
            this.summa.summa = this.summa.booking_days * this.summa.car.days_1_2;
            this.summa.summaFull = +this.summa.summa + +this.summa.car.zalog;
          }
          
        }
        else if(this.summa.booking_days >= 3 && this.summa.booking_days <=7)
        {
            if(this.summa.dop_hours > 0 && this.summa.dop_hours < 12 )
            {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_3_7 
              this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
            }
            if( this.summa.dop_hours >= 12 )
            {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_3_7 
              this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog)
            }
            if (this.summa.dop_hours === 0 ) {
              this.summa.summa = this.summa.booking_days * this.summa.car.days_3_7;
              this.summa.summaFull = +this.summa.summa + +this.summa.car.zalog;
            }
        }
        else if(this.summa.booking_days > 7 && this.summa.booking_days <=14)
        {
            if(this.summa.dop_hours > 0 && this.summa.dop_hours < 12 )
            {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_8_14 
              this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
            }
            if( this.summa.dop_hours >= 12 )
            {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_8_14 
              this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog)
            }
            if (this.summa.dop_hours === 0 ) {
              this.summa.summa = this.summa.booking_days * this.summa.car.days_8_14;
              this.summa.summaFull = +this.summa.summa + +this.summa.car.zalog;
            }
        }
        else if(this.summa.booking_days > 14 && this.summa.booking_days <=31)
        {
            if(this.summa.dop_hours > 0 && this.summa.dop_hours < 12 )
            {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_15_30 
              this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
            }
            if( this.summa.dop_hours >= 12 )
            {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_15_30 
              this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog)
            }
            if (this.summa.dop_hours === 0 ) {
              this.summa.summa = this.summa.booking_days * this.summa.car.days_15_30;
              this.summa.summaFull = +this.summa.summa + +this.summa.car.zalog;
            }
        }
        else if(this.summa.booking_days > 31)
        {
            if(this.summa.dop_hours > 0 && this.summa.dop_hours < 12 )
            {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_31_more 
              this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
            }
            if( this.summa.dop_hours >= 12 )
            {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_31_more 
              this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog)
            }
            if (this.summa.dop_hours === 0 ) {
              this.summa.summa = this.summa.booking_days * this.summa.car.days_31_more;
              this.summa.summaFull = +this.summa.summa + +this.summa.car.zalog;
            }
        }
      }
      else if(this.summa.tariff === 'Межгород')
      {
          if(this.summa.dop_hours > 0 && this.summa.dop_hours < 12 )
          {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.mezgorod 
            this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog_mej) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
          }
          if( this.summa.dop_hours >= 12 )
          {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.mezgorod 
            this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog_mej)
          }
          if (this.summa.dop_hours === 0 ) {
            this.summa.summa = this.summa.booking_days * this.summa.car.mezgorod;
            this.summa.summaFull = +this.summa.summa + +this.summa.car.zalog_mej;
          }
      }
      else if(this.summa.tariff === 'Россия')
      {
        if(this.summa.dop_hours > 0 && this.summa.dop_hours < 12 )
          {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.russia 
            this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog_rus) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
          }
          if( this.summa.dop_hours >= 12 )
          {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.russia 
            this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog_rus)
          }
          if (this.summa.dop_hours === 0 ) {
            this.summa.summa = this.summa.booking_days * this.summa.car.russia;
            this.summa.summaFull = +this.summa.summa + +this.summa.car.zalog_rus;
          }
      }
      
    }
  }


  // При выборе типа клиента
  changeTypeClient(e) {
    if (e.target.value === 'fiz') {
      this.lawSearchIsVisible = false;
      this.fizSearchIsVisible = true;
      this.xs_actual_client_type = 'fiz';
    }
    else if (e.target.value === 'law') {
      this.lawSearchIsVisible = true;
      this.fizSearchIsVisible = false;
      this.xs_actual_client_type = 'law';
    }

  }


  // При выборе клиента физ/лица
  changeClient(client) {
    this.form.patchValue({
      search_fiz: client.surname + ' ' + client.name + ' ' + client.lastname
    });
    this.hasQuery = false;
    this.xs_actual_search__client = JSON.stringify(client);
    this.xs_actual_search__client_no_json = client;


    this.getDogovorActive$ = this.documents.getDogovorActive(client._id).subscribe(dogovor => {
      if (Object.keys(dogovor).length > 0) {
        this.xs_dogovor_number__actual = dogovor._id;
        this.isActiveDogovor = 'isActive';

        if (this.form.value.booking_end > dogovor[0].date_end) {
          this.is_dogovor_finish_compare_booking = 'isDogovorFinish';
          console.log('Бронь закончится раньше договора');
        }

      }
      else {
        this.isActiveDogovor = 'no_isActive';
      }

    })
  }



  // При выборе клиента юр/лица
  changeClientLawFase(client) {
    this.form.patchValue({
      search_law: client.name
    });
    this.hasQueryLawFase = false;
    this.xs_actual_search__client___lawfase = JSON.stringify(client)
    this.xs_actual_search__client___lawfase_no_json = client



    this.getDogovorActive$ = this.documents.getDogovorActive(client._id).subscribe(dogovor => {
      if (Object.keys(dogovor).length > 0) {
        this.xs_dogovor_number__actual = dogovor._id;
        this.isActiveDogovor = 'isActive';

        if (this.form.value.booking_end > dogovor[0].date_end) {
          this.is_dogovor_finish_compare_booking = 'isDogovorFinish';
          console.log('Бронь закончится раньше договора');
        }

      }
      else {
        this.isActiveDogovor = 'no_isActive';
      }

    })
  }


  // Получаем данные для поиска физического лица
  searchData(e: any) {
    // Отчищаем запрос
    let query: string = e.target.value.trim()
    let xs_query = {
      query: query,
      type: 'fiz'
    }

    // Если запрос ничего не содержит или содержит только пробелы
    let matchSpaces = query.match(/\s*/);
    if (matchSpaces[0] === query) {
      this.searchResult = [];
      this.hasQuery = false;
      return;
    }


    this.searchResultClient$ = this.bookings.searchWidget(xs_query).subscribe(res => {
      this.searchResult = res;
      this.hasQuery = true;
    })
  }


  // Получаем данные для поиска физического лица
  searchDataLawFase(e: any) {
    // Отчищаем запрос
    let query: string = e.target.value.trim()
    let xs_query = {
      query: query,
      type: 'law'
    }

    // Если запрос ничего не содержит или содержит только пробелы
    let matchSpaces = query.match(/\s*/);
    if (matchSpaces[0] === query) {
      this.searchResultLawFase = [];
      this.hasQueryLawFase = false;
      return;
    }


    this.searchResultClient$ = this.bookings.searchWidget(xs_query).subscribe(res => {
      this.searchResultLawFase = res;
      this.hasQueryLawFase = true;
    })
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

    if (this.xs_actual_client_type === 'fiz')
    {
      if (this.form.value.tariff === 'Город') {
        const booking = {
          car: JSON.parse(this.form.value.car),
          client: JSON.parse(this.xs_actual_search__client),
          place_start: this.form.value.place_start,
          place_end: this.form.value.place_end,
          tariff: this.form.value.tariff,
          comment: this.form.value.comment,
          booking_start: this.form.value.booking_start,
          booking_end: this.form.value.booking_end,
          booking_days: this.booking_days_fin,
          summaFull: this.summa.summaFull,
          summa: this.summa.summa,
          dop_hours: this.summa.dop_hours,
          dop_info_open: {
            clear_auto: this.form.value.clear_auto,
            full_tank: this.form.value.full_tank
          },
          booking_zalog: this.summa.car.zalog
        };

        this.subUpdateBooking$ = this.bookings.update(this.bookingId, booking).subscribe((booking) => {
          MaterialService.toast('Бронь обновлена');
        });
      }


      if (this.form.value.tariff === 'Межгород') {
        const booking = {
          car: JSON.parse(this.form.value.car),
          client: JSON.parse(this.xs_actual_search__client),
          place_start: this.form.value.place_start,
          place_end: this.form.value.place_end,
          tariff: this.form.value.tariff,
          comment: this.form.value.comment,
          booking_start: this.form.value.booking_start,
          booking_end: this.form.value.booking_end,
          booking_days: this.booking_days_fin,
          summaFull: this.summa.summaFull,
          summa: this.summa.summa,
          dop_hours: this.summa.dop_hours,
          dop_info_open: {
            clear_auto: this.form.value.clear_auto,
            full_tank: this.form.value.full_tank
          },
          booking_zalog: this.summa.car.zalog_mej
        };

        this.subUpdateBooking$ = this.bookings.update(this.bookingId, booking).subscribe((booking) => {
          MaterialService.toast('Бронь обновлена');
        });
      }


      if (this.form.value.tariff === 'Россия') {
        const booking = {
          car: JSON.parse(this.form.value.car),
          client: JSON.parse(this.xs_actual_search__client),
          place_start: this.form.value.place_start,
          place_end: this.form.value.place_end,
          tariff: this.form.value.tariff,
          comment: this.form.value.comment,
          booking_start: this.form.value.booking_start,
          booking_end: this.form.value.booking_end,
          booking_days: this.booking_days_fin,
          summaFull: this.summa.summaFull,
          summa: this.summa.summa,
          dop_hours: this.summa.dop_hours,
          dop_info_open: {
            clear_auto: this.form.value.clear_auto,
            full_tank: this.form.value.full_tank
          },
          booking_zalog: this.summa.car.zalog_rus
        };

        this.subUpdateBooking$ = this.bookings.update(this.bookingId, booking).subscribe((booking) => {
          MaterialService.toast('Бронь обновлена');
        });
      }
    } else if (this.xs_actual_client_type === 'law')
    {
      if (this.form.value.tariff === 'Город') {
        const booking = {
          car: JSON.parse(this.form.value.car),
          client: JSON.parse(this.xs_actual_search__client___lawfase),
          place_start: this.form.value.place_start,
          place_end: this.form.value.place_end,
          tariff: this.form.value.tariff,
          comment: this.form.value.comment,
          booking_start: this.form.value.booking_start,
          booking_end: this.form.value.booking_end,
          booking_days: this.booking_days_fin,
          summaFull: this.summa.summaFull,
          summa: this.summa.summa,
          dop_hours: this.summa.dop_hours,
          dop_info_open: {
            clear_auto: this.form.value.clear_auto,
            full_tank: this.form.value.full_tank
          },
          booking_zalog: this.summa.car.zalog
        };

        this.subUpdateBooking$ = this.bookings.update(this.bookingId, booking).subscribe((booking) => {
          MaterialService.toast('Бронь обновлена');
        });
      }


      if (this.form.value.tariff === 'Межгород') {
        const booking = {
          car: JSON.parse(this.form.value.car),
          client: JSON.parse(this.xs_actual_search__client___lawfase),
          place_start: this.form.value.place_start,
          place_end: this.form.value.place_end,
          tariff: this.form.value.tariff,
          comment: this.form.value.comment,
          booking_start: this.form.value.booking_start,
          booking_end: this.form.value.booking_end,
          booking_days: this.booking_days_fin,
          summaFull: this.summa.summaFull,
          summa: this.summa.summa,
          dop_hours: this.summa.dop_hours,
          dop_info_open: {
            clear_auto: this.form.value.clear_auto,
            full_tank: this.form.value.full_tank
          },
          booking_zalog: this.summa.car.zalog_mej
        };

        this.subUpdateBooking$ = this.bookings.update(this.bookingId, booking).subscribe((booking) => {
          MaterialService.toast('Бронь обновлена');
        });
      }


      if (this.form.value.tariff === 'Россия') {
        const booking = {
          car: JSON.parse(this.form.value.car),
          client: JSON.parse(this.xs_actual_search__client___lawfase),
          place_start: this.form.value.place_start,
          place_end: this.form.value.place_end,
          tariff: this.form.value.tariff,
          comment: this.form.value.comment,
          booking_start: this.form.value.booking_start,
          booking_end: this.form.value.booking_end,
          booking_days: this.booking_days_fin,
          summaFull: this.summa.summaFull,
          summa: this.summa.summa,
          dop_hours: this.summa.dop_hours,
          dop_info_open: {
            clear_auto: this.form.value.clear_auto,
            full_tank: this.form.value.full_tank
          },
          booking_zalog: this.summa.car.zalog_rus
        };

        this.subUpdateBooking$ = this.bookings.update(this.bookingId, booking).subscribe((booking) => {
          MaterialService.toast('Бронь обновлена');
        });
      }
    }
    
    
  }
}
