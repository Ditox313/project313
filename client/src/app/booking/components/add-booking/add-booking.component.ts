import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/services/auth.service';
import { CarsService } from 'src/app/cars/services/cars.service';
import { ClientsService } from 'src/app/clients/services/clients.service';
import { DocumentsService } from 'src/app/documents/services/documents.service';
import { MaterialService } from 'src/app/shared/services/material.service';
import { Client, Client_Law_Fase, MaterialDatepicker, MaterialInstance, Settings, Summa, SummaMixedTarif, User } from 'src/app/shared/types/interfaces';
import { BookingsService } from '../../services/bookings.service';
import { AccountService } from '../../../account/services/account.service';
import { ThrowStmt } from '@angular/compiler';
import { SmenaService } from 'src/app/smena/services/smena.service';
import { concat, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';


@Component({
  selector: 'app-add-booking',
  templateUrl: './add-booking.component.html',
  styleUrls: ['./add-booking.component.css'],
})
export class AddBookingComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('tabs') tabs!: ElementRef;


  form: any;

  // Храним все автомобили
  xscars$!: any;

  // Храним всех клиентов
  xsclients$!: any;


  // Храним стрим для активного договора
  getDogovorActive$: Subscription;


  // Храним результат поиска клиента
  searchResultClient$: Subscription;


  // Подписка для создания брони
  subCreateBooking$: Subscription;


  // Храним объект суммы
  summa: Summa = {
    car: {},
    tariff: [],
    booking_start: '',
    booking_end: '',
    summa: '',
    booking_days: '',
    summaFull: '',
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

  // Нажат ли произвольный залог
  isCustomeZalog: boolean = false;

  // Закончился ли ввод в поле нового залога
  isCustomeZalogCheck: boolean = false;

  // Выбрано произвольное место подачи
  isCustomePlaceStart: boolean = false;

  // Выбрано произвольное место приема
  isCustomePlaceInput: boolean = false;


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




  // Храним референцию модального окна
  @ViewChild('modal') modalRef: ElementRef
  @ViewChild('modal2') modal2Ref: ElementRef
  @ViewChild('modal3') modal3Ref: ElementRef


  // Храним модальное окно
  modal: MaterialInstance
  modal2: MaterialInstance
  modal3: MaterialInstance


  // Цена тарифа
  tarifPrice: any = []



  // При выборе смешанного тарифа
  isMixedTarif: Boolean = false;


  // Храним полученные автомобили(все)
  xscars: any = []


  constructor(
    private bookings: BookingsService,
    private router: Router,
    private cars: CarsService,
    private clients: ClientsService,
    private documents: DocumentsService,
    private auth: AuthService,
    private AccountService: AccountService,
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.setMinDate();
    MaterialService.updateTextInputs();
    this.get_user();
    this.dasable_controls();

    this.xscars$ = this.cars.fetch().subscribe(res => {
      this.xscars = res
    });

    this.xsclients$ = this.clients.fetch();
  }


  ngAfterViewInit(): void {
    MaterialService.initTabs(this.tabs.nativeElement);
    MaterialService.updateTextInputs();
    this.modal = MaterialService.initModalPos(this.modalRef)
    this.modal2 = MaterialService.initModalPos(this.modal2Ref)
    this.modal3 = MaterialService.initModalPos(this.modal3Ref)
  }

  ngOnDestroy(): void {
    if (this.getDogovorActive$) {
      this.getDogovorActive$.unsubscribe();
    }

    if (this.searchResultClient$) {
      this.searchResultClient$.unsubscribe();
    }
    if (this.subCreateBooking$) {
      this.subCreateBooking$.unsubscribe();
    }
    if (this.currentUserSetings$) {
      this.currentUserSetings$.unsubscribe();
    }
    if (this.currentUser$) {
      this.currentUser$.unsubscribe();
    }


    this.modal.destroy();
  }


  get_user() {
    this.currentUser$ = this.auth.get_user().subscribe(res => {
      this.currentUser = res;

      this.currentUserSetings$ = this.AccountService.get_settings_user(this.currentUser._id).subscribe(res => {
        this.currentUserSetings = res;
      })

    })
  }


  initForm() {
    this.form = new FormGroup({
      car: new FormControl('', [Validators.required]),
      client: new FormControl('', [Validators.required]),
      booking_start: new FormControl('', [Validators.required]),
      booking_end: new FormControl('', [Validators.required]),
      place_start: new FormControl('Офис', [Validators.required]),
      place_end: new FormControl('Офис', [Validators.required]),
      tariff: new FormControl('', [Validators.required]),
      comment: new FormControl(''),
      isCustomeZalogControl: new FormControl(''),
      isCustomePlaceStartControl: new FormControl(''),
      isCustomePlaceStartControlPrice: new FormControl(''),
      isCustomePlaceInputControl: new FormControl(''),
      isCustomePlaceInputControlPrice: new FormControl(''),
      search_fiz: new FormControl(''),
      search_law: new FormControl(''),
      additional_services_chair: new FormControl(''),
      additional_services_buster: new FormControl(''),
      additional_services_videoregister: new FormControl(''),
      additional_services_battery_charger: new FormControl(''),
      additional_services_antiradar: new FormControl(''),
      additional_services_moyka: new FormControl(''),
      isCustomePlaceStartControlclick: new FormControl(''),
      isCustomePlaceInputControlclick: new FormControl(''),
      isCustomeZalogControlclick: new FormControl(''),
      tarif_mixed_gorod: new FormControl(''),
      tarif_mixed_gorod_days: new FormControl(''),
      tarif_mixed_mezjgorod: new FormControl(''),
      tarif_mixed_mezjgorod_days: new FormControl(''),
      tarif_mixed_russia: new FormControl(''),
      tarif_mixed_russia_days: new FormControl(''),
    });


  }

  // Задаем минимальный параметр даты
  setMinDate() {

    let booking_start: any = document.getElementById('booking_start');
    booking_start.min = new Date().toISOString().slice(0, new Date().toISOString().lastIndexOf(":"));

    let booking_end: any = document.getElementById('booking_end');
    booking_end.min = new Date().toISOString().slice(0, new Date().toISOString().lastIndexOf(":"));
  }


  // При выборе атомобиля
  onChangeCar(e: any) {

    if (this.form.value.booking_start) {
      this.form.controls['client'].enable();
    }

    // Получаем авто по переданному id
    const actulacar = this.xscars.filter(car => car._id === e);


    // Получаем выбранный автомобиль
    this.summa.car = actulacar[0]


    if (e !== 'Смешанный') {
      // Обнуляем массив с тарифами
      this.isMixedTarif = false;
      this.summa.tariff.splice(0, this.summa.tariff.length);


      // Получаем тариф
      this.summa.tariff.push({
        name: e,
        days: this.summa.booking_days,
        summa: 0
      })


      if (!this.isCustomeZalog) {
        if (this.summa.tariff[0].name !== '' && this.summa.booking_start !== '' && this.summa.booking_end !== '') {
          if (this.summa.tariff[0].name === 'Город') {
            if (this.summa.booking_days < 3) {
              if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
                this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_1_2
                this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.days_1_2
                this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
              }
              if (this.summa.dop_hours >= 12) {
                this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_1_2
                this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.days_1_2
                this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog)
              }
              if (this.summa.dop_hours === 0) {
                this.summa.summa = this.summa.booking_days * this.summa.car.days_1_2;
                this.summa.tariff[0].summa = this.summa.booking_days * this.summa.car.days_1_2;
                this.summa.summaFull = +this.summa.summa + +this.summa.car.zalog;
              }

            }
            else if (this.summa.booking_days >= 3 && this.summa.booking_days <= 7) {
              if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
                this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_3_7
                this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.days_3_7
                this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
              }
              if (this.summa.dop_hours >= 12) {
                this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_3_7
                this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.days_3_7
                this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog)
              }
              if (this.summa.dop_hours === 0) {
                this.summa.summa = this.summa.booking_days * this.summa.car.days_3_7;
                this.summa.tariff[0].summa = this.summa.booking_days * this.summa.car.days_3_7;
                this.summa.summaFull = +this.summa.summa + +this.summa.car.zalog;
              }
            }
            else if (this.summa.booking_days > 7 && this.summa.booking_days <= 14) {
              if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
                this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_8_14
                this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.days_8_14
                this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
              }
              if (this.summa.dop_hours >= 12) {
                this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_8_14
                this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.days_8_14
                this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog)
              }
              if (this.summa.dop_hours === 0) {
                this.summa.summa = this.summa.booking_days * this.summa.car.days_8_14;
                this.summa.tariff[0].summa = this.summa.booking_days * this.summa.car.days_8_14;
                this.summa.summaFull = +this.summa.summa + +this.summa.car.zalog;
              }
            }
            else if (this.summa.booking_days > 14 && this.summa.booking_days <= 31) {
              if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
                this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_15_30
                this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.days_15_30
                this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
              }
              if (this.summa.dop_hours >= 12) {
                this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_15_30
                this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.days_15_30
                this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog)
              }
              if (this.summa.dop_hours === 0) {
                this.summa.summa = this.summa.booking_days * this.summa.car.days_15_30;
                this.summa.tariff[0].summa = this.summa.booking_days * this.summa.car.days_15_30;
                this.summa.summaFull = +this.summa.summa + +this.summa.car.zalog;
              }
            }
            else if (this.summa.booking_days > 31) {
              if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
                this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_31_more
                this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.days_31_more
                this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
              }
              if (this.summa.dop_hours >= 12) {
                this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_31_more
                this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.days_31_more
                this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog)
              }
              if (this.summa.dop_hours === 0) {
                this.summa.summa = this.summa.booking_days * this.summa.car.days_31_more;
                this.summa.tariff[0].summa = this.summa.booking_days * this.summa.car.days_31_more;
                this.summa.summaFull = +this.summa.summa + +this.summa.car.zalog;
              }
            }
          }
          else if (this.summa.tariff[0].name === 'Межгород') {
            if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.mezgorod
              this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.mezgorod
              this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog_mej) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
            }
            if (this.summa.dop_hours >= 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.mezgorod
              this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.mezgorod
              this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog_mej)
            }
            if (this.summa.dop_hours === 0) {
              this.summa.summa = this.summa.booking_days * this.summa.car.mezgorod;
              this.summa.tariff[0].summa = this.summa.booking_days * this.summa.car.mezgorod;
              this.summa.summaFull = +this.summa.summa + +this.summa.car.zalog_mej;
            }
          }
          else if (this.summa.tariff[0].name === 'Россия') {
            if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.russia
              this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.russia
              this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog_rus) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
            }
            if (this.summa.dop_hours >= 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.russia
              this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.russia
              this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog_rus)
            }
            if (this.summa.dop_hours === 0) {
              this.summa.summa = this.summa.booking_days * this.summa.car.russia;
              this.summa.tariff[0].summa = this.summa.booking_days * this.summa.car.russia;
              this.summa.summaFull = +this.summa.summa + +this.summa.car.zalog_rus;
            }
          }

        }

      }
      else {
        if (this.summa.tariff[0].name !== '' && this.summa.booking_start !== '' && this.summa.booking_end !== '') {
          if (this.summa.tariff[0].name === 'Город') {
            if (this.summa.booking_days < 3) {
              if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
                this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_1_2
                this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.days_1_2
                this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
              }
              if (this.summa.dop_hours >= 12) {
                this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_1_2
                this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.days_1_2
                this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl)
              }
              if (this.summa.dop_hours === 0) {
                this.summa.summa = this.summa.booking_days * this.summa.car.days_1_2;
                this.summa.tariff[0].summa = this.summa.booking_days * this.summa.car.days_1_2;
                this.summa.summaFull = +this.summa.summa + +this.form.value.isCustomeZalogControl;
              }

            }
            else if (this.summa.booking_days >= 3 && this.summa.booking_days <= 7) {
              if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
                this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_3_7
                this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.days_3_7
                this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
              }
              if (this.summa.dop_hours >= 12) {
                this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_3_7
                this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.days_3_7
                this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl)
              }
              if (this.summa.dop_hours === 0) {
                this.summa.summa = this.summa.booking_days * this.summa.car.days_3_7;
                this.summa.tariff[0].summa = this.summa.booking_days * this.summa.car.days_3_7;
                this.summa.summaFull = +this.summa.summa + +this.form.value.isCustomeZalogControl;
              }
            }
            else if (this.summa.booking_days > 7 && this.summa.booking_days <= 14) {
              if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
                this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_8_14
                this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.days_8_14
                this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
              }
              if (this.summa.dop_hours >= 12) {
                this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_8_14
                this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.days_8_14
                this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl)
              }
              if (this.summa.dop_hours === 0) {
                this.summa.summa = this.summa.booking_days * this.summa.car.days_8_14;
                this.summa.tariff[0].summa = this.summa.booking_days * this.summa.car.days_8_14;
                this.summa.summaFull = +this.summa.summa + +this.form.value.isCustomeZalogControl;
              }
            }
            else if (this.summa.booking_days > 14 && this.summa.booking_days <= 31) {
              if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
                this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_15_30
                this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.days_15_30
                this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
              }
              if (this.summa.dop_hours >= 12) {
                this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_15_30
                this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.days_15_30
                this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl)
              }
              if (this.summa.dop_hours === 0) {
                this.summa.summa = this.summa.booking_days * this.summa.car.days_15_30;
                this.summa.tariff[0].summa = this.summa.booking_days * this.summa.car.days_15_30;
                this.summa.summaFull = +this.summa.summa + +this.form.value.isCustomeZalogControl;
              }
            }
            else if (this.summa.booking_days > 31) {
              if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
                this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_31_more
                this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.days_31_more
                this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
              }
              if (this.summa.dop_hours >= 12) {
                this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_31_more
                this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.days_31_more
                this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl)
              }
              if (this.summa.dop_hours === 0) {
                this.summa.summa = this.summa.booking_days * this.summa.car.days_31_more;
                this.summa.tariff[0].summa = this.summa.booking_days * this.summa.car.days_31_more;
                this.summa.summaFull = +this.summa.summa + +this.form.value.isCustomeZalogControl;
              }
            }
          }
          else if (this.summa.tariff[0].name === 'Межгород') {
            if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.mezgorod
              this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.mezgorod
              this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
            }
            if (this.summa.dop_hours >= 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.mezgorod
              this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.mezgorod
              this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl)
            }
            if (this.summa.dop_hours === 0) {
              this.summa.summa = this.summa.booking_days * this.summa.car.mezgorod;
              this.summa.tariff[0].summa = this.summa.booking_days * this.summa.car.mezgorod;
              this.summa.summaFull = +this.summa.summa + +this.form.value.isCustomeZalogControl;
            }
          }
          else if (this.summa.tariff[0].name === 'Россия') {
            if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.russia
              this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.russia
              this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
            }
            if (this.summa.dop_hours >= 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.russia
              this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.russia
              this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl)
            }
            if (this.summa.dop_hours === 0) {
              this.summa.summa = this.summa.booking_days * this.summa.car.russia;
              this.summa.tariff[0].summa = this.summa.booking_days * this.summa.car.russia;
              this.summa.summaFull = +this.summa.summa + +this.form.value.isCustomeZalogControl;
            }
          }

        }
      }
    }
    else {
      // Обнуляем массив с тарифами
      this.isMixedTarif = true;
      this.summa.tariff.splice(0, this.summa.tariff.length);


      this.form.controls['tarif_mixed_gorod_days'].disable();
      this.form.controls['tarif_mixed_mezjgorod_days'].disable();
      this.form.controls['tarif_mixed_russia_days'].disable();
    }
  }


  // Отключаем все инпуты кроме даты старта
  dasable_controls() {
    this.form.controls['booking_end'].disable();
    this.form.controls['car'].disable();
    this.form.controls['client'].disable();
    this.form.controls['tariff'].disable();
    this.form.controls['place_start'].disable();
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
  bookingStartDate(e: any) {

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

    if (!Number.isInteger(dop_hour_days)) {
      this.summa.dop_hours = Math.floor(((booking_end__x - booking_start__x) / (1000 * 60 * 60)) % 24);
    }
    else {
      this.summa.dop_hours = 0
    }



    // Назначаем переменную для колличества дней аренды
    this.summa.booking_days = (booking_end__x - booking_start__x) / (1000 * 60 * 60 * 24);


    if (!this.isCustomeZalog) {
      if (this.summa.tariff[0] && this.summa.booking_start !== '' && this.summa.booking_end !== '') {
        if (this.summa.tariff[0].name === 'Город') {
          if (this.summa.booking_days < 3) {
            if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_1_2
              this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.days_1_2
              this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
            }
            if (this.summa.dop_hours >= 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_1_2
              this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.days_1_2
              this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog)
            }
            if (this.summa.dop_hours === 0) {
              this.summa.summa = this.summa.booking_days * this.summa.car.days_1_2;
              this.summa.tariff[0].summa = this.summa.booking_days * this.summa.car.days_1_2;
              this.summa.summaFull = +this.summa.summa + +this.summa.car.zalog;
            }

          }
          else if (this.summa.booking_days >= 3 && this.summa.booking_days <= 7) {
            if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_3_7
              this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.days_3_7
              this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
            }
            if (this.summa.dop_hours >= 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_3_7
              this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.days_3_7
              this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog)
            }
            if (this.summa.dop_hours === 0) {
              this.summa.summa = this.summa.booking_days * this.summa.car.days_3_7;
              this.summa.tariff[0].summa = this.summa.booking_days * this.summa.car.days_3_7;
              this.summa.summaFull = +this.summa.summa + +this.summa.car.zalog;
            }
          }
          else if (this.summa.booking_days > 7 && this.summa.booking_days <= 14) {
            if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_8_14
              this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.days_8_14
              this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
            }
            if (this.summa.dop_hours >= 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_8_14
              this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.days_8_14
              this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog)
            }
            if (this.summa.dop_hours === 0) {
              this.summa.summa = this.summa.booking_days * this.summa.car.days_8_14;
              this.summa.tariff[0].summa = this.summa.booking_days * this.summa.car.days_8_14;
              this.summa.summaFull = +this.summa.summa + +this.summa.car.zalog;
            }
          }
          else if (this.summa.booking_days > 14 && this.summa.booking_days <= 31) {
            if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_15_30
              this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.days_15_30
              this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
            }
            if (this.summa.dop_hours >= 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_15_30
              this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.days_15_30
              this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog)
            }
            if (this.summa.dop_hours === 0) {
              this.summa.summa = this.summa.booking_days * this.summa.car.days_15_30;
              this.summa.tariff[0].summa = this.summa.booking_days * this.summa.car.days_15_30;
              this.summa.summaFull = +this.summa.summa + +this.summa.car.zalog;
            }
          }
          else if (this.summa.booking_days > 31) {
            if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_31_more
              this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.days_31_more
              this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
            }
            if (this.summa.dop_hours >= 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_31_more
              this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.days_31_more
              this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog)
            }
            if (this.summa.dop_hours === 0) {
              this.summa.summa = this.summa.booking_days * this.summa.car.days_31_more;
              this.summa.tariff[0].summa = this.summa.booking_days * this.summa.car.days_31_more;
              this.summa.summaFull = +this.summa.summa + +this.summa.car.zalog;
            }
          }
        }
        else if (this.summa.tariff[0].name === 'Межгород') {
          if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.mezgorod
            this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.mezgorod
            this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog_mej) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
          }
          if (this.summa.dop_hours >= 12) {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.mezgorod
            this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.mezgorod
            this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog_mej)
          }
          if (this.summa.dop_hours === 0) {
            this.summa.summa = this.summa.booking_days * this.summa.car.mezgorod;
            this.summa.tariff[0].summa = this.summa.booking_days * this.summa.car.mezgorod;
            this.summa.summaFull = +this.summa.summa + +this.summa.car.zalog_mej;
          }
        }
        else if (this.summa.tariff[0].name === 'Россия') {
          if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.russia
            this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.russia
            this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog_rus) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
          }
          if (this.summa.dop_hours >= 12) {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.russia
            this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.russia
            this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog_rus)
          }
          if (this.summa.dop_hours === 0) {
            this.summa.summa = this.summa.booking_days * this.summa.car.russia;
            this.summa.tariff[0].summa = this.summa.booking_days * this.summa.car.russia;
            this.summa.summaFull = +this.summa.summa + +this.summa.car.zalog_rus;
          }
        }
      }
    }
    else {
      if (this.summa.tariff[0].name !== '' && this.summa.booking_start !== '' && this.summa.booking_end !== '') {
        if (this.summa.tariff[0].name === 'Город') {
          if (this.summa.booking_days < 3) {
            if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_1_2
              this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.days_1_2
              this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
            }
            if (this.summa.dop_hours >= 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_1_2
              this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.days_1_2
              this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl)
            }
            if (this.summa.dop_hours === 0) {
              this.summa.summa = this.summa.booking_days * this.summa.car.days_1_2;
              this.summa.tariff[0].summa = this.summa.booking_days * this.summa.car.days_1_2;
              this.summa.summaFull = +this.summa.summa + +this.form.value.isCustomeZalogControl;
            }

          }
          else if (this.summa.booking_days >= 3 && this.summa.booking_days <= 7) {
            if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_3_7
              this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.days_3_7
              this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
            }
            if (this.summa.dop_hours >= 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_3_7
              this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.days_3_7
              this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl)
            }
            if (this.summa.dop_hours === 0) {
              this.summa.summa = this.summa.booking_days * this.summa.car.days_3_7;
              this.summa.tariff[0].summa = this.summa.booking_days * this.summa.car.days_3_7;
              this.summa.summaFull = +this.summa.summa + +this.form.value.isCustomeZalogControl;
            }
          }
          else if (this.summa.booking_days > 7 && this.summa.booking_days <= 14) {
            if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_8_14
              this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.days_8_14
              this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
            }
            if (this.summa.dop_hours >= 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_8_14
              this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.days_8_14
              this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl)
            }
            if (this.summa.dop_hours === 0) {
              this.summa.summa = this.summa.booking_days * this.summa.car.days_8_14;
              this.summa.tariff[0].summa = this.summa.booking_days * this.summa.car.days_8_14;
              this.summa.summaFull = +this.summa.summa + +this.form.value.isCustomeZalogControl;
            }
          }
          else if (this.summa.booking_days > 14 && this.summa.booking_days <= 31) {
            if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_15_30
              this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.days_15_30
              this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
            }
            if (this.summa.dop_hours >= 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_15_30
              this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.days_15_30
              this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl)
            }
            if (this.summa.dop_hours === 0) {
              this.summa.summa = this.summa.booking_days * this.summa.car.days_15_30;
              this.summa.tariff[0].summa = this.summa.booking_days * this.summa.car.days_15_30;
              this.summa.summaFull = +this.summa.summa + +this.form.value.isCustomeZalogControl;
            }
          }
          else if (this.summa.booking_days > 31) {
            if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_31_more
              this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.days_31_more
              this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
            }
            if (this.summa.dop_hours >= 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_31_more
              this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.days_31_more
              this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl)
            }
            if (this.summa.dop_hours === 0) {
              this.summa.summa = this.summa.booking_days * this.summa.car.days_31_more;
              this.summa.tariff[0].summa = this.summa.booking_days * this.summa.car.days_31_more;
              this.summa.summaFull = +this.summa.summa + +this.form.value.isCustomeZalogControl;
            }
          }
        }
        else if (this.summa.tariff[0].name === 'Межгород') {
          if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.mezgorod
            this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.mezgorod
            this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
          }
          if (this.summa.dop_hours >= 12) {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.mezgorod
            this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.mezgorod
            this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl)
          }
          if (this.summa.dop_hours === 0) {
            this.summa.summa = this.summa.booking_days * this.summa.car.mezgorod;
            this.summa.tariff[0].summa = this.summa.booking_days * this.summa.car.mezgorod;
            this.summa.summaFull = +this.summa.summa + +this.form.value.isCustomeZalogControl;
          }
        }
        else if (this.summa.tariff[0].name === 'Россия') {
          if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.russia
            this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.russia
            this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
          }
          if (this.summa.dop_hours >= 12) {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.russia
            this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.russia
            this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl)
          }
          if (this.summa.dop_hours === 0) {
            this.summa.summa = this.summa.booking_days * this.summa.car.russia;
            this.summa.tariff[0].summa = this.summa.booking_days * this.summa.car.russia;
            this.summa.summaFull = +this.summa.summa + +this.form.value.isCustomeZalogControl;
          }
        }

      }
    }

  }


  // При выборе конца аренды
  bookingEndDate(e: any) {

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

    if (!Number.isInteger(dop_hour_days)) {
      this.summa.dop_hours = Math.floor(((booking_end__x - booking_start__x) / (1000 * 60 * 60)) % 24);
    }
    else {
      this.summa.dop_hours = 0
    }



    // Назначаем переменную для колличества дней аренды
    this.summa.booking_days = (booking_end__x - booking_start__x) / (1000 * 60 * 60 * 24);

    if (!this.isCustomeZalog) {
      if (this.summa.tariff[0] && this.summa.booking_start !== '' && this.summa.booking_end !== '') {
        if (this.summa.tariff[0].name === 'Город') {
          if (this.summa.booking_days < 3) {
            if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_1_2
              this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.days_1_2
              this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
            }
            if (this.summa.dop_hours >= 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_1_2
              this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.days_1_2
              this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog)
            }
            if (this.summa.dop_hours === 0) {
              this.summa.summa = this.summa.booking_days * this.summa.car.days_1_2;
              this.summa.tariff[0].summa = this.summa.booking_days * this.summa.car.days_1_2;
              this.summa.summaFull = +this.summa.summa + +this.summa.car.zalog;
            }

          }
          else if (this.summa.booking_days >= 3 && this.summa.booking_days <= 7) {
            if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_3_7
              this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.days_3_7
              this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
            }
            if (this.summa.dop_hours >= 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_3_7
              this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.days_3_7
              this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog)
            }
            if (this.summa.dop_hours === 0) {
              this.summa.summa = this.summa.booking_days * this.summa.car.days_3_7;
              this.summa.tariff[0].summa = this.summa.booking_days * this.summa.car.days_3_7;
              this.summa.summaFull = +this.summa.summa + +this.summa.car.zalog;
            }
          }
          else if (this.summa.booking_days > 7 && this.summa.booking_days <= 14) {
            if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_8_14
              this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.days_8_14
              this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
            }
            if (this.summa.dop_hours >= 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_8_14
              this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.days_8_14
              this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog)
            }
            if (this.summa.dop_hours === 0) {
              this.summa.summa = this.summa.booking_days * this.summa.car.days_8_14;
              this.summa.tariff[0].summa = this.summa.booking_days * this.summa.car.days_8_14;
              this.summa.summaFull = +this.summa.summa + +this.summa.car.zalog;
            }
          }
          else if (this.summa.booking_days > 14 && this.summa.booking_days <= 31) {
            if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_15_30
              this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.days_15_30
              this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
            }
            if (this.summa.dop_hours >= 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_15_30
              this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.days_15_30
              this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog)
            }
            if (this.summa.dop_hours === 0) {
              this.summa.summa = this.summa.booking_days * this.summa.car.days_15_30;
              this.summa.tariff[0].summa = this.summa.booking_days * this.summa.car.days_15_30;
              this.summa.summaFull = +this.summa.summa + +this.summa.car.zalog;
            }
          }
          else if (this.summa.booking_days > 31) {
            if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_31_more
              this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.days_31_more
              this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
            }
            if (this.summa.dop_hours >= 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_31_more
              this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.days_31_more
              this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog)
            }
            if (this.summa.dop_hours === 0) {
              this.summa.summa = this.summa.booking_days * this.summa.car.days_31_more;
              this.summa.tariff[0].summa = this.summa.booking_days * this.summa.car.days_31_more;
              this.summa.summaFull = +this.summa.summa + +this.summa.car.zalog;
            }
          }
        }
        else if (this.summa.tariff[0].name === 'Межгород') {
          if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.mezgorod
            this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.mezgorod
            this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog_mej) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
          }
          if (this.summa.dop_hours >= 12) {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.mezgorod
            this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.mezgorod
            this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog_mej)
          }
          if (this.summa.dop_hours === 0) {
            this.summa.summa = this.summa.booking_days * this.summa.car.mezgorod;
            this.summa.tariff[0].summa = this.summa.booking_days * this.summa.car.mezgorod;
            this.summa.summaFull = +this.summa.summa + +this.summa.car.zalog_mej;
          }
        }
        else if (this.summa.tariff[0].name === 'Россия') {
          if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.russia
            this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.russia
            this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog_rus) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
          }
          if (this.summa.dop_hours >= 12) {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.russia
            this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.russia
            this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog_rus)
          }
          if (this.summa.dop_hours === 0) {
            this.summa.summa = this.summa.booking_days * this.summa.car.russia;
            this.summa.tariff[0].summa = this.summa.booking_days * this.summa.car.russia;
            this.summa.summaFull = +this.summa.summa + +this.summa.car.zalog_rus;
          }
        }
      }
    }
    else {
      if (this.summa.tariff[0].name !== '' && this.summa.booking_start !== '' && this.summa.booking_end !== '') {
        if (this.summa.tariff[0].name === 'Город') {
          if (this.summa.booking_days < 3) {
            if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_1_2
              this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.days_1_2
              this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
            }
            if (this.summa.dop_hours >= 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_1_2
              this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.days_1_2
              this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl)
            }
            if (this.summa.dop_hours === 0) {
              this.summa.summa = this.summa.booking_days * this.summa.car.days_1_2;
              this.summa.tariff[0].summa = this.summa.booking_days * this.summa.car.days_1_2;
              this.summa.summaFull = +this.summa.summa + +this.form.value.isCustomeZalogControl;
            }

          }
          else if (this.summa.booking_days >= 3 && this.summa.booking_days <= 7) {
            if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_3_7
              this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.days_3_7
              this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
            }
            if (this.summa.dop_hours >= 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_3_7
              this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.days_3_7
              this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl)
            }
            if (this.summa.dop_hours === 0) {
              this.summa.summa = this.summa.booking_days * this.summa.car.days_3_7;
              this.summa.tariff[0].summa = this.summa.booking_days * this.summa.car.days_3_7;
              this.summa.summaFull = +this.summa.summa + +this.form.value.isCustomeZalogControl;
            }
          }
          else if (this.summa.booking_days > 7 && this.summa.booking_days <= 14) {
            if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_8_14
              this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.days_8_14
              this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
            }
            if (this.summa.dop_hours >= 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_8_14
              this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.days_8_14
              this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl)
            }
            if (this.summa.dop_hours === 0) {
              this.summa.summa = this.summa.booking_days * this.summa.car.days_8_14;
              this.summa.tariff[0].summa = this.summa.booking_days * this.summa.car.days_8_14;
              this.summa.summaFull = +this.summa.summa + +this.form.value.isCustomeZalogControl;
            }
          }
          else if (this.summa.booking_days > 14 && this.summa.booking_days <= 31) {
            if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_15_30
              this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.days_15_30
              this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
            }
            if (this.summa.dop_hours >= 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_15_30
              this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.days_15_30
              this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl)
            }
            if (this.summa.dop_hours === 0) {
              this.summa.summa = this.summa.booking_days * this.summa.car.days_15_30;
              this.summa.tariff[0].summa = this.summa.booking_days * this.summa.car.days_15_30;
              this.summa.summaFull = +this.summa.summa + +this.form.value.isCustomeZalogControl;
            }
          }
          else if (this.summa.booking_days > 31) {
            if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_31_more
              this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.days_31_more
              this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
            }
            if (this.summa.dop_hours >= 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_31_more
              this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.days_31_more
              this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl)
            }
            if (this.summa.dop_hours === 0) {
              this.summa.summa = this.summa.booking_days * this.summa.car.days_31_more;
              this.summa.tariff[0].summa = this.summa.booking_days * this.summa.car.days_31_more;
              this.summa.summaFull = +this.summa.summa + +this.form.value.isCustomeZalogControl;
            }
          }
        }
        else if (this.summa.tariff[0].name === 'Межгород') {
          if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.mezgorod
            this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.mezgorod
            this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
          }
          if (this.summa.dop_hours >= 12) {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.mezgorod
            this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.mezgorod
            this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl)
          }
          if (this.summa.dop_hours === 0) {
            this.summa.summa = this.summa.booking_days * this.summa.car.mezgorod;
            this.summa.tariff[0].summa = this.summa.booking_days * this.summa.car.mezgorod;
            this.summa.summaFull = +this.summa.summa + +this.form.value.isCustomeZalogControl;
          }
        }
        else if (this.summa.tariff[0].name === 'Россия') {
          if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.russia
            this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.russia
            this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
          }
          if (this.summa.dop_hours >= 12) {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.russia
            this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.russia
            this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl)
          }
          if (this.summa.dop_hours === 0) {
            this.summa.summa = this.summa.booking_days * this.summa.car.russia;
            this.summa.tariff[0].summa = this.summa.booking_days * this.summa.car.russia;
            this.summa.summaFull = +this.summa.summa + +this.form.value.isCustomeZalogControl;
          }
        }

      }
    }
  }


  // При ваыборе тарифа
  onChangeTariff(e: any) {
    if (this.form.value.booking_start) {
      this.form.controls['place_start'].enable();
    }
    this.form.controls['additional_services_chair'].enable();
    this.form.controls['additional_services_buster'].enable();
    this.form.controls['additional_services_videoregister'].enable();
    this.form.controls['additional_services_battery_charger'].enable();
    this.form.controls['additional_services_antiradar'].enable();
    this.form.controls['additional_services_moyka'].enable();
    this.form.controls['isCustomePlaceStartControlclick'].enable();
    this.form.controls['isCustomeZalogControlclick'].enable();


    if (e !== 'Смешанный') {
      // Обнуляем массив с тарифами
      this.isMixedTarif = false;
      this.summa.tariff.splice(0, this.summa.tariff.length);


     

      // Получаем тариф
      this.summa.tariff.push({
        name: e,
        days: this.summa.booking_days,
        summa: 0
      })


      if (!this.isCustomeZalog) {
        if (this.summa.tariff[0].name !== '' && this.summa.booking_start !== '' && this.summa.booking_end !== '') {
          if (this.summa.tariff[0].name === 'Город') {
            if (this.summa.booking_days < 3) {
              if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
                this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_1_2
                this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.days_1_2
                this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
              }
              if (this.summa.dop_hours >= 12) {
                this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_1_2
                this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.days_1_2
                this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog)
              }
              if (this.summa.dop_hours === 0) {
                this.summa.summa = this.summa.booking_days * this.summa.car.days_1_2;
                this.summa.tariff[0].summa = this.summa.booking_days * this.summa.car.days_1_2;
                this.summa.summaFull = +this.summa.summa + +this.summa.car.zalog;
              }

            }
            else if (this.summa.booking_days >= 3 && this.summa.booking_days <= 7) {
              if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
                this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_3_7
                this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.days_3_7
                this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
              }
              if (this.summa.dop_hours >= 12) {
                this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_3_7
                this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.days_3_7
                this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog)
              }
              if (this.summa.dop_hours === 0) {
                this.summa.summa = this.summa.booking_days * this.summa.car.days_3_7;
                this.summa.tariff[0].summa = this.summa.booking_days * this.summa.car.days_3_7;
                this.summa.summaFull = +this.summa.summa + +this.summa.car.zalog;
              }
            }
            else if (this.summa.booking_days > 7 && this.summa.booking_days <= 14) {
              if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
                this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_8_14
                this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.days_8_14
                this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
              }
              if (this.summa.dop_hours >= 12) {
                this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_8_14
                this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.days_8_14
                this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog)
              }
              if (this.summa.dop_hours === 0) {
                this.summa.summa = this.summa.booking_days * this.summa.car.days_8_14;
                this.summa.tariff[0].summa = this.summa.booking_days * this.summa.car.days_8_14;
                this.summa.summaFull = +this.summa.summa + +this.summa.car.zalog;
              }
            }
            else if (this.summa.booking_days > 14 && this.summa.booking_days <= 31) {
              if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
                this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_15_30
                this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.days_15_30
                this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
              }
              if (this.summa.dop_hours >= 12) {
                this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_15_30
                this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.days_15_30
                this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog)
              }
              if (this.summa.dop_hours === 0) {
                this.summa.summa = this.summa.booking_days * this.summa.car.days_15_30;
                this.summa.tariff[0].summa = this.summa.booking_days * this.summa.car.days_15_30;
                this.summa.summaFull = +this.summa.summa + +this.summa.car.zalog;
              }
            }
            else if (this.summa.booking_days > 31) {
              if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
                this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_31_more
                this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.days_31_more
                this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
              }
              if (this.summa.dop_hours >= 12) {
                this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_31_more
                this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.days_31_more
                this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog)
              }
              if (this.summa.dop_hours === 0) {
                this.summa.summa = this.summa.booking_days * this.summa.car.days_31_more;
                this.summa.tariff[0].summa = this.summa.booking_days * this.summa.car.days_31_more;
                this.summa.summaFull = +this.summa.summa + +this.summa.car.zalog;
              }
            }
          }
          else if (this.summa.tariff[0].name === 'Межгород') {
            if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.mezgorod
              this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.mezgorod
              this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog_mej) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
            }
            if (this.summa.dop_hours >= 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.mezgorod
              this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.mezgorod
              this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog_mej)
            }
            if (this.summa.dop_hours === 0) {
              this.summa.summa = this.summa.booking_days * this.summa.car.mezgorod;
              this.summa.tariff[0].summa = this.summa.booking_days * this.summa.car.mezgorod;
              this.summa.summaFull = +this.summa.summa + +this.summa.car.zalog_mej;
            }
          }
          else if (this.summa.tariff[0].name === 'Россия') {
            if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.russia
              this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.russia
              this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog_rus) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
            }
            if (this.summa.dop_hours >= 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.russia
              this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.russia
              this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog_rus)
            }
            if (this.summa.dop_hours === 0) {
              this.summa.summa = this.summa.booking_days * this.summa.car.russia;
              this.summa.tariff[0].summa = this.summa.booking_days * this.summa.car.russia;
              this.summa.summaFull = +this.summa.summa + +this.summa.car.zalog_rus;
            }
          }

        }

      }
      else {
        if (this.summa.tariff[0].name !== '' && this.summa.booking_start !== '' && this.summa.booking_end !== '') {
          if (this.summa.tariff[0].name === 'Город') {
            if (this.summa.booking_days < 3) {
              if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
                this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_1_2
                this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.days_1_2
                this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
              }
              if (this.summa.dop_hours >= 12) {
                this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_1_2
                this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.days_1_2
                this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl)
              }
              if (this.summa.dop_hours === 0) {
                this.summa.summa = this.summa.booking_days * this.summa.car.days_1_2;
                this.summa.tariff[0].summa = this.summa.booking_days * this.summa.car.days_1_2;
                this.summa.summaFull = +this.summa.summa + +this.form.value.isCustomeZalogControl;
              }

            }
            else if (this.summa.booking_days >= 3 && this.summa.booking_days <= 7) {
              if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
                this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_3_7
                this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.days_3_7
                this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
              }
              if (this.summa.dop_hours >= 12) {
                this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_3_7
                this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.days_3_7
                this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl)
              }
              if (this.summa.dop_hours === 0) {
                this.summa.summa = this.summa.booking_days * this.summa.car.days_3_7;
                this.summa.tariff[0].summa = this.summa.booking_days * this.summa.car.days_3_7;
                this.summa.summaFull = +this.summa.summa + +this.form.value.isCustomeZalogControl;
              }
            }
            else if (this.summa.booking_days > 7 && this.summa.booking_days <= 14) {
              if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
                this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_8_14
                this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.days_8_14
                this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
              }
              if (this.summa.dop_hours >= 12) {
                this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_8_14
                this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.days_8_14
                this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl)
              }
              if (this.summa.dop_hours === 0) {
                this.summa.summa = this.summa.booking_days * this.summa.car.days_8_14;
                this.summa.tariff[0].summa = this.summa.booking_days * this.summa.car.days_8_14;
                this.summa.summaFull = +this.summa.summa + +this.form.value.isCustomeZalogControl;
              }
            }
            else if (this.summa.booking_days > 14 && this.summa.booking_days <= 31) {
              if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
                this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_15_30
                this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.days_15_30
                this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
              }
              if (this.summa.dop_hours >= 12) {
                this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_15_30
                this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.days_15_30
                this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl)
              }
              if (this.summa.dop_hours === 0) {
                this.summa.summa = this.summa.booking_days * this.summa.car.days_15_30;
                this.summa.tariff[0].summa = this.summa.booking_days * this.summa.car.days_15_30;
                this.summa.summaFull = +this.summa.summa + +this.form.value.isCustomeZalogControl;
              }
            }
            else if (this.summa.booking_days > 31) {
              if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
                this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_31_more
                this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.days_31_more
                this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
              }
              if (this.summa.dop_hours >= 12) {
                this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_31_more
                this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.days_31_more
                this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl)
              }
              if (this.summa.dop_hours === 0) {
                this.summa.summa = this.summa.booking_days * this.summa.car.days_31_more;
                this.summa.tariff[0].summa = this.summa.booking_days * this.summa.car.days_31_more;
                this.summa.summaFull = +this.summa.summa + +this.form.value.isCustomeZalogControl;
              }
            }
          }
          else if (this.summa.tariff[0].name === 'Межгород') {
            if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.mezgorod
              this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.mezgorod
              this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
            }
            if (this.summa.dop_hours >= 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.mezgorod
              this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.mezgorod
              this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl)
            }
            if (this.summa.dop_hours === 0) {
              this.summa.summa = this.summa.booking_days * this.summa.car.mezgorod;
              this.summa.tariff[0].summa = this.summa.booking_days * this.summa.car.mezgorod;
              this.summa.summaFull = +this.summa.summa + +this.form.value.isCustomeZalogControl;
            }
          }
          else if (this.summa.tariff[0].name === 'Россия') {
            if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.russia
              this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.russia
              this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
            }
            if (this.summa.dop_hours >= 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.russia
              this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.russia
              this.summa.summaFull = +this.summa.summa + (+this.form.value.isCustomeZalogControl)
            }
            if (this.summa.dop_hours === 0) {
              this.summa.summa = this.summa.booking_days * this.summa.car.russia;
              this.summa.tariff[0].summa = this.summa.booking_days * this.summa.car.russia;
              this.summa.summaFull = +this.summa.summa + +this.form.value.isCustomeZalogControl;
            }
          }

        }
      }
    }
    else {
      // Обнуляем массив с тарифами
      this.isMixedTarif = true;
      this.summa.tariff.splice(0, this.summa.tariff.length);


      this.form.controls['tarif_mixed_gorod_days'].disable();
      this.form.controls['tarif_mixed_mezjgorod_days'].disable();
      this.form.controls['tarif_mixed_russia_days'].disable();
      this.xs_isCustomeZalogCheck();

      this.form.patchValue({
        isCustomeZalogControlclick: true,
      })
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
    }
    else {
      this.form.patchValue({
        tarif_mixed_gorod_days: null,
      });

      this.form.controls['tarif_mixed_gorod_days'].disable();
      this.summa.tariff = this.summa.tariff.filter((t) => t.name !== 'Город')
      this.SummaMixedTarif.tarifGorod.summa = 0
    }
  }
  // При вводе колличества дней смешанного тарифа город
  onChangeMixedTarifGorodDays(e) {
    if (this.form.value.isCustomeZalogControl) {
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
                  this.SummaMixedTarif.tarifGorod.summaFull = +this.SummaMixedTarif.tarifGorod.summa  + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
                  tarif.summa = this.SummaMixedTarif.tarifGorod.summa
                }
                if (this.summa.dop_hours >= 12) {
                  this.SummaMixedTarif.tarifGorod.summa = Math.round(this.form.value.tarif_mixed_gorod_days) * this.summa.car.days_1_2
                  this.SummaMixedTarif.tarifGorod.summaFull = +this.SummaMixedTarif.tarifGorod.summa  + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
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
                  this.SummaMixedTarif.tarifGorod.summaFull = +this.SummaMixedTarif.tarifGorod.summa  + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
                  tarif.summa = this.SummaMixedTarif.tarifGorod.summa
                }
                if (this.summa.dop_hours >= 12) {
                  this.SummaMixedTarif.tarifGorod.summa = Math.round(this.form.value.tarif_mixed_gorod_days) * this.summa.car.days_3_7
                  this.SummaMixedTarif.tarifGorod.summaFull = +this.SummaMixedTarif.tarifGorod.summa  + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
                  tarif.summa = this.SummaMixedTarif.tarifGorod.summa
                }
                if (this.summa.dop_hours === 0) {
                  this.SummaMixedTarif.tarifGorod.summa = this.form.value.tarif_mixed_gorod_days * this.summa.car.days_3_7;
                  this.SummaMixedTarif.tarifGorod.summaFull = +this.SummaMixedTarif.tarifGorod.summa  + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
                  tarif.summa = this.SummaMixedTarif.tarifGorod.summa
                }
              }
              else if (this.form.value.tarif_mixed_gorod_days > 7 && this.form.value.tarif_mixed_gorod_days <= 14) {
                if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
                  this.SummaMixedTarif.tarifGorod.summa = Math.round(this.form.value.tarif_mixed_gorod_days) * this.summa.car.days_8_14
                  this.SummaMixedTarif.tarifGorod.summaFull = +this.SummaMixedTarif.tarifGorod.summa  + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
                  tarif.summa = this.SummaMixedTarif.tarifGorod.summa
                }
                if (this.summa.dop_hours >= 12) {
                  this.SummaMixedTarif.tarifGorod.summa = Math.round(this.form.value.tarif_mixed_gorod_days) * this.summa.car.days_8_14
                  this.SummaMixedTarif.tarifGorod.summaFull = +this.SummaMixedTarif.tarifGorod.summa  + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
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
                  this.SummaMixedTarif.tarifGorod.summaFull = +this.SummaMixedTarif.tarifGorod.summa  + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
                  tarif.summa = this.SummaMixedTarif.tarifGorod.summa
                }
                if (this.summa.dop_hours >= 12) {
                  this.SummaMixedTarif.tarifGorod.summa = Math.round(this.form.value.tarif_mixed_gorod_days) * this.summa.car.days_15_30
                  this.SummaMixedTarif.tarifGorod.summaFull = +this.SummaMixedTarif.tarifGorod.summa  + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
                  tarif.summa = this.SummaMixedTarif.tarifGorod.summa
                }
                if (this.summa.dop_hours === 0) {
                  this.SummaMixedTarif.tarifGorod.summa = this.form.value.tarif_mixed_gorod_days * this.summa.car.days_15_30;
                  this.SummaMixedTarif.tarifGorod.summaFull = +this.SummaMixedTarif.tarifGorod.summa  + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
                  tarif.summa = this.SummaMixedTarif.tarifGorod.summa
                }
              }
              else if (this.form.value.tarif_mixed_gorod_days > 31) {
                if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
                  this.SummaMixedTarif.tarifGorod.summa = Math.round(this.form.value.tarif_mixed_gorod_days) * this.summa.car.days_31_more
                  this.SummaMixedTarif.tarifGorod.summaFull = +this.SummaMixedTarif.tarifGorod.summa  + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
                  tarif.summa = this.SummaMixedTarif.tarifGorod.summa
                }
                if (this.summa.dop_hours >= 12) {
                  this.SummaMixedTarif.tarifGorod.summa = Math.round(this.form.value.tarif_mixed_gorod_days) * this.summa.car.days_31_more
                  this.SummaMixedTarif.tarifGorod.summaFull = +this.SummaMixedTarif.tarifGorod.summa  + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
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
        });
      }
      else {
        this.summa.tariff.forEach(element => {
          if (element.name === 'Город') {
            element.days = 0
          }
        });
      }
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
    }
    else {
      this.form.patchValue({
        tarif_mixed_mezjgorod_days: null,
      });
      this.form.controls['tarif_mixed_mezjgorod_days'].disable();
      this.summa.tariff = this.summa.tariff.filter((t) => t.name !== 'Межгород')
      this.SummaMixedTarif.tarifMezjGorod.summa = 0
    }
  }

  // При вводе колличества дней смешанного тарифа Межгород
  onChangeMixedTarifMezjGorodDays(e) {
    if (this.form.value.isCustomeZalogControl) {
      if (this.form.value.tarif_mixed_mezjgorod_days) {
        this.summa.tariff.forEach(tarif => {
          if (tarif.name === 'Межгород') {
            tarif.days = this.form.value.tarif_mixed_mezjgorod_days
            this.SummaMixedTarif.tarifMezjGorod.days = this.form.value.tarif_mixed_mezjgorod_days

            if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
              this.SummaMixedTarif.tarifMezjGorod.summa = Math.round(this.form.value.tarif_mixed_mezjgorod_days) * this.summa.car.mezgorod
              this.SummaMixedTarif.tarifMezjGorod.summaFull = +this.SummaMixedTarif.tarifMezjGorod.summa  + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
              tarif.summa = this.SummaMixedTarif.tarifMezjGorod.summa
            }
            if (this.summa.dop_hours >= 12) {
              this.SummaMixedTarif.tarifMezjGorod.summa = Math.round(this.form.value.tarif_mixed_mezjgorod_days) * this.summa.car.mezgorod
              this.SummaMixedTarif.tarifMezjGorod.summaFull = +this.SummaMixedTarif.tarifMezjGorod.summa + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
              tarif.summa = this.SummaMixedTarif.tarifMezjGorod.summa
            }
            if (this.summa.dop_hours === 0) {
              this.SummaMixedTarif.tarifMezjGorod.summa = this.form.value.tarif_mixed_mezjgorod_days * this.summa.car.mezgorod;
              this.SummaMixedTarif.tarifMezjGorod.summaFull = +this.SummaMixedTarif.tarifMezjGorod.summa  + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
              tarif.summa = this.SummaMixedTarif.tarifMezjGorod.summa
            }
          }
        });
      }
      else {
        this.summa.tariff.forEach(element => {
          if (element.name === 'Межгород') {
            element.days = 0
          }
        });
      }
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
    }
    else {
      this.form.patchValue({
        tarif_mixed_russia_days: null,
      });
      this.form.controls['tarif_mixed_russia_days'].disable();
      this.summa.tariff = this.summa.tariff.filter((t) => t.name !== 'Россия')
      this.SummaMixedTarif.tarifRussia.summa = 0
    }
  }

  // При вводе колличества дней смешанного тарифа Россия
  onChangeMixedTarifRussiaDays(e) {
    if (this.form.value.isCustomeZalogControl) {
      if (this.form.value.tarif_mixed_russia_days) {
        this.summa.tariff.forEach(tarif => {
          if (tarif.name === 'Россия') {
            tarif.days = this.form.value.tarif_mixed_russia_days
            this.SummaMixedTarif.tarifRussia.days = this.form.value.tarif_mixed_russia_days


            if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
              this.SummaMixedTarif.tarifRussia.summa = Math.round(this.form.value.tarif_mixed_russia_days) * this.summa.car.russia
              this.SummaMixedTarif.tarifRussia.summaFull = +this.SummaMixedTarif.tarifRussia.summa  + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
              tarif.summa = this.SummaMixedTarif.tarifRussia.summa
            }
            if (this.summa.dop_hours >= 12) {
              this.SummaMixedTarif.tarifRussia.summa = Math.round(this.form.value.tarif_mixed_russia_days) * this.summa.car.russia
              this.SummaMixedTarif.tarifRussia.summaFull = +this.SummaMixedTarif.tarifRussia.summa + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
              tarif.summa = this.SummaMixedTarif.tarifRussia.summa
            }
            if (this.summa.dop_hours === 0) {
              this.SummaMixedTarif.tarifRussia.summa = this.form.value.tarif_mixed_russia_days * this.summa.car.russia;
              this.SummaMixedTarif.tarifRussia.summaFull = +this.SummaMixedTarif.tarifRussia.summa  + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
              tarif.summa = this.SummaMixedTarif.tarifRussia.summa
            }
          }
        });
      }
      else {
        this.summa.tariff.forEach(element => {
          if (element.name === 'Россия') {
            element.days = 0
          }
        });
      }
    }
  }






  // При выборе типа клиента
  changeTypeClient(e) {
    if (this.form.value.booking_start) {
      this.form.controls['tariff'].enable();
    }

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
        if (this.xs_actual_client_type === 'fiz') {
          this.modal2.open();
        }

      }

    })
  }



  // При выборе места подачи авто
  onChangePlaceStart(e) {

    if (this.form.value.booking_start) {
      this.form.controls['place_end'].enable();
    }

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






  // При выборе места приема авто
  onChangePlaceEnd(e) {


    if (e === 'Аэропорт') {
      this.summa.place_end_price = +this.currentUserSetings.input_avto.airport_price_input
    }
    else if (e === 'Ж/д вокзал') {
      this.summa.place_end_price = +this.currentUserSetings.input_avto.railway_price_input

    }
    else if (e === 'ТЦ Кристалл') {
      this.summa.place_end_price = +this.currentUserSetings.input_avto.kristal_tc_price_input

    }
    else if (e === 'Тц Сити Молл') {
      this.summa.place_end_price = +this.currentUserSetings.input_avto.sitymol_tc_price_input

    }
    else if (e === 'Офис') {
      this.summa.place_end_price = 0

    }
  }




  // При выборе доп услуги
  onChangeAdditionalServicesInput(e) {
    if (this.form.value.additional_services_moyka) {
      if (this.summa.car.category === 'Комфорт') {
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
      else if (this.summa.car.category === 'Бизнес') {
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
      else if (this.summa.car.category === 'Премиум') {
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

    } else {
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


  // Получаем данные для поиска юр лица
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


  // Проверяем нажат ли чекбокс для кастомного залога
  xs_isCustomeZalogCheck() {

    this.isCustomeZalog = !this.isCustomeZalog;

    if (!this.isCustomeZalog) {
      if (this.summa.tariff[0].name !== '' && this.summa.booking_start !== '' && this.summa.booking_end !== '') {
        if (this.summa.tariff[0].name === 'Город') {
          if (this.summa.booking_days < 3) {
            if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_1_2
              this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.days_1_2
              this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
            }
            if (this.summa.dop_hours >= 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_1_2
              this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.days_1_2
              this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog)
            }
            if (this.summa.dop_hours === 0) {
              this.summa.summa = this.summa.booking_days * this.summa.car.days_1_2;
              this.summa.tariff[0].summa = this.summa.booking_days * this.summa.car.days_1_2;
              this.summa.summaFull = +this.summa.summa + +this.summa.car.zalog;
            }

          }
          else if (this.summa.booking_days >= 3 && this.summa.booking_days <= 7) {
            if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_3_7
              this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.days_3_7
              this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
            }
            if (this.summa.dop_hours >= 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_3_7
              this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.days_3_7
              this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog)
            }
            if (this.summa.dop_hours === 0) {
              this.summa.summa = this.summa.booking_days * this.summa.car.days_3_7;
              this.summa.tariff[0].summa = this.summa.booking_days * this.summa.car.days_3_7;
              this.summa.summaFull = +this.summa.summa + +this.summa.car.zalog;
            }
          }
          else if (this.summa.booking_days > 7 && this.summa.booking_days <= 14) {
            if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_8_14
              this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.days_8_14
              this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
            }
            if (this.summa.dop_hours >= 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_8_14
              this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.days_8_14
              this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog)
            }
            if (this.summa.dop_hours === 0) {
              this.summa.summa = this.summa.booking_days * this.summa.car.days_8_14;
              this.summa.tariff[0].summa = this.summa.booking_days * this.summa.car.days_8_14;
              this.summa.summaFull = +this.summa.summa + +this.summa.car.zalog;
            }
          }
          else if (this.summa.booking_days > 14 && this.summa.booking_days <= 31) {
            if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_15_30
              this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.days_15_30
              this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
            }
            if (this.summa.dop_hours >= 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_15_30
              this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.days_15_30
              this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog)
            }
            if (this.summa.dop_hours === 0) {
              this.summa.summa = this.summa.booking_days * this.summa.car.days_15_30;
              this.summa.tariff[0].summa = this.summa.booking_days * this.summa.car.days_15_30;
              this.summa.summaFull = +this.summa.summa + +this.summa.car.zalog;
            }
          }
          else if (this.summa.booking_days > 31) {
            if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_31_more
              this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.days_31_more
              this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
            }
            if (this.summa.dop_hours >= 12) {
              this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.days_31_more
              this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.days_31_more
              this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog)
            }
            if (this.summa.dop_hours === 0) {
              this.summa.summa = this.summa.booking_days * this.summa.car.days_31_more;
              this.summa.tariff[0].summa = this.summa.booking_days * this.summa.car.days_31_more;
              this.summa.summaFull = +this.summa.summa + +this.summa.car.zalog;
            }
          }
        }
        else if (this.summa.tariff[0].name === 'Межгород') {
          if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.mezgorod
            this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.mezgorod
            this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog_mej) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
          }
          if (this.summa.dop_hours >= 12) {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.mezgorod
            this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.mezgorod
            this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog_mej)
          }
          if (this.summa.dop_hours === 0) {
            this.summa.summa = this.summa.booking_days * this.summa.car.mezgorod;
            this.summa.tariff[0].summa = this.summa.booking_days * this.summa.car.mezgorod;
            this.summa.summaFull = +this.summa.summa + +this.summa.car.zalog_mej;
          }
        }
        else if (this.summa.tariff[0].name === 'Россия') {
          if (this.summa.dop_hours > 0 && this.summa.dop_hours < 12) {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.russia
            this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.russia
            this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog_rus) + (+this.summa.car.price_dop_hour * this.summa.dop_hours)
          }
          if (this.summa.dop_hours >= 12) {
            this.summa.summa = Math.round(this.summa.booking_days) * this.summa.car.russia
            this.summa.tariff[0].summa = Math.round(this.summa.booking_days) * this.summa.car.russia
            this.summa.summaFull = +this.summa.summa + (+this.summa.car.zalog_rus)
          }
          if (this.summa.dop_hours === 0) {
            this.summa.summa = this.summa.booking_days * this.summa.car.russia;
            this.summa.tariff[0].summa = this.summa.booking_days * this.summa.car.russia;
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
  onCustomeZalogValue(e) {
    if (this.isMixedTarif && this.form.value.tarif_mixed_gorod) {
      this.onChangeMixedTarifGorodDays(e)
      this.onChangeMixedTarifMezjGorodDays(e)
      this.onChangeMixedTarifRussiaDays(e)
    }


    let xs_custome__zalog = e.target.value

    if (this.summa.tariff[0].name !== '' && this.summa.booking_start !== '' && this.summa.booking_end !== '') {
      if (this.summa.tariff[0].name === 'Город') {
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
      else if (this.summa.tariff[0].name === 'Межгород') {
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
      else if (this.summa.tariff[0].name === 'Россия') {
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
      isCustomePlaceInputControlPrice: '',
      isCustomePlaceInputControl: ''
    })
  }



  // Проверяем нажат ли чекбокс для кастомного места приема
  xs_isCustomePlaceInputCheck() {
    this.isCustomePlaceInput = !this.isCustomePlaceInput;

    this.form.patchValue({
      isCustomePlaceInputControlPrice: '',
      isCustomePlaceInputControl: ''
    })
  }



  onBlurMethod(e) {
    this.isCustomeZalogCheck = !this.isCustomeZalogCheck;
  }



  // Привыборе произольной суммы подачи авто
  onChangeisCustomePlaceStartControlPrice(e) {
    if (this.isCustomePlaceStart) {
      this.summa.place_start_price = +this.form.value.isCustomePlaceStartControlPrice || 0

      this.form.patchValue({
        place_start: this.form.value.isCustomePlaceStartControl,
      });
    }

  }



  // Привыборе произольной суммы приема авто
  onChangeisCustomePlaceInputControlPrice(e) {
    if (this.isCustomePlaceInput) {
      this.summa.place_end_price = +this.form.value.isCustomePlaceInputControlPrice || 0

      this.form.patchValue({
        place_end: this.form.value.isCustomePlaceInputControl,
      });
    }

  }



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


  onCloseModalCreate(e) {
    this.modal.close()
  }


  modalAddDogovor() {
    if (this.xs_actual_client_type === 'fiz') {
      this.modal2.open();
    }

    if (this.xs_actual_client_type === 'law') {
      this.modal3.open();
    }
  }

  checkedTarif() {

    

    if (this.form.value.tariff === 'Город') {
      if (this.summa.booking_days < 3) {
        this.tarifPrice.push({
          name: 'Город',
          price:  this.summa.car.days_1_2,
          days: this.summa.booking_days
        })
      }
      if (this.summa.booking_days >= 3 && this.summa.booking_days < 7) {
        this.tarifPrice.push({
          name: 'Город',
          price: this.summa.car.days_3_7,
          days: this.summa.booking_days
        })
      }
      if (this.summa.booking_days >= 7 && this.summa.booking_days < 14) {
        this.tarifPrice.push({
          name: 'Город',
          price: this.summa.car.days_8_14,
          days: this.summa.booking_days
        })
      }
      if (this.summa.booking_days >= 14 && this.summa.booking_days < 31) {
        this.tarifPrice.push({
          name: 'Город',
          price: this.summa.car.days_15_30,
          days: this.summa.booking_days
        })
      }
      if (this.summa.booking_days >= 31) {
        this.tarifPrice.push({
          name: 'Город',
          price: this.summa.car.days_31_more,
          days: this.summa.booking_days
        })
      }
    }
    else if (this.form.value.tariff === 'Межгород') {
      if (this.summa.booking_days < 3) {
        this.tarifPrice.push({
          name: 'Межгород',
          price: this.summa.car.mezgorod,
          days: this.summa.booking_days
        })
      }
      if (this.summa.booking_days >= 3 && this.summa.booking_days < 7) {
        this.tarifPrice.push({
          name: 'Межгород',
          price: this.summa.car.mezgorod,
          days: this.summa.booking_days
        })
      }
      if (this.summa.booking_days >= 7 && this.summa.booking_days < 14) {
        this.tarifPrice.push({
          name: 'Межгород',
          price: this.summa.car.mezgorod,
          days: this.summa.booking_days
        })
      }
      if (this.summa.booking_days >= 14 && this.summa.booking_days < 31) {
        this.tarifPrice.push({
          name: 'Межгород',
          price: this.summa.car.mezgorod,
          days: this.summa.booking_days
        })
      }
      if (this.summa.booking_days >= 31) {
        this.tarifPrice.push({
          name: 'Межгород',
          price: this.summa.car.mezgorod,
          days: this.summa.booking_days
        })
      }
    }
    else if (this.form.value.tariff === 'Россия') {
      if (this.summa.booking_days < 3) {
        this.tarifPrice.push({
          name: 'Россия',
          price: this.summa.car.russia,
          days: this.summa.booking_days
        })
      }
      if (this.summa.booking_days >= 3 && this.summa.booking_days < 7) {
        this.tarifPrice.push({
          name: 'Россия',
          price: this.summa.car.russia,
          days: this.summa.booking_days
        })
      }
      if (this.summa.booking_days >= 7 && this.summa.booking_days < 14) {
        this.tarifPrice.push({
          name: 'Россия',
          price: this.summa.car.russia,
          days: this.summa.booking_days
        })
      }
      if (this.summa.booking_days >= 14 && this.summa.booking_days < 31) {
        this.tarifPrice.push({
          name: 'Россия',
          price: this.summa.car.russia,
          days: this.summa.booking_days
        })
      }
      if (this.summa.booking_days >= 31) {
        this.tarifPrice.push({
          name: 'Россия',
          price: this.summa.car.russia,
          days: this.summa.booking_days
        })
      }
    }
    else if (this.form.value.tariff === 'Смешанный') {
      this.summa.tariff.forEach(tarif => {
        if (tarif.name === 'Город') {
          
          if (tarif.days < 3) {
            this.tarifPrice.push({
              name: 'Город',
              price: this.summa.car.days_1_2,
              days: tarif.days
            })
            
          }
          if (tarif.days >= 3 && tarif.days < 7) {
            this.tarifPrice.push({
              name: 'Город',
              price:  this.summa.car.days_3_7,
              days: tarif.days
            })
            
          }
          if (tarif.days >= 7 && tarif.days < 14) {
            this.tarifPrice.push({
              name: 'Город',
              price:  this.summa.car.days_8_14,
              days: tarif.days
            })
            
          }
          if (tarif.days >= 14 && tarif.days < 31) {
            
            this.tarifPrice.push({
              name: 'Город',
              price: this.summa.car.days_15_30,
              days: tarif.days
            })
          }
          if (tarif.days >= 31) {
            this.tarifPrice.push({
              name: 'Город',
              price: this.summa.car.days_31_more,
              days: tarif.days
            })
          }
        }
        else if (tarif.name === 'Межгород') {
          if (tarif.days < 3) {
            this.tarifPrice.push({
              name: 'Межгород',
              price: this.summa.car.mezgorod,
              days: tarif.days
            })
          }
          if (tarif.days >= 3 && tarif.days < 7) {
            this.tarifPrice.push({
              name: 'Межгород',
              price: this.summa.car.mezgorod,
              days: tarif.days
            })
          }
          if (tarif.days >= 7 && tarif.days < 14) {
            this.tarifPrice.push({
              name: 'Межгород',
              price: this.summa.car.mezgorod,
              days: tarif.days
            })
          }
          if (tarif.days >= 14 && tarif.days < 31) {
            this.tarifPrice.push({
              name: 'Межгород',
              price: this.summa.car.mezgorod,
              days: tarif.days
            })
          }
          if (tarif.days >= 31) {
            this.tarifPrice.push({
              name: 'Межгород',
              price: this.summa.car.mezgorod,
              days: tarif.days
            })
          }
        }
        else if (tarif.name === 'Россия') {
          if (tarif.days < 3) {
            this.tarifPrice.push({
              name: 'Россия',
              price: this.summa.car.russia,
              days: tarif.days
            })
          }
          if (tarif.days >= 3 && tarif.days < 7) {
            this.tarifPrice.push({
              name: 'Россия',
              price: this.summa.car.russia,
              days: tarif.days
            })
          }
          if (tarif.days >= 7 && tarif.days < 14) {
            this.tarifPrice.push({
              name: 'Россия',
              price: this.summa.car.russia,
              days: tarif.days
            })
          }
          if (tarif.days >= 14 && tarif.days < 31) {
            this.tarifPrice.push({
              name: 'Россия',
              price: this.summa.car.russia,
              days: tarif.days
            })
          }
          if (tarif.days >= 31) {
            this.tarifPrice.push({
              name: 'Россия',
              price: this.summa.car.russia,
              days: tarif.days
            })
          }
        }
      });
    }
  }



  onSubmit() {
    // Получаем значения начала и конца аренды
    const booking_start__x: any = new Date(this.form.value.booking_start);
    const booking_end__x: any = new Date(this.form.value.booking_end);

    // Получаем колличество дней если смешанный тариф
    const mixedDays = (+this.SummaMixedTarif.tarifGorod.days || 0) + (+this.SummaMixedTarif.tarifMezjGorod.days || 0) + (+this.SummaMixedTarif.tarifRussia.days || 0)


    this.checkedTarif()
    

    if (this.summa.tariff.length > 1) {
      if (this.xs_actual_client_type === 'fiz') {
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
          car: this.summa.car,
          client: JSON.parse(this.xs_actual_search__client),
          place_start: this.form.value.place_start,
          place_end: this.form.value.place_end,
          tariff: this.summa.tariff,
          comment: this.form.value.comment,
          booking_start: this.form.value.booking_start,
          booking_end: new Date(booking_start__x.setDate(booking_start__x.getDate() + mixedDays)).toISOString().replace(".000Z", ""),
          booking_days:  (+this.SummaMixedTarif.tarifGorod.days || 0) + (+this.SummaMixedTarif.tarifMezjGorod.days || 0) + (+this.SummaMixedTarif.tarifRussia.days || 0),
          summaFull: Math.round((this.SummaMixedTarif.tarifGorod.summa || 0) + (this.SummaMixedTarif.tarifMezjGorod.summaFull || 0) + (this.SummaMixedTarif.tarifRussia.summaFull || 0) + (+this.summa.place_end_price) + (+this.summa.place_start_price) + this.summa.additional_services_price) + (+this.form.value.isCustomeZalogControl),
          summa: (this.SummaMixedTarif.tarifGorod.summa || 0) + (this.SummaMixedTarif.tarifMezjGorod.summa || 0) + (this.SummaMixedTarif.tarifRussia.summa || 0),
          dop_hours: this.summa.dop_hours,
          dop_info_open: {
            moyka: moyka || false,
            place_start_price: this.summa.place_start_price || 0,
            place_end_price: this.summa.place_end_price || 0,
            additional_services_price: this.summa.additional_services_price,
            additional_services_chair: this.form.value.additional_services_chair || false,
            additional_services_buster: this.form.value.additional_services_buster || false,
            additional_services_videoregister: this.form.value.additional_services_videoregister || false,
            additional_services_battery_charger: this.form.value.additional_services_battery_charger || false,
            additional_services_antiradar: this.form.value.additional_services_antiradar || false,
            additional_services_moyka: this.form.value.additional_services_moyka || false,
            isCustomePlaceStart: this.form.value.isCustomePlaceStartControlclick,
            isCustomePlaceInput: this.form.value.isCustomePlaceInputControlclick,
            isCustomeZalog: this.form.value.isCustomeZalogControlclick,
            tarifPrice: this.tarifPrice || 0,
            tarif_mixed_gorod: this.form.value.tarif_mixed_gorod || false,
            tarif_mixed_gorod_days: this.form.value.tarif_mixed_gorod_days || 0,
            tarif_mixed_mezjgorod: this.form.value.tarif_mixed_mezjgorod || false,
            tarif_mixed_mezjgorod_days: this.form.value.tarif_mixed_mezjgorod_days || 0,
            tarif_mixed_russia: this.form.value.tarif_mixed_russia || false,
            tarif_mixed_russia_days: this.form.value.tarif_mixed_russia_days || 0,
          },
          booking_zalog: this.form.value.isCustomeZalogControl,
          dogovor_number__actual: this.xs_dogovor_number__actual,
          booking_life_cycle: [
            [],
            [],
            [],
            [],
          ],
        };

        


        // Отправляем запрос
        // this.subCreateBooking$ = this.bookings.create(booking).subscribe((booking) => {

        //   // Вносим изменения в инфу броней а автомобиле
        //   this.cars.update_after_booking_create(this.summa.car._id, booking).subscribe((car) => {
        //     console.log('Бронь добавлена в авто')
        //   })


        //   MaterialService.toast('Бронь добавлена');
        //   this.router.navigate(['/bookings-page']);
        // });

        // Отправляем запрос
        this.subCreateBooking$ = this.bookings.create(booking).pipe(
          switchMap((booking) => {
            return this.cars.update_after_booking_create(this.summa.car._id, booking);
          })
        ).subscribe((car) => {
          console.log('Бронь добавлена в авто');
          MaterialService.toast('Бронь добавлена');
          this.router.navigate(['/bookings-page']);
        });
      }
      else if (this.xs_actual_client_type === 'law') {
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
          car: this.summa.car,
          client: JSON.parse(this.xs_actual_search__client___lawfase),
          place_start: this.form.value.place_start,
          place_end: this.form.value.place_end,
          tariff: this.summa.tariff,
          comment: this.form.value.comment,
          booking_start: this.form.value.booking_start,
          booking_end: new Date(booking_start__x.setDate(booking_start__x.getDate() + mixedDays)).toISOString().replace(".000Z", ""),
          booking_days: (+this.SummaMixedTarif.tarifGorod.days || 0) + (+this.SummaMixedTarif.tarifMezjGorod.days || 0) + (+this.SummaMixedTarif.tarifRussia.days || 0),
          summaFull: Math.round((this.SummaMixedTarif.tarifGorod.summa || 0) + (this.SummaMixedTarif.tarifMezjGorod.summaFull || 0) + (this.SummaMixedTarif.tarifRussia.summaFull || 0) + (+this.summa.place_end_price) + (+this.summa.place_start_price) + this.summa.additional_services_price) + (+this.form.value.isCustomeZalogControl),
          summa: (this.SummaMixedTarif.tarifGorod.summa || 0) + (this.SummaMixedTarif.tarifMezjGorod.summa || 0) + (this.SummaMixedTarif.tarifRussia.summa || 0),
          dop_hours: this.summa.dop_hours,
          dop_info_open: {
            moyka: moyka || false,
            place_start_price: this.summa.place_start_price || 0,
            place_end_price: this.summa.place_end_price || 0,
            additional_services_price: this.summa.additional_services_price,
            additional_services_chair: this.form.value.additional_services_chair || false,
            additional_services_buster: this.form.value.additional_services_buster || false,
            additional_services_videoregister: this.form.value.additional_services_videoregister || false,
            additional_services_battery_charger: this.form.value.additional_services_battery_charger || false,
            additional_services_antiradar: this.form.value.additional_services_antiradar || false,
            additional_services_moyka: this.form.value.additional_services_moyka || false,
            isCustomePlaceStart: this.form.value.isCustomePlaceStartControlclick,
            isCustomePlaceInput: this.form.value.isCustomePlaceInputControlclick,
            isCustomeZalog: this.form.value.isCustomeZalogControlclick,
            tarifPrice: this.tarifPrice || 0,
            tarif_mixed_gorod: this.form.value.tarif_mixed_gorod || false,
            tarif_mixed_gorod_days: this.form.value.tarif_mixed_gorod_days || 0,
            tarif_mixed_mezjgorod: this.form.value.tarif_mixed_mezjgorod || false,
            tarif_mixed_mezjgorod_days: this.form.value.tarif_mixed_mezjgorod_days || 0,
            tarif_mixed_russia: this.form.value.tarif_mixed_russia || false,
            tarif_mixed_russia_days: this.form.value.tarif_mixed_russia_days || 0,
          },
          booking_zalog: this.form.value.isCustomeZalogControl,
          booking_life_cycle: [
            [],
            [],
            [],
            [],
          ],
        };



        // Отправляем запрос
        // this.subCreateBooking$ = this.bookings.create(booking).subscribe((booking) => {

        //   // Вносим изменения в инфу броней а автомобиле
        //   this.cars.update_after_booking_create(this.summa.car._id, booking).subscribe((car) => {
        //     console.log('Бронь добавлена в авто')
        //   })


        //   MaterialService.toast('Бронь добавлена');
        //   this.router.navigate(['/bookings-page']);
        // });

        // Отправляем запрос
        this.subCreateBooking$ = this.bookings.create(booking).pipe(
          switchMap((booking) => {
            return this.cars.update_after_booking_create(this.summa.car._id, booking);
          })
        ).subscribe((car) => {
          console.log('Бронь добавлена в авто');
          MaterialService.toast('Бронь добавлена');
          this.router.navigate(['/bookings-page']);
        });
      }

    }
    else {
      if (this.xs_actual_client_type === 'fiz') {
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
              car: this.summa.car,
              client: JSON.parse(this.xs_actual_search__client),
              place_start: this.form.value.place_start,
              place_end: this.form.value.place_end,
              tariff: this.summa.tariff,
              comment: this.form.value.comment,
              booking_start: this.form.value.booking_start,
              booking_end: this.form.value.booking_end,
              booking_days: Math.ceil((booking_end__x - booking_start__x) / (1000 * 60 * 60 * 24)),
              summaFull: Math.round((+this.summa.summaFull) + (+this.summa.place_start_price) + (+this.summa.place_end_price) + this.summa.additional_services_price),
              summa: Math.round(this.summa.summa),
              dop_hours: this.summa.dop_hours,
              dop_info_open: {
                moyka: moyka || false,
                place_start_price: this.summa.place_start_price || 0,
                place_end_price: this.summa.place_end_price || 0,
                additional_services_price: this.summa.additional_services_price,
                additional_services_chair: this.form.value.additional_services_chair || false,
                additional_services_buster: this.form.value.additional_services_buster || false,
                additional_services_videoregister: this.form.value.additional_services_videoregister || false,
                additional_services_battery_charger: this.form.value.additional_services_battery_charger || false,
                additional_services_antiradar: this.form.value.additional_services_antiradar || false,
                additional_services_moyka: this.form.value.additional_services_moyka || false,
                isCustomePlaceStart: this.form.value.isCustomePlaceStartControlclick,
                isCustomePlaceInput: this.form.value.isCustomePlaceInputControlclick,
                isCustomeZalog: this.form.value.isCustomeZalogControlclick,
                tarifPrice: this.tarifPrice,
                tarif_mixed_gorod: this.form.value.tarif_mixed_gorod || false,
                tarif_mixed_gorod_days: this.form.value.tarif_mixed_gorod_days || 0,
                tarif_mixed_mezjgorod: this.form.value.tarif_mixed_mezjgorod || false,
                tarif_mixed_mezjgorod_days: this.form.value.tarif_mixed_mezjgorod_days || 0,
                tarif_mixed_russia: this.form.value.tarif_mixed_russia || false,
                tarif_mixed_russia_days: this.form.value.tarif_mixed_russia_days || 0,
                
              },
              booking_zalog: this.summa.car.zalog,
              dogovor_number__actual: this.xs_dogovor_number__actual,
              booking_life_cycle: [
                [],
                [],
                [],
                [],
              ],
            };

            

            // Отправляем запрос
            this.subCreateBooking$ = this.bookings.create(booking).pipe(
              switchMap((booking) => {
                return this.cars.update_after_booking_create(this.summa.car._id, booking);
              })
            ).subscribe((car) => {
              console.log('Бронь добавлена в авто');
              MaterialService.toast('Бронь добавлена');
              this.router.navigate(['/bookings-page']);
            });




            // // Отправляем запрос
            // this.subCreateBooking$ = this.bookings.create(booking).subscribe((booking) => {

            //   // Вносим изменения в инфу броней а автомобиле
            //   this.cars.update_after_booking_create(this.summa.car._id, booking).subscribe((car) => { })


            //   MaterialService.toast('Бронь добавлена');
            //   this.router.navigate(['/bookings-page']);
            // });

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
              car: this.summa.car,
              client: JSON.parse(this.xs_actual_search__client),
              place_start: this.form.value.place_start,
              place_end: this.form.value.place_end,
              tariff: this.summa.tariff,
              comment: this.form.value.comment,
              booking_start: this.form.value.booking_start,
              booking_end: this.form.value.booking_end,
              booking_days: Math.ceil((booking_end__x - booking_start__x) / (1000 * 60 * 60 * 24)),
              summaFull: Math.round((+this.summa.summaFull) + (+this.summa.place_start_price) + (+this.summa.place_end_price) + this.summa.additional_services_price),
              summa: Math.round(this.summa.summa),
              dop_hours: this.summa.dop_hours,
              dop_info_open: {
                moyka: moyka || false,
                place_start_price: this.summa.place_start_price || 0,
                place_end_price: this.summa.place_end_price || 0,
                additional_services_price: this.summa.additional_services_price,
                additional_services_chair: this.form.value.additional_services_chair || false,
                additional_services_buster: this.form.value.additional_services_buster || false,
                additional_services_videoregister: this.form.value.additional_services_videoregister || false,
                additional_services_battery_charger: this.form.value.additional_services_battery_charger || false,
                additional_services_antiradar: this.form.value.additional_services_antiradar || false,
                additional_services_moyka: this.form.value.additional_services_moyka || false,
                isCustomePlaceStart: this.form.value.isCustomePlaceStartControlclick,
                isCustomePlaceInput: this.form.value.isCustomePlaceInputControlclick,
                isCustomeZalog: this.form.value.isCustomeZalogControlclick,
                tarifPrice: this.tarifPrice,
                tarif_mixed_gorod: this.form.value.tarif_mixed_gorod || false,
                tarif_mixed_gorod_days: this.form.value.tarif_mixed_gorod_days || 0,
                tarif_mixed_mezjgorod: this.form.value.tarif_mixed_mezjgorod || false,
                tarif_mixed_mezjgorod_days: this.form.value.tarif_mixed_mezjgorod_days || 0,
                tarif_mixed_russia: this.form.value.tarif_mixed_russia || false,
                tarif_mixed_russia_days: this.form.value.tarif_mixed_russia_days || 0,
              },
              booking_zalog: this.summa.car.zalog_mej,
              dogovor_number__actual: this.xs_dogovor_number__actual,
              booking_life_cycle: [
                [],
                [],
                [],
                [],
              ],
            };


            // // Отправляем запрос
            // this.subCreateBooking$ = this.bookings.create(booking).subscribe((booking) => {

            //   // Вносим изменения в инфу броней а автомобиле
            //   this.cars.update_after_booking_create(this.summa.car._id, booking).subscribe((car) => {
            //     console.log('Бронь добавлена в авто')
            //   })


            //   MaterialService.toast('Бронь добавлена');
            //   this.router.navigate(['/bookings-page']);
            // });


            // Отправляем запрос
            this.subCreateBooking$ = this.bookings.create(booking).pipe(
              switchMap((booking) => {
                return this.cars.update_after_booking_create(this.summa.car._id, booking);
              })
            ).subscribe((car) => {
              console.log('Бронь добавлена в авто');
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
              car: this.summa.car,
              client: JSON.parse(this.xs_actual_search__client),
              place_start: this.form.value.place_start,
              place_end: this.form.value.place_end,
              tariff: this.summa.tariff,
              comment: this.form.value.comment,
              booking_start: this.form.value.booking_start,
              booking_end: this.form.value.booking_end,
              booking_days: Math.ceil((booking_end__x - booking_start__x) / (1000 * 60 * 60 * 24)),
              summaFull: Math.round((+this.summa.summaFull) + (+this.summa.place_start_price) + (+this.summa.place_end_price) + this.summa.additional_services_price),
              summa: Math.round(this.summa.summa),
              dop_hours: this.summa.dop_hours,
              dop_info_open: {
                moyka: moyka || false,
                place_start_price: this.summa.place_start_price || 0,
                place_end_price: this.summa.place_end_price || 0,
                additional_services_price: this.summa.additional_services_price,
                additional_services_chair: this.form.value.additional_services_chair || false,
                additional_services_buster: this.form.value.additional_services_buster || false,
                additional_services_videoregister: this.form.value.additional_services_videoregister || false,
                additional_services_battery_charger: this.form.value.additional_services_battery_charger || false,
                additional_services_antiradar: this.form.value.additional_services_antiradar || false,
                additional_services_moyka: this.form.value.additional_services_moyka || false,
                isCustomePlaceStart: this.form.value.isCustomePlaceStartControlclick,
                isCustomePlaceInput: this.form.value.isCustomePlaceInputControlclick,
                isCustomeZalog: this.form.value.isCustomeZalogControlclick,
                tarifPrice: this.tarifPrice,
                tarif_mixed_gorod: this.form.value.tarif_mixed_gorod || false,
                tarif_mixed_gorod_days: this.form.value.tarif_mixed_gorod_days || 0,
                tarif_mixed_mezjgorod: this.form.value.tarif_mixed_mezjgorod || false,
                tarif_mixed_mezjgorod_days: this.form.value.tarif_mixed_mezjgorod_days || 0,
                tarif_mixed_russia: this.form.value.tarif_mixed_russia || false,
                tarif_mixed_russia_days: this.form.value.tarif_mixed_russia_days || 0,
              },
              booking_zalog: this.summa.car.zalog_rus,
              dogovor_number__actual: this.xs_dogovor_number__actual,
              booking_life_cycle: [
                [],
                [],
                [],
                [],
              ],
            };

            // // Отправляем запрос
            // this.subCreateBooking$ = this.bookings.create(booking).subscribe((booking) => {

            //   // Вносим изменения в инфу броней а автомобиле
            //   this.cars.update_after_booking_create(this.summa.car._id, booking).subscribe((car) => {
            //     console.log('Бронь добавлена в авто')
            //   })


            //   MaterialService.toast('Бронь добавлена');
            //   this.router.navigate(['/bookings-page']);
            // });

            // Отправляем запрос
            this.subCreateBooking$ = this.bookings.create(booking).pipe(
              switchMap((booking) => {
                return this.cars.update_after_booking_create(this.summa.car._id, booking);
              })
            ).subscribe((car) => {
              console.log('Бронь добавлена в авто');
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
            car: this.summa.car,
            client: JSON.parse(this.xs_actual_search__client),
            place_start: this.form.value.place_start,
            place_end: this.form.value.place_end,
            tariff: this.summa.tariff,
            comment: this.form.value.comment,
            booking_start: this.form.value.booking_start,
            booking_end: this.form.value.booking_end,
            booking_days: Math.ceil((booking_end__x - booking_start__x) / (1000 * 60 * 60 * 24)),
            summaFull: Math.round((+this.summa.summaFull) + (+this.summa.place_start_price) + (+this.summa.place_end_price) + this.summa.additional_services_price),
            summa: Math.round(this.summa.summa),
            dop_hours: this.summa.dop_hours,
            dop_info_open: {
              moyka: moyka || false,
              place_start_price: this.summa.place_start_price || 0,
              place_end_price: this.summa.place_end_price || 0,
              additional_services_price: this.summa.additional_services_price,
              additional_services_chair: this.form.value.additional_services_chair || false,
              additional_services_buster: this.form.value.additional_services_buster || false,
              additional_services_videoregister: this.form.value.additional_services_videoregister || false,
              additional_services_battery_charger: this.form.value.additional_services_battery_charger || false,
              additional_services_antiradar: this.form.value.additional_services_antiradar || false,
              additional_services_moyka: this.form.value.additional_services_moyka || false,
              isCustomePlaceStart: this.form.value.isCustomePlaceStartControlclick,
              isCustomePlaceInput: this.form.value.isCustomePlaceInputControlclick,
              isCustomeZalog: this.form.value.isCustomeZalogControlclick,
              tarifPrice: this.tarifPrice,
              tarif_mixed_gorod: this.form.value.tarif_mixed_gorod || false,
              tarif_mixed_gorod_days: this.form.value.tarif_mixed_gorod_days || 0,
              tarif_mixed_mezjgorod: this.form.value.tarif_mixed_mezjgorod || false,
              tarif_mixed_mezjgorod_days: this.form.value.tarif_mixed_mezjgorod_days || 0,
              tarif_mixed_russia: this.form.value.tarif_mixed_russia || false,
              tarif_mixed_russia_days: this.form.value.tarif_mixed_russia_days || 0,
            },
            booking_zalog: this.form.value.isCustomeZalogControl,
            dogovor_number__actual: this.xs_dogovor_number__actual,
            booking_life_cycle: [
              [],
              [],
              [],
              [],
            ],
          };



          // Отправляем запрос
          // this.subCreateBooking$ = this.bookings.create(booking).subscribe((booking) => {

          //   // Вносим изменения в инфу броней а автомобиле
          //   this.cars.update_after_booking_create(this.summa.car._id, booking).subscribe((car) => {
          //     console.log('Бронь добавлена в авто')
          //   })


          //   MaterialService.toast('Бронь добавлена');
          //   this.router.navigate(['/bookings-page']);
          // });




          // Отправляем запрос
          this.subCreateBooking$ = this.bookings.create(booking).pipe(
            switchMap((booking) => {
              return this.cars.update_after_booking_create(this.summa.car._id, booking);
            })
          ).subscribe((car) => {
            console.log('Бронь добавлена в авто');
            MaterialService.toast('Бронь добавлена');
            this.router.navigate(['/bookings-page']);
          });
        }
      }
      else if (this.xs_actual_client_type === 'law') {
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
              car: this.summa.car,
              client: JSON.parse(this.xs_actual_search__client___lawfase),
              place_start: this.form.value.place_start,
              place_end: this.form.value.place_end,
              tariff: this.summa.tariff,
              comment: this.form.value.comment,
              booking_start: this.form.value.booking_start,
              booking_end: this.form.value.booking_end,
              booking_days: Math.ceil((booking_end__x - booking_start__x) / (1000 * 60 * 60 * 24)),
              summaFull: Math.round((+this.summa.summaFull) + (+this.summa.place_start_price) + (+this.summa.place_end_price) + this.summa.additional_services_price),
              summa: Math.round(this.summa.summa),
              dop_hours: this.summa.dop_hours,
              dop_info_open: {
                moyka: moyka || false,
                place_start_price: this.summa.place_start_price || 0,
                place_end_price: this.summa.place_end_price || 0,
                additional_services_price: this.summa.additional_services_price,
                additional_services_chair: this.form.value.additional_services_chair || false,
                additional_services_buster: this.form.value.additional_services_buster || false,
                additional_services_videoregister: this.form.value.additional_services_videoregister || false,
                additional_services_battery_charger: this.form.value.additional_services_battery_charger || false,
                additional_services_antiradar: this.form.value.additional_services_antiradar || false,
                additional_services_moyka: this.form.value.additional_services_moyka || false,
                isCustomePlaceStart: this.form.value.isCustomePlaceStartControlclick,
                isCustomePlaceInput: this.form.value.isCustomePlaceInputControlclick,
                isCustomeZalog: this.form.value.isCustomeZalogControlclick,
                tarifPrice: this.tarifPrice,
                tarif_mixed_gorod: this.form.value.tarif_mixed_gorod || false,
                tarif_mixed_gorod_days: this.form.value.tarif_mixed_gorod_days || 0,
                tarif_mixed_mezjgorod: this.form.value.tarif_mixed_mezjgorod || false,
                tarif_mixed_mezjgorod_days: this.form.value.tarif_mixed_mezjgorod_days || 0,
                tarif_mixed_russia: this.form.value.tarif_mixed_russia || false,
                tarif_mixed_russia_days: this.form.value.tarif_mixed_russia_days || 0,
              },
              booking_zalog: this.summa.car.zalog,
              booking_life_cycle: [
                [],
                [],
                [],
                [],
              ],
            };



            // Отправляем запрос
            // this.subCreateBooking$ = this.bookings.create(booking).subscribe((booking) => {

            //   // Вносим изменения в инфу броней а автомобиле
            //   this.cars.update_after_booking_create(this.summa.car._id, booking).subscribe((car) => {
            //     console.log('Бронь добавлена в авто')
            //   })


            //   MaterialService.toast('Бронь добавлена');
            //   this.router.navigate(['/bookings-page']);
            // });




            // Отправляем запрос
            this.subCreateBooking$ = this.bookings.create(booking).pipe(
              switchMap((booking) => {
                return this.cars.update_after_booking_create(this.summa.car._id, booking);
              })
            ).subscribe((car) => {
              console.log('Бронь добавлена в авто');
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
              car: this.summa.car,
              client: JSON.parse(this.xs_actual_search__client___lawfase),
              place_start: this.form.value.place_start,
              place_end: this.form.value.place_end,
              tariff: this.summa.tariff,
              comment: this.form.value.comment,
              booking_start: this.form.value.booking_start,
              booking_end: this.form.value.booking_end,
              booking_days: Math.ceil((booking_end__x - booking_start__x) / (1000 * 60 * 60 * 24)),
              summaFull: Math.round((+this.summa.summaFull) + (+this.summa.place_start_price) + (+this.summa.place_end_price) + this.summa.additional_services_price),
              summa: Math.round(this.summa.summa),
              dop_hours: this.summa.dop_hours,
              dop_info_open: {
                moyka: moyka || false,
                place_start_price: this.summa.place_start_price || 0,
                place_end_price: this.summa.place_end_price || 0,
                additional_services_price: this.summa.additional_services_price,
                additional_services_chair: this.form.value.additional_services_chair || false,
                additional_services_buster: this.form.value.additional_services_buster || false,
                additional_services_videoregister: this.form.value.additional_services_videoregister || false,
                additional_services_battery_charger: this.form.value.additional_services_battery_charger || false,
                additional_services_antiradar: this.form.value.additional_services_antiradar || false,
                additional_services_moyka: this.form.value.additional_services_moyka || false,
                isCustomePlaceStart: this.form.value.isCustomePlaceStartControlclick,
                isCustomePlaceInput: this.form.value.isCustomePlaceInputControlclick,
                isCustomeZalog: this.form.value.isCustomeZalogControlclick,
                tarifPrice: this.tarifPrice,
                tarif_mixed_gorod: this.form.value.tarif_mixed_gorod || false,
                tarif_mixed_gorod_days: this.form.value.tarif_mixed_gorod_days || 0,
                tarif_mixed_mezjgorod: this.form.value.tarif_mixed_mezjgorod || false,
                tarif_mixed_mezjgorod_days: this.form.value.tarif_mixed_mezjgorod_days || 0,
                tarif_mixed_russia: this.form.value.tarif_mixed_russia || false,
                tarif_mixed_russia_days: this.form.value.tarif_mixed_russia_days || 0,
              },
              booking_zalog: this.summa.car.zalog_mej,
              booking_life_cycle: [
                [],
                [],
                [],
                [],
              ],
            };


            // Отправляем запрос
            // this.subCreateBooking$ = this.bookings.create(booking).subscribe((booking) => {

            //   // Вносим изменения в инфу броней а автомобиле
            //   this.cars.update_after_booking_create(this.summa.car._id, booking).subscribe((car) => {
            //     console.log('Бронь добавлена в авто')
            //   })


            //   MaterialService.toast('Бронь добавлена');
            //   this.router.navigate(['/bookings-page']);
            // });


            // Отправляем запрос
            this.subCreateBooking$ = this.bookings.create(booking).pipe(
              switchMap((booking) => {
                return this.cars.update_after_booking_create(this.summa.car._id, booking);
              })
            ).subscribe((car) => {
              console.log('Бронь добавлена в авто');
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
              car: this.summa.car,
              client: JSON.parse(this.xs_actual_search__client___lawfase),
              place_start: this.form.value.place_start,
              place_end: this.form.value.place_end,
              tariff: this.summa.tariff,
              comment: this.form.value.comment,
              booking_start: this.form.value.booking_start,
              booking_end: this.form.value.booking_end,
              booking_days: Math.ceil((booking_end__x - booking_start__x) / (1000 * 60 * 60 * 24)),
              summaFull: Math.round((+this.summa.summaFull) + (+this.summa.place_start_price) + (+this.summa.place_end_price) + this.summa.additional_services_price),
              summa: Math.round(this.summa.summa),
              dop_hours: this.summa.dop_hours,
              dop_info_open: {
                moyka: moyka || false,
                place_start_price: this.summa.place_start_price || 0,
                place_end_price: this.summa.place_end_price || 0,
                additional_services_price: this.summa.additional_services_price,
                additional_services_chair: this.form.value.additional_services_chair || false,
                additional_services_buster: this.form.value.additional_services_buster || false,
                additional_services_videoregister: this.form.value.additional_services_videoregister || false,
                additional_services_battery_charger: this.form.value.additional_services_battery_charger || false,
                additional_services_antiradar: this.form.value.additional_services_antiradar || false,
                additional_services_moyka: this.form.value.additional_services_moyka || false,
                isCustomePlaceStart: this.form.value.isCustomePlaceStartControlclick,
                isCustomePlaceInput: this.form.value.isCustomePlaceInputControlclick,
                isCustomeZalog: this.form.value.isCustomeZalogControlclick,
                tarifPrice: this.tarifPrice,
                tarif_mixed_gorod: this.form.value.tarif_mixed_gorod || false,
                tarif_mixed_gorod_days: this.form.value.tarif_mixed_gorod_days || 0,
                tarif_mixed_mezjgorod: this.form.value.tarif_mixed_mezjgorod || false,
                tarif_mixed_mezjgorod_days: this.form.value.tarif_mixed_mezjgorod_days || 0,
                tarif_mixed_russia: this.form.value.tarif_mixed_russia || false,
                tarif_mixed_russia_days: this.form.value.tarif_mixed_russia_days || 0,
              },
              booking_zalog: this.summa.car.zalog_rus,
              booking_life_cycle: [
                [],
                [],
                [],
                [],
              ],
            };

            // Отправляем запрос
            // this.subCreateBooking$ = this.bookings.create(booking).subscribe((booking) => {

            //   // Вносим изменения в инфу броней а автомобиле
            //   this.cars.update_after_booking_create(this.summa.car._id, booking).subscribe((car) => {
            //     console.log('Бронь добавлена в авто')
            //   })


            //   MaterialService.toast('Бронь добавлена');
            //   this.router.navigate(['/bookings-page']);
            // });


            // Отправляем запрос
            this.subCreateBooking$ = this.bookings.create(booking).pipe(
              switchMap((booking) => {
                return this.cars.update_after_booking_create(this.summa.car._id, booking);
              })
            ).subscribe((car) => {
              console.log('Бронь добавлена в авто');
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
            car: this.summa.car,
            client: JSON.parse(this.xs_actual_search__client___lawfase),
            place_start: this.form.value.place_start,
            place_end: this.form.value.place_end,
            tariff: this.summa.tariff,
            comment: this.form.value.comment,
            booking_start: this.form.value.booking_start,
            booking_end: this.form.value.booking_end,
            booking_days: Math.ceil((booking_end__x - booking_start__x) / (1000 * 60 * 60 * 24)),
            summaFull: Math.round((+this.summa.summaFull) + (+this.summa.place_start_price) + (+this.summa.place_end_price) + this.summa.additional_services_price),
            summa: Math.round(this.summa.summa),
            dop_hours: this.summa.dop_hours,
            dop_info_open: {
              moyka: moyka || false,
              place_start_price: this.summa.place_start_price || 0,
              place_end_price: this.summa.place_end_price || 0,
              additional_services_price: this.summa.additional_services_price,
              additional_services_chair: this.form.value.additional_services_chair || false,
              additional_services_buster: this.form.value.additional_services_buster || false,
              additional_services_videoregister: this.form.value.additional_services_videoregister || false,
              additional_services_battery_charger: this.form.value.additional_services_battery_charger || false,
              additional_services_antiradar: this.form.value.additional_services_antiradar || false,
              additional_services_moyka: this.form.value.additional_services_moyka || false,
              isCustomePlaceStart: this.form.value.isCustomePlaceStartControlclick,
              isCustomePlaceInput: this.form.value.isCustomePlaceInputControlclick,
              isCustomeZalog: this.form.value.isCustomeZalogControlclick,
              tarifPrice: this.tarifPrice,
              tarif_mixed_gorod: this.form.value.tarif_mixed_gorod || false,
              tarif_mixed_gorod_days: this.form.value.tarif_mixed_gorod_days || 0,
              tarif_mixed_mezjgorod: this.form.value.tarif_mixed_mezjgorod || false,
              tarif_mixed_mezjgorod_days: this.form.value.tarif_mixed_mezjgorod_days || 0,
              tarif_mixed_russia: this.form.value.tarif_mixed_russia || false,
              tarif_mixed_russia_days: this.form.value.tarif_mixed_russia_days || 0,
            },
            booking_zalog: this.form.value.isCustomeZalogControl,
            booking_life_cycle: [
              [],
              [],
              [],
              [],
            ],
          };



          // Отправляем запрос
          // this.subCreateBooking$ = this.bookings.create(booking).subscribe((booking) => {

          //   // Вносим изменения в инфу броней а автомобиле
          //   this.cars.update_after_booking_create(this.summa.car._id, booking).subscribe((car) => {
          //     console.log('Бронь добавлена в авто')
          //   })


          //   MaterialService.toast('Бронь добавлена');
          //   this.router.navigate(['/bookings-page']);
          // });


          // Отправляем запрос
          this.subCreateBooking$ = this.bookings.create(booking).pipe(
            switchMap((booking) => {
              return this.cars.update_after_booking_create(this.summa.car._id, booking);
            })
          ).subscribe((car) => {
            console.log('Бронь добавлена в авто');
            MaterialService.toast('Бронь добавлена');
            this.router.navigate(['/bookings-page']);
          });
        }
      }
    }

  }
}