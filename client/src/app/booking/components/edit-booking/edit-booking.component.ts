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
import { Booking, MaterialInstance, Settings, Summa, User } from 'src/app/shared/types/interfaces';
import { BookingsService } from '../../services/bookings.service';
import { AccountService } from '../../../account/services/account.service';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { DocumentsService } from 'src/app/documents/services/documents.service';
import { AuthService } from 'src/app/auth/services/auth.service';

@Component({
  selector: 'app-edit-booking',
  templateUrl: './edit-booking.component.html',
  styleUrls: ['./edit-booking.component.css'],
})
export class EditBookingComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('tabs') tabs!: ElementRef;

  // Храним объект суммы
  summa: Summa = {
    car: {},
    tariff: '',
    booking_start: '',
    booking_end: '',
    summa: '',
    booking_days: '',
    summaFull: '',
    dop_hours: '',
    place_start_price: 0,
    additional_services_price: 0
  }

  // Нажат ли произвольный залог
  isCustomeZalog: boolean = false;

  // Закончился ли ввод в поле нового залога
  isCustomeZalogCheck: boolean = false;


  isCustomePlaceStart: boolean = false;

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

  // Минимальная дата аренды
  minDateBooking: string = '';



  // Получаем настройки текущего пользователя
  currentUserSetings$: Subscription = null;
  currentUserSetings!: Settings

  // Получаем текущего юзера
  currentUser$: Subscription = null;
  currentUser!: User


  // Текущая бронь
  isActualBooking: Booking;



  // Храним референцию модального окна
  @ViewChild('modal') modalRef: ElementRef
  @ViewChild('modal2') modal2Ref: ElementRef
  @ViewChild('modal3') modal3Ref: ElementRef


  // Храним модальное окно
  modal: MaterialInstance
  modal2: MaterialInstance
  modal3: MaterialInstance
  

  constructor(
    private bookings: BookingsService,
    private router: Router,
    private cars: CarsService,
    private clients: ClientsService,
    private rote: ActivatedRoute,
    private documents: DocumentsService,
    private auth: AuthService,
    private AccountService: AccountService,
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.getParams();
    this.getByIdBookong();
    this.setMinDate();
    this.xscars$ = this.cars.fetch();
    this.xsclients$ = this.clients.fetch();
    MaterialService.updateTextInputs();
    this.get_user();
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
    if (this.currentUserSetings$)
    {
      this.currentUserSetings$.unsubscribe();
    }
    if (this.currentUser$)
    {
      this.currentUser$.unsubscribe();
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

  ngAfterViewInit(): void {
    MaterialService.initTabs(this.tabs.nativeElement);
    MaterialService.updateTextInputs();
    this.modal = MaterialService.initModalPos(this.modalRef)
    this.modal2 = MaterialService.initModalPos(this.modal2Ref)
    this.modal3 = MaterialService.initModalPos(this.modal3Ref)
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
      // clear_auto: new FormControl(''),
      // full_tank: new FormControl(''),
      isCustomeZalogControl: new FormControl(''),
      isCustomePlaceStartControl: new FormControl(''),
      isCustomePlaceStartControlPrice: new FormControl(''),
      search_fiz: new FormControl(''),
      search_law: new FormControl(''),
      additional_services_chair: new FormControl(''),
      additional_services_buster: new FormControl(''),
      additional_services_videoregister: new FormControl(''),
      additional_services_battery_charger: new FormControl(''),
      additional_services_antiradar: new FormControl(''),
      additional_services_moyka: new FormControl(''),
      isCustomePlaceStartControlclick: new FormControl(''),
      isCustomeZalogControlclick: new FormControl(''),
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

      this.isActualBooking = res;
      
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
        isCustomePlaceStartControl: res.place_start,
        isCustomePlaceStartControlPrice: res.dop_info_open.place_start_price,
        isCustomeZalogControl: res.booking_zalog,
        isCustomePlaceStartControlclick: res.dop_info_open.isCustomePlaceStart,
        isCustomeZalogControlclick: res.dop_info_open.isCustomeZalog,
        additional_services_chair: res.dop_info_open.additional_services_chair,
        additional_services_buster: res.dop_info_open.additional_services_buster,
        additional_services_videoregister: res.dop_info_open.additional_services_videoregister,
        additional_services_battery_charger: res.dop_info_open.additional_services_battery_charger,
        additional_services_antiradar: res.dop_info_open.additional_services_antiradar,
        additional_services_moyka: res.dop_info_open.additional_services_moyka,
      });

      this.isCustomePlaceStart = res.dop_info_open.isCustomePlaceStart
      this.isCustomeZalog = res.dop_info_open.isCustomeZalog
      
      this.summa.additional_services_price = res.dop_info_open.additional_services_price
      this.summa.place_start_price = res.dop_info_open.place_start_price,
      this.isCustomeZalogCheck = res.dop_info_open.isCustomeZalog


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
        }

      }
      else {
        this.isActiveDogovor = 'no_isActive';
        if (this.xs_actual_client_type === 'fiz') {
          this.modal2.open();
        }
      }

    })
  }



  // При выборе места подачи авто
  onChangePlaceStart(e) {

    if (this.currentUserSetings)
    {
      if (e === 'Аэропорт') {
        this.summa.place_start_price = +this.currentUserSetings.share_avto.airport_price
      }
      else if (e === 'Ж/д вокзал') {
        this.summa.place_start_price = +this.currentUserSetings.share_avto.railway_price

      }
      else if (e === 'ТЦ Кристалл') {
        this.summa.place_start_price = +this.currentUserSetings.share_avto.kristal_tc_price

      }
      else if (e === 'Тц Сити Молл') {
        this.summa.place_start_price = +this.currentUserSetings.share_avto.sitymol_tc_price

      }
      else if (e === 'Офис') {
        this.summa.place_start_price = 0
      }
    }
    else{
      this.summa.place_start_price = 0
    }
  }


  // При выборе доп услуги
  onChangeAdditionalServicesInput(e)
  {
    if (this.form.value.additional_services_moyka)
    {
      if(this.summa.car.category === 'Комфорт')
      {
        let additional_services_summ = {
          additional_services_chair: this.form.value.additional_services_chair ? +this.currentUserSetings.additionally_avto.det_kreslo : 0,
          additional_services_buster: this.form.value.additional_services_buster ? +this.currentUserSetings.additionally_avto.buster : 0,
          additional_services_videoregister: this.form.value.additional_services_videoregister ? +this.currentUserSetings.additionally_avto.videoregister : 0,
          additional_services_battery_charger: this.form.value.additional_services_battery_charger ? +this.currentUserSetings.additionally_avto.battery_charger : 0,
          additional_services_antiradar: this.form.value.additional_services_antiradar ? +this.currentUserSetings.additionally_avto.antiradar : 0,
          additional_services_moyka: this.form.value.additional_services_moyka ? +this.currentUserSetings.washing_avto.komfort : 0,
        }

        let summ = Object.keys(additional_services_summ).reduce((sum, key) => sum + parseFloat(additional_services_summ[key] || 0), 0)

        this.summa.additional_services_price = summ;
        
      }
      else if (this.summa.car.category === 'Бизнес')
      {
        let additional_services_summ = {
          additional_services_chair: this.form.value.additional_services_chair ? +this.currentUserSetings.additionally_avto.det_kreslo : 0,
          additional_services_buster: this.form.value.additional_services_buster ? +this.currentUserSetings.additionally_avto.buster : 0,
          additional_services_videoregister: this.form.value.additional_services_videoregister ? +this.currentUserSetings.additionally_avto.videoregister : 0,
          additional_services_battery_charger: this.form.value.additional_services_battery_charger ? +this.currentUserSetings.additionally_avto.battery_charger : 0,
          additional_services_antiradar: this.form.value.additional_services_antiradar ? +this.currentUserSetings.additionally_avto.antiradar : 0,
          additional_services_moyka: this.form.value.additional_services_moyka ? +this.currentUserSetings.washing_avto.business : 0,
        }

        let summ = Object.keys(additional_services_summ).reduce((sum, key) => sum + parseFloat(additional_services_summ[key] || 0), 0)

        this.summa.additional_services_price = summ;
      }
      else if (this.summa.car.category === 'Премиум')
      {
        let additional_services_summ = {
          additional_services_chair: this.form.value.additional_services_chair ? +this.currentUserSetings.additionally_avto.det_kreslo : 0,
          additional_services_buster: this.form.value.additional_services_buster ? +this.currentUserSetings.additionally_avto.buster : 0,
          additional_services_videoregister: this.form.value.additional_services_videoregister ? +this.currentUserSetings.additionally_avto.videoregister : 0,
          additional_services_battery_charger: this.form.value.additional_services_battery_charger ? +this.currentUserSetings.additionally_avto.battery_charger : 0,
          additional_services_antiradar: this.form.value.additional_services_antiradar ? +this.currentUserSetings.additionally_avto.antiradar : 0,
          additional_services_moyka: this.form.value.additional_services_moyka ? +this.currentUserSetings.washing_avto.premium : 0,
        }

        let summ = Object.keys(additional_services_summ).reduce((sum, key) => sum + parseFloat(additional_services_summ[key] || 0), 0)

        this.summa.additional_services_price = summ;
      }
      
    }else{
      let additional_services_summ = {
        additional_services_chair: this.form.value.additional_services_chair ? +this.currentUserSetings.additionally_avto.det_kreslo : 0,
        additional_services_buster: this.form.value.additional_services_buster ? +this.currentUserSetings.additionally_avto.buster : 0,
        additional_services_videoregister: this.form.value.additional_services_videoregister ? +this.currentUserSetings.additionally_avto.videoregister : 0,
        additional_services_battery_charger: this.form.value.additional_services_battery_charger ? +this.currentUserSetings.additionally_avto.battery_charger : 0,
        additional_services_antiradar: this.form.value.additional_services_antiradar ? +this.currentUserSetings.additionally_avto.antiradar : 0,
        additional_services_moyka: this.form.value.additional_services_moyka ? 1000 : 0,
      }

      let summ = Object.keys(additional_services_summ).reduce((sum, key) => sum + parseFloat(additional_services_summ[key] || 0), 0)

      this.summa.additional_services_price = summ;
    }
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
        }

      }
      else {
        this.isActiveDogovor = 'no_isActive';
        if (this.xs_actual_client_type === 'law') {
          this.modal3.open();
        }
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


  // Проверяем нажат ли чекбокс для кастомного залога
  xs_isCustomeZalogCheck() {
    this.isCustomeZalog = !this.isCustomeZalog;

    this.form.patchValue({
      isCustomeZalogControl: 0,
    });


    // Перенес без тестов.Протестить
    if (!this.isCustomeZalog) {
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

  }


  // При выборе произвольного залога
  onCustomeZalogValue(e)
  {

    
    let xs_custome__zalog = e.target.value

    if (this.summa.car !== {} && this.summa.tariff !== '' && this.summa.booking_start !== '' && this.summa.booking_end !== '') {
      if (this.summa.tariff === 'Город') {
        if (this.summa.booking_days < 3) {
          if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_1_2
            this.summa.summaFull = +this.summa.summa + (+xs_custome__zalog) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
          }
          if (this.summa.dop_hours >= 12) {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_1_2
            this.summa.summaFull = +this.summa.summa + (+xs_custome__zalog)
          }
          if (this.summa.dop_hours === 0) {
            this.summa.summa = this.summa.booking_days * this.summa.car.days_1_2;
            this.summa.summaFull = +this.summa.summa + +xs_custome__zalog;
          }

        }
        else if (this.summa.booking_days >= 3 && this.summa.booking_days <= 7) {
          if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_3_7
            this.summa.summaFull = +this.summa.summa + (+xs_custome__zalog) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
          }
          if (this.summa.dop_hours >= 12) {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_3_7
            this.summa.summaFull = +this.summa.summa + (+xs_custome__zalog)
          }
          if (this.summa.dop_hours === 0) {
            this.summa.summa = this.summa.booking_days * this.summa.car.days_3_7;
            this.summa.summaFull = +this.summa.summa + +xs_custome__zalog;
          }
        }
        else if (this.summa.booking_days > 7 && this.summa.booking_days <= 14) {
          if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_8_14
            this.summa.summaFull = +this.summa.summa + (+xs_custome__zalog) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
          }
          if (this.summa.dop_hours >= 12) {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_8_14
            this.summa.summaFull = +this.summa.summa + (+xs_custome__zalog)
          }
          if (this.summa.dop_hours === 0) {
            this.summa.summa = this.summa.booking_days * this.summa.car.days_8_14;
            this.summa.summaFull = +this.summa.summa + +xs_custome__zalog;
          }
        }
        else if (this.summa.booking_days > 14 && this.summa.booking_days <= 31) {
          if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_15_30
            this.summa.summaFull = +this.summa.summa + (+xs_custome__zalog) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
          }
          if (this.summa.dop_hours >= 12) {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_15_30
            this.summa.summaFull = +this.summa.summa + (+xs_custome__zalog)
          }
          if (this.summa.dop_hours === 0) {
            this.summa.summa = this.summa.booking_days * this.summa.car.days_15_30;
            this.summa.summaFull = +this.summa.summa + +xs_custome__zalog;
          }
        }
        else if (this.summa.booking_days > 31) {
          if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_31_more
            this.summa.summaFull = +this.summa.summa + (+xs_custome__zalog) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
          }
          if (this.summa.dop_hours >= 12) {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_31_more
            this.summa.summaFull = +this.summa.summa + (+xs_custome__zalog)
          }
          if (this.summa.dop_hours === 0) {
            this.summa.summa = this.summa.booking_days * this.summa.car.days_31_more;
            this.summa.summaFull = +this.summa.summa + +xs_custome__zalog;
          }
        }
      }
      else if (this.summa.tariff === 'Межгород') {
        if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
          this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.mezgorod
          this.summa.summaFull = +this.summa.summa + (+xs_custome__zalog) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
        }
        if (this.summa.dop_hours >= 12) {
          this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.mezgorod
          this.summa.summaFull = +this.summa.summa + (+xs_custome__zalog)
        }
        if (this.summa.dop_hours === 0) {
          this.summa.summa = this.summa.booking_days * this.summa.car.mezgorod;
          this.summa.summaFull = +this.summa.summa + +xs_custome__zalog;
        }
      }
      else if (this.summa.tariff === 'Россия') {
        if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
          this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.russia
          this.summa.summaFull = +this.summa.summa + (+xs_custome__zalog) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
        }
        if (this.summa.dop_hours >= 12) {
          this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.russia
          this.summa.summaFull = +this.summa.summa + (+xs_custome__zalog)
        }
        if (this.summa.dop_hours === 0) {
          this.summa.summa = this.summa.booking_days * this.summa.car.russia;
          this.summa.summaFull = +this.summa.summa + +xs_custome__zalog;
        }
      }

    }
    
  }


  // Проверяем нажат ли чекбокс для кастомного места подачи
  xs_isCustomePlaceStartCheck() {
    this.isCustomePlaceStart = !this.isCustomePlaceStart;

    this.form.patchValue({
      place_start: null,
      isCustomePlaceStartControl: '',
      isCustomePlaceStartControlPrice: 0
    });

  }



  onBlurMethod(e)
  {
    this.isCustomeZalogCheck = !this.isCustomeZalogCheck;
  }



  // Привыборе произольной суммы подачи авто
  onChangeisCustomePlaceStartControlPrice(e)
  {
    if (this.isCustomePlaceStart)
    {
      this.summa.place_start_price = +this.form.value.isCustomePlaceStartControlPrice || 0
      
      this.form.patchValue({
        place_start: this.form.value.isCustomePlaceStartControl,
      });
    }
    
  }



  onSubmit() {
    // Получаем знапчения начала и конца аренды
    const booking_start__x: any = new Date(this.form.value.booking_start);
    const booking_end__x: any = new Date(this.form.value.booking_end);

    if (this.xs_actual_client_type === 'fiz')
    {
      if (!this.isCustomeZalog) {
        if (this.form.value.tariff === 'Город') {
            let moyka = '0';
            if (this.summa.car.category === 'Бизнес') {
              moyka = this.currentUserSetings.washing_avto.business
            }
            else if (this.summa.car.category === 'Комфорт') {
              moyka = this.currentUserSetings.washing_avto.komfort
            }
            else if (this.summa.car.category === 'Премиум') {
              moyka = this.currentUserSetings.washing_avto.premium
            }

          const booking = {
            car: JSON.parse(this.form.value.car),
            client: JSON.parse(this.xs_actual_search__client),
            place_start: this.form.value.place_start,
            place_end: this.form.value.place_end,
            tariff: this.form.value.tariff,
            comment: this.form.value.comment,
            booking_start: this.form.value.booking_start,
            booking_end: this.form.value.booking_end,
            booking_days: (booking_end__x - booking_start__x) / (1000 * 60 * 60 * 24),
            summaFull: Math.round((+this.summa.summa + (+this.summa.place_start_price)) +
                (+this.summa.additional_services_price) + (+this.summa.car.zalog) + (this.summa.car.price_dop_hour * this.summa.dop_hours)),
            summa: Math.round(this.summa.summa),
            dop_hours: this.summa.dop_hours,
            dop_info_open: {
              // clear_auto: this.form.value.clear_auto || false,
              // full_tank: this.form.value.full_tank || false,
              moyka: moyka || false,
              place_start_price: this.summa.place_start_price || 0,
              additional_services_price: this.summa.additional_services_price,
              additional_services_chair: this.form.value.additional_services_chair || false,
              additional_services_buster: this.form.value.additional_services_buster || false,
              additional_services_videoregister: this.form.value.additional_services_videoregister || false,
              additional_services_battery_charger: this.form.value.additional_services_battery_charger || false,
              additional_services_antiradar: this.form.value.additional_services_antiradar || false,
              additional_services_moyka: this.form.value.additional_services_moyka || false,
              isCustomePlaceStart: this.form.value.isCustomePlaceStartControlclick,
              isCustomeZalog: this.form.value.isCustomeZalogControlclick
            },
            booking_zalog: this.summa.car.zalog,
            dogovor_number__actual: this.xs_dogovor_number__actual,
          };

          

          // Отправляем запрос
          this.subUpdateBooking$ = this.bookings.update(this.bookingId, booking).subscribe((booking) => {
            MaterialService.toast('Бронь обновлена');
          });
        }
        if (this.form.value.tariff === 'Межгород') {
          let moyka = '0';
          if (this.summa.car.category === 'Бизнес') {
            moyka = this.currentUserSetings.washing_avto.business
          }
          else if (this.summa.car.category === 'Комфорт') {
            moyka = this.currentUserSetings.washing_avto.komfort
          }
          else if (this.summa.car.category === 'Премиум') {
            moyka = this.currentUserSetings.washing_avto.premium
          }

          const booking = {
            car: JSON.parse(this.form.value.car),
            client: JSON.parse(this.xs_actual_search__client),
            place_start: this.form.value.place_start,
            place_end: this.form.value.place_end,
            tariff: this.form.value.tariff,
            comment: this.form.value.comment,
            booking_start: this.form.value.booking_start,
            booking_end: this.form.value.booking_end,
            booking_days: (booking_end__x - booking_start__x) / (1000 * 60 * 60 * 24),
            summaFull: Math.round((+this.summa.summa + (+this.summa.place_start_price)) +
              (+this.summa.additional_services_price) + (+this.summa.car.zalog_mej) + (this.summa.car.price_dop_hour *
                this.summa.dop_hours)),
            summa: Math.round(this.summa.summa),
            dop_hours: this.summa.dop_hours,
            dop_info_open: {
              // clear_auto: this.form.value.clear_auto || false,
              // full_tank: this.form.value.full_tank || false,
              moyka: moyka || false,
              place_start_price: this.summa.place_start_price || 0,
              additional_services_price: this.summa.additional_services_price,
              additional_services_chair: this.form.value.additional_services_chair || false,
              additional_services_buster: this.form.value.additional_services_buster || false,
              additional_services_videoregister: this.form.value.additional_services_videoregister || false,
              additional_services_battery_charger: this.form.value.additional_services_battery_charger || false,
              additional_services_antiradar: this.form.value.additional_services_antiradar || false,
              additional_services_moyka: this.form.value.additional_services_moyka || false,
              isCustomePlaceStart: this.form.value.isCustomePlaceStartControlclick,
              isCustomeZalog: this.form.value.isCustomeZalogControlclick
            },
            booking_zalog: this.summa.car.zalog_mej,
            dogovor_number__actual: this.xs_dogovor_number__actual,
          };


          // Отправляем запрос
          this.subUpdateBooking$ = this.bookings.update(this.bookingId, booking).subscribe((booking) => {
            MaterialService.toast('Бронь обновлена');
          });
        }
        if (this.form.value.tariff === 'Россия') {
          let moyka = '0';
          if (this.summa.car.category === 'Бизнес') {
            moyka = this.currentUserSetings.washing_avto.business
          }
          else if (this.summa.car.category === 'Комфорт') {
            moyka = this.currentUserSetings.washing_avto.komfort
          }
          else if (this.summa.car.category === 'Премиум') {
            moyka = this.currentUserSetings.washing_avto.premium
          }

          const booking = {
            car: JSON.parse(this.form.value.car),
            client: JSON.parse(this.xs_actual_search__client),
            place_start: this.form.value.place_start,
            place_end: this.form.value.place_end,
            tariff: this.form.value.tariff,
            comment: this.form.value.comment,
            booking_start: this.form.value.booking_start,
            booking_end: this.form.value.booking_end,
            booking_days: (booking_end__x - booking_start__x) / (1000 * 60 * 60 * 24),
            summaFull: Math.round((+this.summa.summa + (+this.summa.place_start_price)) +
              (+this.summa.additional_services_price) + (+this.summa.car.zalog_rus) + (this.summa.car.price_dop_hour *
                this.summa.dop_hours)),
            summa: Math.round(this.summa.summa),
            dop_hours: this.summa.dop_hours,
            dop_info_open: {
              clear_auto: this.form.value.clear_auto || false,
              // full_tank: this.form.value.full_tank || false,
              // moyka: moyka || false,
              place_start_price: this.summa.place_start_price || 0,
              additional_services_price: this.summa.additional_services_price,
              additional_services_chair: this.form.value.additional_services_chair || false,
              additional_services_buster: this.form.value.additional_services_buster || false,
              additional_services_videoregister: this.form.value.additional_services_videoregister || false,
              additional_services_battery_charger: this.form.value.additional_services_battery_charger || false,
              additional_services_antiradar: this.form.value.additional_services_antiradar || false,
              additional_services_moyka: this.form.value.additional_services_moyka || false,
              isCustomePlaceStart: this.form.value.isCustomePlaceStartControlclick,
              isCustomeZalog: this.form.value.isCustomeZalogControlclick
            },
            booking_zalog: this.summa.car.zalog_rus,
            dogovor_number__actual: this.xs_dogovor_number__actual,
          };

          // Отправляем запрос
          this.subUpdateBooking$ = this.bookings.update(this.bookingId, booking).subscribe((booking) => {
            MaterialService.toast('Бронь обновлена');
          });

        }
      }
      else {
        let moyka = '0';
        if (this.summa.car.category === 'Бизнес') {
          moyka = this.currentUserSetings.washing_avto.business
        }
        else if (this.summa.car.category === 'Комфорт') {
          moyka = this.currentUserSetings.washing_avto.komfort
        }
        else if (this.summa.car.category === 'Премиум') {
          moyka = this.currentUserSetings.washing_avto.premium
        }

        const booking = {
          car: JSON.parse(this.form.value.car),
          client: JSON.parse(this.xs_actual_search__client),
          place_start: this.form.value.place_start,
          place_end: this.form.value.place_end,
          tariff: this.form.value.tariff,
          comment: this.form.value.comment,
          booking_start: this.form.value.booking_start,
          booking_end: this.form.value.booking_end,
          booking_days: (booking_end__x - booking_start__x) / (1000 * 60 * 60 * 24),
          summaFull: Math.round((+this.summa.summa + (+this.summa.place_start_price)) +
            (+this.summa.additional_services_price) + (+this.form.value.isCustomeZalogControl) + (this.summa.car.price_dop_hour * this.summa.dop_hours)),
          summa: Math.round(this.summa.summa),
          dop_hours: this.summa.dop_hours,
          dop_info_open: {
            // clear_auto: this.form.value.clear_auto || false,
            // full_tank: this.form.value.full_tank || false,
            moyka: moyka || false,
            place_start_price: this.summa.place_start_price || 0,
            additional_services_price: this.summa.additional_services_price,
            additional_services_chair: this.form.value.additional_services_chair || false,
            additional_services_buster: this.form.value.additional_services_buster || false,
            additional_services_videoregister: this.form.value.additional_services_videoregister || false,
            additional_services_battery_charger: this.form.value.additional_services_battery_charger || false,
            additional_services_antiradar: this.form.value.additional_services_antiradar || false,
            additional_services_moyka: this.form.value.additional_services_moyka || false,
            isCustomePlaceStart: this.form.value.isCustomePlaceStartControlclick,
            isCustomeZalog: this.form.value.isCustomeZalogControlclick
          },
          booking_zalog: this.form.value.isCustomeZalogControl,
          dogovor_number__actual: this.xs_dogovor_number__actual,

        };



        // Отправляем запрос
        this.subUpdateBooking$ = this.bookings.update(this.bookingId, booking).subscribe((booking) => {
          MaterialService.toast('Бронь обновлена');
        });
      }
    }
    else if (this.xs_actual_client_type === 'law')
    { 
      if (!this.isCustomeZalog) {
        if (this.form.value.tariff === 'Город') {
          let moyka = '0';
          if (this.summa.car.category === 'Бизнес') {
            moyka = this.currentUserSetings.washing_avto.business
          }
          else if (this.summa.car.category === 'Комфорт') {
            moyka = this.currentUserSetings.washing_avto.komfort
          }
          else if (this.summa.car.category === 'Премиум') {
            moyka = this.currentUserSetings.washing_avto.premium
          }

          const booking = {
            car: JSON.parse(this.form.value.car),
            client: JSON.parse(this.xs_actual_search__client___lawfase),
            place_start: this.form.value.place_start,
            place_end: this.form.value.place_end,
            tariff: this.form.value.tariff,
            comment: this.form.value.comment,
            booking_start: this.form.value.booking_start,
            booking_end: this.form.value.booking_end,
            booking_days: (booking_end__x - booking_start__x) / (1000 * 60 * 60 * 24),
            summaFull: Math.round((+this.summa.summa + (+this.summa.place_start_price)) +
              (+this.summa.additional_services_price) + (+this.summa.car.zalog) + (this.summa.car.price_dop_hour * this.summa.dop_hours)),
            summa: Math.round(this.summa.summa),
            dop_hours: this.summa.dop_hours,
            dop_info_open: {
              // clear_auto: this.form.value.clear_auto || false,
              // full_tank: this.form.value.full_tank || false,
              moyka: moyka || false,
              place_start_price: this.summa.place_start_price || 0,
              additional_services_price: this.summa.additional_services_price,
              additional_services_chair: this.form.value.additional_services_chair || false,
              additional_services_buster: this.form.value.additional_services_buster || false,
              additional_services_videoregister: this.form.value.additional_services_videoregister || false,
              additional_services_battery_charger: this.form.value.additional_services_battery_charger || false,
              additional_services_antiradar: this.form.value.additional_services_antiradar || false,
              additional_services_moyka: this.form.value.additional_services_moyka || false,
              isCustomePlaceStart: this.form.value.isCustomePlaceStartControlclick,
              isCustomeZalog: this.form.value.isCustomeZalogControlclick
            },
            booking_zalog: this.summa.car.zalog,
          };



          // Отправляем запрос
          this.subUpdateBooking$ = this.bookings.update(this.bookingId, booking).subscribe((booking) => {
            MaterialService.toast('Бронь обновлена');
          });
        }
        if (this.form.value.tariff === 'Межгород') {
          let moyka = '0';
          if (this.summa.car.category === 'Бизнес') {
            moyka = this.currentUserSetings.washing_avto.business
          }
          else if (this.summa.car.category === 'Комфорт') {
            moyka = this.currentUserSetings.washing_avto.komfort
          }
          else if (this.summa.car.category === 'Премиум') {
            moyka = this.currentUserSetings.washing_avto.premium
          }

          const booking = {
            car: JSON.parse(this.form.value.car),
            client: JSON.parse(this.xs_actual_search__client___lawfase),
            place_start: this.form.value.place_start,
            place_end: this.form.value.place_end,
            tariff: this.form.value.tariff,
            comment: this.form.value.comment,
            booking_start: this.form.value.booking_start,
            booking_end: this.form.value.booking_end,
            booking_days: (booking_end__x - booking_start__x) / (1000 * 60 * 60 * 24),
            summaFull: Math.round((+this.summa.summa + (+this.summa.place_start_price)) +
              (+this.summa.additional_services_price) + (+this.summa.car.zalog_mej) + (this.summa.car.price_dop_hour *
                this.summa.dop_hours)),
            summa: Math.round(this.summa.summa),
            dop_hours: this.summa.dop_hours,
            dop_info_open: {
              // clear_auto: this.form.value.clear_auto || false,
              // full_tank: this.form.value.full_tank || false,
              moyka: moyka || false,
              place_start_price: this.summa.place_start_price || 0,
              additional_services_price: this.summa.additional_services_price,
              additional_services_chair: this.form.value.additional_services_chair || false,
              additional_services_buster: this.form.value.additional_services_buster || false,
              additional_services_videoregister: this.form.value.additional_services_videoregister || false,
              additional_services_battery_charger: this.form.value.additional_services_battery_charger || false,
              additional_services_antiradar: this.form.value.additional_services_antiradar || false,
              additional_services_moyka: this.form.value.additional_services_moyka || false,
              isCustomePlaceStart: this.form.value.isCustomePlaceStartControlclick,
              isCustomeZalog: this.form.value.isCustomeZalogControlclick
            },
            booking_zalog: this.summa.car.zalog_mej,
          };


          // Отправляем запрос
          this.subUpdateBooking$ = this.bookings.update(this.bookingId, booking).subscribe((booking) => {
            MaterialService.toast('Бронь обновлена');
          });
        }
        if (this.form.value.tariff === 'Россия') {
          let moyka = '0';
          if (this.summa.car.category === 'Бизнес') {
            moyka = this.currentUserSetings.washing_avto.business
          }
          else if (this.summa.car.category === 'Комфорт') {
            moyka = this.currentUserSetings.washing_avto.komfort
          }
          else if (this.summa.car.category === 'Премиум') {
            moyka = this.currentUserSetings.washing_avto.premium
          }

          const booking = {
            car: JSON.parse(this.form.value.car),
            client: JSON.parse(this.xs_actual_search__client___lawfase),
            place_start: this.form.value.place_start,
            place_end: this.form.value.place_end,
            tariff: this.form.value.tariff,
            comment: this.form.value.comment,
            booking_start: this.form.value.booking_start,
            booking_end: this.form.value.booking_end,
            booking_days: (booking_end__x - booking_start__x) / (1000 * 60 * 60 * 24),
            summaFull: Math.round((+this.summa.summa + (+this.summa.place_start_price)) +
              (+this.summa.additional_services_price) + (+this.summa.car.zalog_rus) + (this.summa.car.price_dop_hour *
                this.summa.dop_hours)),
            summa: Math.round(this.summa.summa),
            dop_hours: this.summa.dop_hours,
            dop_info_open: {
              // clear_auto: this.form.value.clear_auto || false,
              // full_tank: this.form.value.full_tank || false,
              moyka: moyka || false,
              place_start_price: this.summa.place_start_price || 0,
              additional_services_price: this.summa.additional_services_price,
              additional_services_chair: this.form.value.additional_services_chair || false,
              additional_services_buster: this.form.value.additional_services_buster || false,
              additional_services_videoregister: this.form.value.additional_services_videoregister || false,
              additional_services_battery_charger: this.form.value.additional_services_battery_charger || false,
              additional_services_antiradar: this.form.value.additional_services_antiradar || false,
              additional_services_moyka: this.form.value.additional_services_moyka || false,
              isCustomePlaceStart: this.form.value.isCustomePlaceStartControlclick,
              isCustomeZalog: this.form.value.isCustomeZalogControlclick
            },
            booking_zalog: this.summa.car.zalog_rus,
          };

          // Отправляем запрос
          this.subUpdateBooking$ = this.bookings.update(this.bookingId, booking).subscribe((booking) => {
            MaterialService.toast('Бронь обновлена');
          });

        }
      }
      else {
        let moyka = '0';
        if (this.summa.car.category === 'Бизнес') {
          moyka = this.currentUserSetings.washing_avto.business
        }
        else if (this.summa.car.category === 'Комфорт') {
          moyka = this.currentUserSetings.washing_avto.komfort
        }
        else if (this.summa.car.category === 'Премиум') {
          moyka = this.currentUserSetings.washing_avto.premium
        }

        const booking = {
          car: JSON.parse(this.form.value.car),
          client: JSON.parse(this.xs_actual_search__client___lawfase),
          place_start: this.form.value.place_start,
          place_end: this.form.value.place_end,
          tariff: this.form.value.tariff,
          comment: this.form.value.comment,
          booking_start: this.form.value.booking_start,
          booking_end: this.form.value.booking_end,
          booking_days: (booking_end__x - booking_start__x) / (1000 * 60 * 60 * 24),
          summaFull: Math.round((+this.summa.summa + (+this.summa.place_start_price)) +
            (+this.summa.additional_services_price) + (+this.form.value.isCustomeZalogControl) + (this.summa.car.price_dop_hour * this.summa.dop_hours)),
          summa: Math.round(this.summa.summa),
          dop_hours: this.summa.dop_hours,
          dop_info_open: {
            // clear_auto: this.form.value.clear_auto || false,
            // full_tank: this.form.value.full_tank || false,
            moyka: moyka || false,
            place_start_price: this.summa.place_start_price || 0,
            additional_services_price: this.summa.additional_services_price,
            additional_services_chair: this.form.value.additional_services_chair || false,
            additional_services_buster: this.form.value.additional_services_buster || false,
            additional_services_videoregister: this.form.value.additional_services_videoregister || false,
            additional_services_battery_charger: this.form.value.additional_services_battery_charger || false,
            additional_services_antiradar: this.form.value.additional_services_antiradar || false,
            additional_services_moyka: this.form.value.additional_services_moyka || false,
            isCustomePlaceStart: this.form.value.isCustomePlaceStartControlclick,
            isCustomeZalog: this.form.value.isCustomeZalogControlclick
          },
          booking_zalog: this.form.value.isCustomeZalogControl,
        };



        // Отправляем запрос
        this.subUpdateBooking$ = this.bookings.update(this.bookingId, booking).subscribe((booking) => {
          MaterialService.toast('Бронь обновлена');
        });
      }
    }
   
  }


  // При клике на кнопку выбора клиента в модальном окне
  changeClientModal() {
    this.modal.open();
  }



  // Принимаем данные из модуля списка клиентов для поиска
  inputDataClientsListModule(e) {
    this.changeClient(e);
    this.modal.close();
    this.changeClientLawFase(e)
  }


  // Закрываем модальную форму создания договора в брони
  onCloseModal(e) {
    if (this.xs_actual_client_type === 'fiz') {
      this.modal2.close()
      this.changeClient(e)
    }

    if (this.xs_actual_client_type === 'law') {
      this.modal3.close()
      this.changeClientLawFase(e)
    }

  }


  // Добавляем договор в модальной форме
  modalAddDogovor() {
    if (this.xs_actual_client_type === 'fiz') {
      this.modal2.open();
    }

    if (this.xs_actual_client_type === 'law') {
      this.modal3.open();
    }
  }
}
