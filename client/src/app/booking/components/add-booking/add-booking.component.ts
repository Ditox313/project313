import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/services/auth.service';
import { CarsService } from 'src/app/cars/services/cars.service';
import { ClientsService } from 'src/app/clients/services/clients.service';
import { DocumentsService } from 'src/app/documents/services/documents.service';
import { MaterialService } from 'src/app/shared/services/material.service';
import { Client, Client_Law_Fase, MaterialDatepicker, Settings, Summa, User } from 'src/app/shared/types/interfaces';
import { BookingsService } from '../../services/bookings.service';
import { AccountService } from '../../../account/services/account.service';
import { ThrowStmt } from '@angular/compiler';


@Component({
  selector: 'app-add-booking',
  templateUrl: './add-booking.component.html',
  styleUrls: ['./add-booking.component.css'],
})
export class AddBookingComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('tabs') tabs!: ElementRef;


  form: any;

  // Храним все автомобили
  xscars$!: any ;

  // Храним всех клиентов
  xsclients$!: any ;


  // Храним стрим для активного договора
  getDogovorActive$ : Subscription;


  // Храним результат поиска клиента
  searchResultClient$: Subscription;

  
  // Подписка для создания брони
  subCreateBooking$: Subscription;


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


  // Минимальная дата аренды
  minDateBooking: string = '';



  // Получаем настройки текущего пользователя
  currentUserSetings$: Subscription = null;
  currentUserSetings!: Settings

  // Получаем текущего юзера
  currentUser$: Subscription = null;
  currentUser!: User


  constructor(
    private bookings: BookingsService,
    private router: Router,
    private cars: CarsService,
    private clients: ClientsService,
    private documents: DocumentsService,
    private auth: AuthService,
    private AccountService: AccountService,
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.setMinDate();
    this.xscars$ = this.cars.fetch();
    this.xsclients$ = this.clients.fetch();
    MaterialService.updateTextInputs();
    this.get_user();
    this.dasable_controls();
  }


  ngAfterViewInit(): void {
    MaterialService.initTabs(this.tabs.nativeElement);
    MaterialService.updateTextInputs();
  }

  ngOnDestroy(): void {
    if (this.getDogovorActive$)
    {
      this.getDogovorActive$.unsubscribe();
    }

    if (this.searchResultClient$)
    {
      this.searchResultClient$.unsubscribe();
    }
    if (this.subCreateBooking$)
    {
      this.subCreateBooking$.unsubscribe();
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

         console.log(this.currentUserSetings);
         
       })
    })
  }


  initForm()
  {
    this.form = new FormGroup({
      car: new FormControl('', [Validators.required]),
      client: new FormControl('', [Validators.required]),
      booking_start: new FormControl('', [Validators.required]),
      booking_end: new FormControl('',  [Validators.required]),
      place_start: new FormControl('Офис', [Validators.required]),
      place_end: new FormControl('Офис', [Validators.required]),
      tariff: new FormControl('', [Validators.required]),
      comment: new FormControl(''),
      clear_auto: new FormControl(''),
      full_tank: new FormControl(''),
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

  // Задаем минимальный параметр даты
  setMinDate()
  {
    
    let booking_start: any = document.getElementById('booking_start');
    booking_start.min = new Date().toISOString().slice(0, new Date().toISOString().lastIndexOf(":"));

    let booking_end: any = document.getElementById('booking_end');
    booking_end.min = new Date().toISOString().slice(0, new Date().toISOString().lastIndexOf(":"));
  }


  // При выборе атомобиля
  onChangeCar(e: any)
  {

    if (this.form.value.booking_start) {
      this.form.controls['client'].enable();
    }

    // Получаем выбранный автомобиль
    this.summa.car = JSON.parse(e)

    
    

    if (!this.isCustomeZalog)
    {
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
    else
    {
      if (this.summa.car !== {} && this.summa.tariff !== '' && this.summa.booking_start !== '' && this.summa.booking_end !== '') {
        if (this.summa.tariff === 'Город') {
          if (this.summa.booking_days < 3) {
            if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_1_2
              this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
            }
            if (this.summa.dop_hours >= 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_1_2
              this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl)
            }
            if (this.summa.dop_hours === 0) {
              this.summa.summa = this.summa.booking_days * this.summa.car.days_1_2;
              this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl);
            }

          }
          else if (this.summa.booking_days >= 3 && this.summa.booking_days <= 7) {
            if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_3_7
              this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
            }
            if (this.summa.dop_hours >= 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_3_7
              this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl)
            }
            if (this.summa.dop_hours === 0) {
              this.summa.summa = this.summa.booking_days * this.summa.car.days_3_7;
              this.summa.summaFull = +this.summa.summa + +this.form.value.isCustomeZalogControl;
            }
          }
          else if (this.summa.booking_days > 7 && this.summa.booking_days <= 14) {
            if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_8_14
              this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
            }
            if (this.summa.dop_hours >= 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_8_14
              this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl)
            }
            if (this.summa.dop_hours === 0) {
              this.summa.summa = this.summa.booking_days * this.summa.car.days_8_14;
              this.summa.summaFull = +this.summa.summa + +this.form.value.isCustomeZalogControl;
            }
          }
          else if (this.summa.booking_days > 14 && this.summa.booking_days <= 31) {
            if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_15_30
              this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
            }
            if (this.summa.dop_hours >= 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_15_30
              this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl)
            }
            if (this.summa.dop_hours === 0) {
              this.summa.summa = this.summa.booking_days * this.summa.car.days_15_30;
              this.summa.summaFull = +this.summa.summa + +this.form.value.isCustomeZalogControl;
            }
          }
          else if (this.summa.booking_days > 31) {
            if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_31_more
              this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
            }
            if (this.summa.dop_hours >= 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_31_more
              this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl)
            }
            if (this.summa.dop_hours === 0) {
              this.summa.summa = this.summa.booking_days * this.summa.car.days_31_more;
              this.summa.summaFull = +this.summa.summa + +this.form.value.isCustomeZalogControl;
            }
          }
        }
        else if (this.summa.tariff === 'Межгород') {
          if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.mezgorod
            this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
          }
          if (this.summa.dop_hours >= 12) {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.mezgorod
            this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl)
          }
          if (this.summa.dop_hours === 0) {
            this.summa.summa = this.summa.booking_days * this.summa.car.mezgorod;
            this.summa.summaFull = +this.summa.summa + +this.form.value.isCustomeZalogControl;
          }
        }
        else if (this.summa.tariff === 'Россия') {
          if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.russia
            this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
          }
          if (this.summa.dop_hours >= 12) {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.russia
            this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl)
          }
          if (this.summa.dop_hours === 0) {
            this.summa.summa = this.summa.booking_days * this.summa.car.russia;
            this.summa.summaFull = +this.summa.summa + +this.form.value.isCustomeZalogControl;
          }
        }
      }
    }
  }


  // Отключаем все инпуты кроме даты старта
  dasable_controls()
  {
    this.form.controls['booking_end'].disable();
    this.form.controls['car'].disable();
    this.form.controls['client'].disable();
    this.form.controls['tariff'].disable();
    this.form.controls['place_start'].disable();
    this.form.controls['clear_auto'].disable();
    this.form.controls['clear_auto'].disable();
    this.form.controls['full_tank'].disable();
    this.form.controls['additional_services_chair'].disable();
    this.form.controls['additional_services_buster'].disable();
    this.form.controls['additional_services_videoregister'].disable();
    this.form.controls['additional_services_battery_charger'].disable();
    this.form.controls['additional_services_antiradar'].disable();
    this.form.controls['additional_services_moyka'].disable();
    this.form.controls['isCustomePlaceStartControlclick'].disable();
    this.form.controls['isCustomeZalogControlclick'].disable();
  }


  // При выборе начала аренды
  bookingStartDate(e: any)
  {

    if (this.form.value.booking_start) {
      this.form.controls['booking_end'].enable();
    }


    // Получаем начало аренды
    this.summa.booking_start = e.target.value

    // Задаем минимальную дату аренды
    this.minDateBooking = e.target.value;

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
    

    if (!this.isCustomeZalog)
    {
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
    else
    {
      if (this.summa.car !== {} && this.summa.tariff !== '' && this.summa.booking_start !== '' && this.summa.booking_end !== '') {
        if (this.summa.tariff === 'Город') {
          if (this.summa.booking_days < 3) {
            if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_1_2
              this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
            }
            if (this.summa.dop_hours >= 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_1_2
              this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl)
            }
            if (this.summa.dop_hours === 0) {
              this.summa.summa = this.summa.booking_days * this.summa.car.days_1_2;
              this.summa.summaFull = +this.summa.summa + +this.form.value.isCustomeZalogControl;
            }

          }
          else if (this.summa.booking_days >= 3 && this.summa.booking_days <= 7) {
            if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_3_7
              this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
            }
            if (this.summa.dop_hours >= 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_3_7
              this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl)
            }
            if (this.summa.dop_hours === 0) {
              this.summa.summa = this.summa.booking_days * this.summa.car.days_3_7;
              this.summa.summaFull = +this.summa.summa + +this.form.value.isCustomeZalogControl;
            }
          }
          else if (this.summa.booking_days > 7 && this.summa.booking_days <= 14) {
            if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_8_14
              this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
            }
            if (this.summa.dop_hours >= 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_8_14
              this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl)
            }
            if (this.summa.dop_hours === 0) {
              this.summa.summa = this.summa.booking_days * this.summa.car.days_8_14;
              this.summa.summaFull = +this.summa.summa + +this.form.value.isCustomeZalogControl;
            }
          }
          else if (this.summa.booking_days > 14 && this.summa.booking_days <= 31) {
            if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_15_30
              this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
            }
            if (this.summa.dop_hours >= 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_15_30
              this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl)
            }
            if (this.summa.dop_hours === 0) {
              this.summa.summa = this.summa.booking_days * this.summa.car.days_15_30;
              this.summa.summaFull = +this.summa.summa + +this.form.value.isCustomeZalogControl;
            }
          }
          else if (this.summa.booking_days > 31) {
            if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_31_more
              this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
            }
            if (this.summa.dop_hours >= 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_31_more
              this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl)
            }
            if (this.summa.dop_hours === 0) {
              this.summa.summa = this.summa.booking_days * this.summa.car.days_31_more;
              this.summa.summaFull = +this.summa.summa + +this.form.value.isCustomeZalogControl;
            }
          }
        }
        else if (this.summa.tariff === 'Межгород') {
          if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.mezgorod
            this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
          }
          if (this.summa.dop_hours >= 12) {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.mezgorod
            this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl)
          }
          if (this.summa.dop_hours === 0) {
            this.summa.summa = this.summa.booking_days * this.summa.car.mezgorod;
            this.summa.summaFull = +this.summa.summa + +this.form.value.isCustomeZalogControl;
          }
        }
        else if (this.summa.tariff === 'Россия') {
          if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.russia
            this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
          }
          if (this.summa.dop_hours >= 12) {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.russia
            this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl)
          }
          if (this.summa.dop_hours === 0) {
            this.summa.summa = this.summa.booking_days * this.summa.car.russia;
            this.summa.summaFull = +this.summa.summa + +this.form.value.isCustomeZalogControl;
          }
        }

      }
    }
    
  }


  // При выборе конца аренды
  bookingEndDate(e: any)
  {

    if (this.form.value.booking_start) {
      this.form.controls['car'].enable();
    }


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

    if (!this.isCustomeZalog)
    {
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
    else
    {
      if (this.summa.car !== {} && this.summa.tariff !== '' && this.summa.booking_start !== '' && this.summa.booking_end !== '') {
        if (this.summa.tariff === 'Город') {
          if (this.summa.booking_days < 3) {
            if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_1_2
              this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
            }
            if (this.summa.dop_hours >= 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_1_2
              this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl)
            }
            if (this.summa.dop_hours === 0) {
              this.summa.summa = this.summa.booking_days * this.summa.car.days_1_2;
              this.summa.summaFull = +this.summa.summa + +this.form.value.isCustomeZalogControl;
            }

          }
          else if (this.summa.booking_days >= 3 && this.summa.booking_days <= 7) {
            if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_3_7
              this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
            }
            if (this.summa.dop_hours >= 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_3_7
              this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl)
            }
            if (this.summa.dop_hours === 0) {
              this.summa.summa = this.summa.booking_days * this.summa.car.days_3_7;
              this.summa.summaFull = +this.summa.summa + +this.form.value.isCustomeZalogControl;
            }
          }
          else if (this.summa.booking_days > 7 && this.summa.booking_days <= 14) {
            if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_8_14
              this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
            }
            if (this.summa.dop_hours >= 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_8_14
              this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl)
            }
            if (this.summa.dop_hours === 0) {
              this.summa.summa = this.summa.booking_days * this.summa.car.days_8_14;
              this.summa.summaFull = +this.summa.summa + +this.form.value.isCustomeZalogControl;
            }
          }
          else if (this.summa.booking_days > 14 && this.summa.booking_days <= 31) {
            if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_15_30
              this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
            }
            if (this.summa.dop_hours >= 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_15_30
              this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl)
            }
            if (this.summa.dop_hours === 0) {
              this.summa.summa = this.summa.booking_days * this.summa.car.days_15_30;
              this.summa.summaFull = +this.summa.summa + +this.form.value.isCustomeZalogControl;
            }
          }
          else if (this.summa.booking_days > 31) {
            if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_31_more
              this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
            }
            if (this.summa.dop_hours >= 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_31_more
              this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl)
            }
            if (this.summa.dop_hours === 0) {
              this.summa.summa = this.summa.booking_days * this.summa.car.days_31_more;
              this.summa.summaFull = +this.summa.summa + +this.form.value.isCustomeZalogControl;
            }
          }
        }
        else if (this.summa.tariff === 'Межгород') {
          if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.mezgorod
            this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
          }
          if (this.summa.dop_hours >= 12) {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.mezgorod
            this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl)
          }
          if (this.summa.dop_hours === 0) {
            this.summa.summa = this.summa.booking_days * this.summa.car.mezgorod;
            this.summa.summaFull = +this.summa.summa + +this.form.value.isCustomeZalogControl;
          }
        }
        else if (this.summa.tariff === 'Россия') {
          if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.russia
            this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
          }
          if (this.summa.dop_hours >= 12) {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.russia
            this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl)
          }
          if (this.summa.dop_hours === 0) {
            this.summa.summa = this.summa.booking_days * this.summa.car.russia;
            this.summa.summaFull = +this.summa.summa + +this.form.value.isCustomeZalogControl;
          }
        }

      }
    }
  }


  // При ваыборе тарифа
  onChangeTariff(e: any)
  {
    if (this.form.value.booking_start) {
      this.form.controls['place_start'].enable();
    }

    this.form.controls['clear_auto'].enable();
    this.form.controls['additional_services_chair'].enable();
    this.form.controls['additional_services_buster'].enable();
    this.form.controls['additional_services_videoregister'].enable();
    this.form.controls['additional_services_battery_charger'].enable();
    this.form.controls['additional_services_antiradar'].enable();
    this.form.controls['additional_services_moyka'].enable();
    this.form.controls['full_tank'].enable();
    this.form.controls['isCustomePlaceStartControlclick'].enable();
    this.form.controls['isCustomeZalogControlclick'].enable();
    

    // Получаем тариф
    this.summa.tariff = e
    
    if (!this.isCustomeZalog)
    {
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
    else
    {
      if (this.summa.car !== {} && this.summa.tariff !== '' && this.summa.booking_start !== '' && this.summa.booking_end !== '') {
        if (this.summa.tariff === 'Город') {
          if (this.summa.booking_days < 3) {
            if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_1_2
              this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
            }
            if (this.summa.dop_hours >= 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_1_2
              this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl)
            }
            if (this.summa.dop_hours === 0) {
              this.summa.summa = this.summa.booking_days * this.summa.car.days_1_2;
              this.summa.summaFull = +this.summa.summa + +this.form.value.isCustomeZalogControl;
            }

          }
          else if (this.summa.booking_days >= 3 && this.summa.booking_days <= 7) {
            if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_3_7
              this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
            }
            if (this.summa.dop_hours >= 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_3_7
              this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl)
            }
            if (this.summa.dop_hours === 0) {
              this.summa.summa = this.summa.booking_days * this.summa.car.days_3_7;
              this.summa.summaFull = +this.summa.summa + +this.form.value.isCustomeZalogControl;
            }
          }
          else if (this.summa.booking_days > 7 && this.summa.booking_days <= 14) {
            if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_8_14
              this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
            }
            if (this.summa.dop_hours >= 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_8_14
              this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl)
            }
            if (this.summa.dop_hours === 0) {
              this.summa.summa = this.summa.booking_days * this.summa.car.days_8_14;
              this.summa.summaFull = +this.summa.summa + +this.form.value.isCustomeZalogControl;
            }
          }
          else if (this.summa.booking_days > 14 && this.summa.booking_days <= 31) {
            if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_15_30
              this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
            }
            if (this.summa.dop_hours >= 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_15_30
              this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl)
            }
            if (this.summa.dop_hours === 0) {
              this.summa.summa = this.summa.booking_days * this.summa.car.days_15_30;
              this.summa.summaFull = +this.summa.summa + +this.form.value.isCustomeZalogControl;
            }
          }
          else if (this.summa.booking_days > 31) {
            if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_31_more
              this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
            }
            if (this.summa.dop_hours >= 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_31_more
              this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl)
            }
            if (this.summa.dop_hours === 0) {
              this.summa.summa = this.summa.booking_days * this.summa.car.days_31_more;
              this.summa.summaFull = +this.summa.summa + +this.form.value.isCustomeZalogControl;
            }
          }
        }
        else if (this.summa.tariff === 'Межгород') {
          if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.mezgorod
            this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
          }
          if (this.summa.dop_hours >= 12) {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.mezgorod
            this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl)
          }
          if (this.summa.dop_hours === 0) {
            this.summa.summa = this.summa.booking_days * this.summa.car.mezgorod;
            this.summa.summaFull = +this.summa.summa + +this.form.value.isCustomeZalogControl;
          }
        }
        else if (this.summa.tariff === 'Россия') {
          if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.russia
            this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
          }
          if (this.summa.dop_hours >= 12) {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.russia
            this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl)
          }
          if (this.summa.dop_hours === 0) {
            this.summa.summa = this.summa.booking_days * this.summa.car.russia;
            this.summa.summaFull = +this.summa.summa + +this.form.value.isCustomeZalogControl;
          }
        }

      }
    }
  }


  // При выборе типа клиента
  changeTypeClient(e)
  {
    if (this.form.value.booking_start) {
      this.form.controls['tariff'].enable();
    }

    if(e.target.value === 'fiz')
    {
      this.lawSearchIsVisible = false;
      this.fizSearchIsVisible = true;
      this.xs_actual_client_type = 'fiz';
    }
    else if (e.target.value === 'law')
    {
      this.lawSearchIsVisible = true;
      this.fizSearchIsVisible = false;
      this.xs_actual_client_type = 'law';
    }
    
  }


  // При выборе клиента физ/лица
  changeClient(client)
  {
    this.form.patchValue({
      search_fiz: client.surname + ' ' + client.name + ' ' + client.lastname
    });
    this.hasQuery = false;
    this.xs_actual_search__client = JSON.stringify(client);
    this.xs_actual_search__client_no_json = client;
    

    this.getDogovorActive$ = this.documents.getDogovorActive(client._id).subscribe(dogovor=> {
      if (Object.keys(dogovor).length > 0)
      {
        this.xs_dogovor_number__actual = dogovor._id;
        this.isActiveDogovor = 'isActive';

        if (this.form.value.booking_end > dogovor[0].date_end )
        {
          this.is_dogovor_finish_compare_booking = 'isDogovorFinish';
          console.log('Бронь закончится раньше договора');
        }

      }
      else
      {
        this.isActiveDogovor = 'no_isActive';
      }
      
    })
  }



  // При выборе места подачи авто
  onChangePlaceStart(e)
  {
   
    if (this.form.value.booking_start) {
      this.form.controls['place_end'].enable();
    }
    
    if(e === 'Аэропорт')
    {
      this.summa.place_start_price = +this.currentUserSetings.share_avto.airport_price
    }
    else if (e === 'Ж/д вокзал')
    {
      this.summa.place_start_price = +this.currentUserSetings.share_avto.railway_price
      
    }
    else if (e === 'ТЦ Кристалл')
    {
      this.summa.place_start_price = +this.currentUserSetings.share_avto.kristal_tc_price
      
    }
    else if (e === 'Тц Сити Молл')
    {
      this.summa.place_start_price = +this.currentUserSetings.share_avto.sitymol_tc_price
      
    }
    else if (e === 'Офис')
    {
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


  // Проверяем нажат ли чекбокс для кастомного залога
  xs_isCustomeZalogCheck() {

    this.isCustomeZalog = !this.isCustomeZalog;

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

    this.form.patchValue({
      isCustomeZalogControl: '',
    })
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
      isCustomePlaceStartControlPrice: '',
      isCustomePlaceStartControl: ''
    })
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
    // Получаем значения начала и конца аренды
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
            summaFull: Math.round((+this.summa.summaFull) + (+this.summa.place_start_price) + this.summa.additional_services_price),
            summa: Math.round(this.summa.summa),
            dop_hours: this.summa.dop_hours,
            dop_info_open: {
              clear_auto: this.form.value.clear_auto || false,
              full_tank: this.form.value.full_tank || false,
              moyka: moyka || false,
              place_start_price: this.summa.place_start_price || 0,
              additional_services_price: this.summa.additional_services_price,
              additional_services_chair: this.form.value.additional_services_chair,
              additional_services_buster: this.form.value.additional_services_buster,
              additional_services_videoregister: this.form.value.additional_services_videoregister,
              additional_services_battery_charger: this.form.value.additional_services_battery_charger,
              additional_services_antiradar: this.form.value.additional_services_antiradar,
              additional_services_moyka: this.form.value.additional_services_moyka,
              isCustomePlaceStart: this.form.value.isCustomePlaceStartControlclick,
              isCustomeZalog: this.form.value.isCustomeZalogControlclick
            },
            booking_zalog: this.summa.car.zalog,
            dogovor_number__actual: this.xs_dogovor_number__actual,
          };



          // Отправляем запрос
          this.subCreateBooking$ = this.bookings.create(booking).subscribe((booking) => {
            MaterialService.toast('Бронь добавлена');
            this.router.navigate(['/bookings-page']);
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
            summaFull: Math.round((+this.summa.summaFull) + (+this.summa.place_start_price) + this.summa.additional_services_price),
            summa: Math.round(this.summa.summa),
            dop_hours: this.summa.dop_hours,
            dop_info_open: {
              clear_auto: this.form.value.clear_auto || false,
              full_tank: this.form.value.full_tank || false,
              moyka: moyka || false,
              place_start_price: this.summa.place_start_price || 0,
              additional_services_price: this.summa.additional_services_price,
              additional_services_chair: this.form.value.additional_services_chair,
              additional_services_buster: this.form.value.additional_services_buster,
              additional_services_videoregister: this.form.value.additional_services_videoregister,
              additional_services_battery_charger: this.form.value.additional_services_battery_charger,
              additional_services_antiradar: this.form.value.additional_services_antiradar,
              additional_services_moyka: this.form.value.additional_services_moyka,
              isCustomePlaceStart: this.form.value.isCustomePlaceStartControlclick,
              isCustomeZalog: this.form.value.isCustomeZalogControlclick
            },
            booking_zalog: this.summa.car.zalog_mej,
            dogovor_number__actual: this.xs_dogovor_number__actual,
          };


          // Отправляем запрос
          this.subCreateBooking$ = this.bookings.create(booking).subscribe((booking) => {
            MaterialService.toast('Бронь добавлена');
            this.router.navigate(['/bookings-page']);
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
            summaFull: Math.round((+this.summa.summaFull) + (+this.summa.place_start_price) + this.summa.additional_services_price),
            summa: Math.round(this.summa.summa),
            dop_hours: this.summa.dop_hours,
            dop_info_open: {
              clear_auto: this.form.value.clear_auto || false,
              full_tank: this.form.value.full_tank || false,
              moyka: moyka || false,
              place_start_price: this.summa.place_start_price || 0,
              additional_services_price: this.summa.additional_services_price,
              additional_services_chair: this.form.value.additional_services_chair,
              additional_services_buster: this.form.value.additional_services_buster,
              additional_services_videoregister: this.form.value.additional_services_videoregister,
              additional_services_battery_charger: this.form.value.additional_services_battery_charger,
              additional_services_antiradar: this.form.value.additional_services_antiradar,
              additional_services_moyka: this.form.value.additional_services_moyka,
              isCustomePlaceStart: this.form.value.isCustomePlaceStartControlclick,
              isCustomeZalog: this.form.value.isCustomeZalogControlclick
            },
            booking_zalog: this.summa.car.zalog_rus,
            dogovor_number__actual: this.xs_dogovor_number__actual,
          };

          // Отправляем запрос
          this.subCreateBooking$ = this.bookings.create(booking).subscribe((booking) => {
            MaterialService.toast('Бронь добавлена');
            this.router.navigate(['/bookings-page']);
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
          summaFull: Math.round((+this.summa.summaFull) + (+this.summa.place_start_price) + this.summa.additional_services_price),
          summa: Math.round(this.summa.summa),
          dop_hours: this.summa.dop_hours,
          dop_info_open: {
            clear_auto: this.form.value.clear_auto || false,
            full_tank: this.form.value.full_tank || false,
            moyka: moyka || false,
            place_start_price: this.summa.place_start_price || 0,
            additional_services_price: this.summa.additional_services_price,
            additional_services_chair: this.form.value.additional_services_chair,
            additional_services_buster: this.form.value.additional_services_buster,
            additional_services_videoregister: this.form.value.additional_services_videoregister,
            additional_services_battery_charger: this.form.value.additional_services_battery_charger,
            additional_services_antiradar: this.form.value.additional_services_antiradar,
            additional_services_moyka: this.form.value.additional_services_moyka,
            isCustomePlaceStart: this.form.value.isCustomePlaceStartControlclick,
            isCustomeZalog: this.form.value.isCustomeZalogControlclick
          },
          booking_zalog: this.form.value.isCustomeZalogControl,
          dogovor_number__actual: this.xs_dogovor_number__actual,

        };



        // Отправляем запрос
        this.subCreateBooking$ = this.bookings.create(booking).subscribe((booking) => {
          MaterialService.toast('Бронь добавлена');
          this.router.navigate(['/bookings-page']);
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
            summaFull: Math.round((+this.summa.summaFull) + (+this.summa.place_start_price) + this.summa.additional_services_price),
            summa: Math.round(this.summa.summa),
            dop_hours: this.summa.dop_hours,
            dop_info_open: {
              clear_auto: this.form.value.clear_auto || false,
              full_tank: this.form.value.full_tank || false,
              moyka: moyka || false,
              place_start_price: this.summa.place_start_price || 0,
              additional_services_price: this.summa.additional_services_price,
              additional_services_chair: this.form.value.additional_services_chair,
              additional_services_buster: this.form.value.additional_services_buster,
              additional_services_videoregister: this.form.value.additional_services_videoregister,
              additional_services_battery_charger: this.form.value.additional_services_battery_charger,
              additional_services_antiradar: this.form.value.additional_services_antiradar,
              additional_services_moyka: this.form.value.additional_services_moyka,
              isCustomePlaceStart: this.form.value.isCustomePlaceStartControlclick,
              isCustomeZalog: this.form.value.isCustomeZalogControlclick
            },
            booking_zalog: this.summa.car.zalog,
          };



          // Отправляем запрос
          this.subCreateBooking$ = this.bookings.create(booking).subscribe((booking) => {
            MaterialService.toast('Бронь добавлена');
            this.router.navigate(['/bookings-page']);
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
            summaFull: Math.round((+this.summa.summaFull) + (+this.summa.place_start_price) + this.summa.additional_services_price),
            summa: Math.round(this.summa.summa),
            dop_hours: this.summa.dop_hours,
            dop_info_open: {
              clear_auto: this.form.value.clear_auto || false,
              full_tank: this.form.value.full_tank || false,
              moyka: moyka || false,
              place_start_price: this.summa.place_start_price || 0,
              additional_services_price: this.summa.additional_services_price,
              additional_services_chair: this.form.value.additional_services_chair,
              additional_services_buster: this.form.value.additional_services_buster,
              additional_services_videoregister: this.form.value.additional_services_videoregister,
              additional_services_battery_charger: this.form.value.additional_services_battery_charger,
              additional_services_antiradar: this.form.value.additional_services_antiradar,
              additional_services_moyka: this.form.value.additional_services_moyka,
              isCustomePlaceStart: this.form.value.isCustomePlaceStartControlclick,
              isCustomeZalog: this.form.value.isCustomeZalogControlclick
            },
            booking_zalog: this.summa.car.zalog_mej,
          };


          // Отправляем запрос
          this.subCreateBooking$ = this.bookings.create(booking).subscribe((booking) => {
            MaterialService.toast('Бронь добавлена');
            this.router.navigate(['/bookings-page']);
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
            summaFull: Math.round((+this.summa.summaFull) + (+this.summa.place_start_price) + this.summa.additional_services_price),
            summa: Math.round(this.summa.summa),
            dop_hours: this.summa.dop_hours,
            dop_info_open: {
              clear_auto: this.form.value.clear_auto || false,
              full_tank: this.form.value.full_tank || false,
              moyka: moyka || false,
              place_start_price: this.summa.place_start_price || 0,
              additional_services_price: this.summa.additional_services_price,
              additional_services_chair: this.form.value.additional_services_chair,
              additional_services_buster: this.form.value.additional_services_buster,
              additional_services_videoregister: this.form.value.additional_services_videoregister,
              additional_services_battery_charger: this.form.value.additional_services_battery_charger,
              additional_services_antiradar: this.form.value.additional_services_antiradar,
              additional_services_moyka: this.form.value.additional_services_moyka,
              isCustomePlaceStart: this.form.value.isCustomePlaceStartControlclick,
              isCustomeZalog: this.form.value.isCustomeZalogControlclick
            },
            booking_zalog: this.summa.car.zalog_rus,
          };

          // Отправляем запрос
          this.subCreateBooking$ = this.bookings.create(booking).subscribe((booking) => {
            MaterialService.toast('Бронь добавлена');
            this.router.navigate(['/bookings-page']);
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
          summaFull: Math.round((+this.summa.summaFull) + (+this.summa.place_start_price) + this.summa.additional_services_price),
          summa: Math.round(this.summa.summa),
          dop_hours: this.summa.dop_hours,
          dop_info_open: {
            clear_auto: this.form.value.clear_auto || false,
            full_tank: this.form.value.full_tank || false,
            moyka: moyka || false,
            place_start_price: this.summa.place_start_price || 0,
            additional_services_price: this.summa.additional_services_price,
            additional_services_chair: this.form.value.additional_services_chair,
            additional_services_buster: this.form.value.additional_services_buster,
            additional_services_videoregister: this.form.value.additional_services_videoregister,
            additional_services_battery_charger: this.form.value.additional_services_battery_charger,
            additional_services_antiradar: this.form.value.additional_services_antiradar,
            additional_services_moyka: this.form.value.additional_services_moyka,
            isCustomePlaceStart: this.form.value.isCustomePlaceStartControlclick,
            isCustomeZalog: this.form.value.isCustomeZalogControlclick
          },
          booking_zalog: this.form.value.isCustomeZalogControl,
        };



        // Отправляем запрос
        this.subCreateBooking$ = this.bookings.create(booking).subscribe((booking) => {
          MaterialService.toast('Бронь добавлена');
          this.router.navigate(['/bookings-page']);
        });
      }
    }
   
  }
}