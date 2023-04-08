import { AfterContentChecked, AfterViewChecked, AfterViewInit, Component, DoCheck, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ClientsService } from '../../services/clients.service';
import { Client } from 'src/app/shared/types/interfaces';
import { MaterialService } from 'src/app/shared/services/material.service';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-show-client',
  templateUrl: './show-client.component.html',
  styleUrls: ['./show-client.component.css'],
})
export class ShowClientComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('tabs') tabs!: ElementRef;

  @ViewChild('passport__date') passport__date__info!: ElementRef;
  @ViewChild('prava__date') prava__date__info!: ElementRef;
  @ViewChild('input') inputRef!: ElementRef;
  @ViewChild('input2') inputRef2!: ElementRef;
  @ViewChild('input3') inputRef3!: ElementRef;
  @ViewChild('input4') inputRef4!: ElementRef;

  // Передаем id из списка клиентов в модалке в брони
  @Input() xs_client_id?: string;

  // Компонент открыт из модального окна поиска клиентов для брони
  @Input() isShowClientListModal?: string;


  // Отправляем данные что модальная форма с данным компонентов закрыты(Отправляем в компонент списка клиентов в модальном окне)
  @Output() onCloseModal?= new EventEmitter<any>()

  
  
  clientId!: string;
  xsActualClient!: Client;
  form: any;


  // Храним фалы загруженных документов
  passport__1!: File;
  passport__2!: File;
  prava__1!: File;
  prava__2!: File;

  // Превью загруженных документов
  passport_1_preview: any = '';
  passport_2_preview: any = '';
  prava_1_preview: any = '';
  prava_2_preview: any = '';


  // Имяна файлов
  passport__1_name: string = '';
  passport__2_name: string = '';
  prava__1_name: string = '';
  prava__2_name: string = '';

  subParams$: Subscription;
  subGetByClientId$: Subscription;
  subUpdateClient$: Subscription;

  // Если не резидент
  isNoResident: boolean;

  // Максимальное колличество символов в серии и номере паспорта
  maxLengthSeriaAndNumber: any = 11;

  // Значения маски ввода серии и номера паспорта в зависимости от резидента или не резидента
  passport_seria_and_number_mask: string;

  constructor(
    private clients: ClientsService,
    private rote: ActivatedRoute,
    public datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.getParams();
    this.getByClientId(); 
    MaterialService.updateTextInputs();
  }

  ngOnDestroy(): void {
    if (this.subParams$)
    {
      this.subParams$.unsubscribe();
    }
    if (this.subGetByClientId$)
    {
      this.subGetByClientId$.unsubscribe();
    }
    if (this.subUpdateClient$)
    {
      this.subUpdateClient$.unsubscribe();
    }
  }

  ngAfterViewInit(): void {
    MaterialService.initTabs(this.tabs.nativeElement);
  }



  initForm()
  {
    this.form = new FormGroup({
      fio: new FormControl('', [Validators.required]),
      makedate: new FormControl('', [Validators.required]),
      passport_seria_and_number: new FormControl("", [Validators.required,]),
      passport_date: new FormControl(''),
      passport_who_take: new FormControl('', [Validators.required]),
      code_podrazdeleniya: new FormControl('', [Validators.required]),
      passport_register: new FormControl('', [Validators.required]),
      passport_address_fact: new FormControl('', [Validators.required]),
      prava_seria_and_number: new FormControl('', [Validators.required]),
      prava_date: new FormControl(''),
      phone_main: new FormControl('', [Validators.required]),
      phone_1_dop_name: new FormControl('', [Validators.required]),
      phone_1_dop_number: new FormControl('', [Validators.required]),
      phone_2_dop_name: new FormControl('', [Validators.required]),
      phone_2_dop_number: new FormControl('', [Validators.required]),
      phone_3_dop_name: new FormControl('', []),
      phone_3_dop_number: new FormControl('', []),
      phone_4_dop_name: new FormControl('', []),
      phone_4_dop_number: new FormControl('', []),
      isNoResident: new FormControl('', []),
    });

  }

  getParams()
  {
    // Если смотрим этот компонент из списка клиентов в модельном для брони
    if (this.xs_client_id)
    {
      this.subParams$ = this.rote.params.subscribe((params) => {
        this.clientId = this.xs_client_id;
      });
    }
    else
    {
      this.subParams$ = this.rote.params.subscribe((params) => {
        this.clientId = params['id'];
      });
    }
    
  }

  getByClientId()
  {
    this.subGetByClientId$ = this.clients.getById(this.clientId).subscribe((res) => {
      this.xsActualClient = res;
    
      if (res.passport_1_img) {
        this.passport_1_preview = '/' + res.passport_1_img.replace(/\\/g, "/");
        this.passport__1_name = res.passport_1_img.split(/(\\|\/)/g).pop();
      }

      if (res.passport_2_img) {
        this.passport_2_preview = '/' + res.passport_2_img.replace(/\\/g, "/");
        this.passport__2_name = res.passport_2_img.split(/(\\|\/)/g).pop();
      }

      if (res.prava_1_img) {
        this.prava_1_preview = '/' + res.prava_1_img.replace(/\\/g, "/");
        this.prava__1_name = res.prava_1_img.split(/(\\|\/)/g).pop();
      }

      if (res.prava_2_img) {
        this.prava_2_preview = '/' + res.prava_2_img.replace(/\\/g, "/");
        this.prava__2_name = res.prava_2_img.split(/(\\|\/)/g).pop();
      }



    
      this.form.patchValue({
        fio: res.surname + ' ' + res.name + ' ' + res.lastname,
        makedate: res.makedate,
        passport_seria_and_number: res.passport_seria + ' ' + res.passport_number,
        passport_date: res.passport_date,
        passport_who_take: res.passport_who_take,
        code_podrazdeleniya: res.code_podrazdeleniya,
        passport_register: res.passport_register,
        passport_address_fact: res.passport_address_fact,
        prava_seria_and_number: res.prava_seria + ' ' + res.prava_number,
        prava_date: res.prava_date,
        phone_main: res.phone_main,
        phone_1_dop_name: res.phone_1_dop_name,
        phone_1_dop_number: res.phone_1_dop_number,
        phone_2_dop_name: res.phone_2_dop_name,
        phone_2_dop_number: res.phone_2_dop_number,
        phone_3_dop_name: res.phone_3_dop_name,
        phone_3_dop_number: res.phone_3_dop_number,
        phone_4_dop_name: res.phone_4_dop_name,
        phone_4_dop_number: res.phone_4_dop_number,
        isNoResident: res.isNoResident,
      });

      this.isNoResident = res.isNoResident;



      if (res.isNoResident) {
        this.passport_seria_and_number_mask = ''
      }
      else {
        this.passport_seria_and_number_mask = '0000 000000'
      }

    });
  }


  // Если нажат-"Не резидент РФ"
  isNoResidentInput() {
    this.isNoResident = !this.isNoResident;
    
    
    if (this.isNoResident)
    {
      this.passport_seria_and_number_mask = ''
    }
    else
    {
      this.passport_seria_and_number_mask = '0000 000000'
    }

  }


  // Проверяем оканчивается ли строка на определенные символы
  endsWith(str, suffix) {
    return new RegExp(suffix + '$').test(str);
  };



  onSubmit() {
    let fio = this.form.value.fio.split(' ');


    const client = {
      name: fio[1],
      surname: fio[0],
      lastname: fio[2],
      makedate: this.form.value.makedate,
      passport_seria: this.form.value.passport_seria_and_number.substring(0, 4),
      passport_number: this.form.value.passport_seria_and_number.slice(4),
      passport_date: this.form.value.passport_date,
      passport_who_take: this.form.value.passport_who_take,
      code_podrazdeleniya: this.form.value.code_podrazdeleniya,
      passport_register: this.form.value.passport_register,
      passport_address_fact: this.form.value.passport_address_fact,
      prava_seria: this.form.value.prava_seria_and_number.substring(0, 4),
      prava_number: this.form.value.prava_seria_and_number.slice(4),
      prava_date: this.form.value.prava_date,
      phone_main: this.form.value.phone_main,
      phone_1_dop_name: this.form.value.phone_1_dop_name,
      phone_1_dop_number: this.form.value.phone_1_dop_number,
      phone_2_dop_name: this.form.value.phone_2_dop_name,
      phone_2_dop_number: this.form.value.phone_2_dop_number,
      phone_3_dop_name: this.form.value.phone_3_dop_name,
      phone_3_dop_number: this.form.value.phone_3_dop_number,
      phone_4_dop_name: this.form.value.phone_4_dop_name,
      phone_4_dop_number: this.form.value.phone_4_dop_number,
      isNoResident: this.form.value.isNoResident
    };

    this.subUpdateClient$ = this.clients

      .update(
        this.clientId,
        client,
        this.passport__1,
        this.passport__2,
        this.prava__1,
        this.prava__2
      )
      .subscribe((car) => {
        MaterialService.toast('Клиент Изменен');
        this.onCloseModal.emit('ok')
      });
  }







  // Обрабатываем загрузку картинок
  onFileUpload(event: any) {
    const file = event.target.files['0'];
    this.passport__1 = file;


    
    
    // Подключаем ридер для считывания картинки
    const reader = new FileReader();

    // Метод вызовется тогда, когда загрузится вся картинка
    reader.onload = () => {
      if (event.target.files['0'].type !== 'application/pdf')
      {
        // Переменная для хранения информации об изображении
        this.passport_1_preview = reader.result;
      }
      else
      {
        // Переменная для хранения информации об изображении
        this.passport_1_preview = 'https://i.etsystatic.com/7267864/r/il/5235cc/1979275153/il_1588xN.1979275153_71s3.jpg';
      }
      
      this.passport__1_name = event.target.files['0'].name;
      
      
      
    };

    // Читаем нужный нам файл
    reader.readAsDataURL(file);
  }
  onFileUpload2(event: any) {
    const file = event.target.files['0'];
    this.passport__2 = file;

    // Подключаем ридер для считывания картинки
    const reader = new FileReader();

    // Метод вызовется тогда, когда загрузится вся картинка
    reader.onload = () => {
      if (event.target.files['0'].type !== 'application/pdf') {
        // Переменная для хранения информации об изображении
        this.passport_2_preview = reader.result;
      }
      else {
        // Переменная для хранения информации об изображении
        this.passport_2_preview = 'https://i.etsystatic.com/7267864/r/il/5235cc/1979275153/il_1588xN.1979275153_71s3.jpg';
      }

      this.passport__2_name = event.target.files['0'].name;
    };

    // Читаем нужный нам файл
    reader.readAsDataURL(file);
  }
  onFileUpload3(event: any) {
    const file = event.target.files['0'];
    this.prava__1 = file;

    // Подключаем ридер для считывания картинки
    const reader = new FileReader();

    // Метод вызовется тогда, когда загрузится вся картинка
    reader.onload = () => {
      
      if (event.target.files['0'].type !== 'application/pdf') {
        // Переменная для хранения информации об изображении
        this.prava_1_preview = reader.result;
      }
      else {
        // Переменная для хранения информации об изображении
        this.prava_1_preview = 'https://i.etsystatic.com/7267864/r/il/5235cc/1979275153/il_1588xN.1979275153_71s3.jpg';
      }

      this.prava__1_name = event.target.files['0'].name;
    };

    // Читаем нужный нам файл
    reader.readAsDataURL(file);
  }
  onFileUpload4(event: any) {
    const file = event.target.files['0'];
    this.prava__2 = file;

    // Подключаем ридер для считывания картинки
    const reader = new FileReader();

    // Метод вызовется тогда, когда загрузится вся картинка
    reader.onload = () => {
      if (event.target.files['0'].type !== 'application/pdf') {
        // Переменная для хранения информации об изображении
        this.prava_2_preview = reader.result;
      }
      else {
        // Переменная для хранения информации об изображении
        this.prava_2_preview = 'https://i.etsystatic.com/7267864/r/il/5235cc/1979275153/il_1588xN.1979275153_71s3.jpg';
      }

      this.prava__2_name = event.target.files['0'].name;
    };

    // Читаем нужный нам файл
    reader.readAsDataURL(file);
  }

  // Обрабатываем кнопку загрузки тригиря клик по скрытому инпуту
  triggerClick() {
    this.inputRef.nativeElement.click();
  }
  triggerClick2() {
    this.inputRef2.nativeElement.click();
  }
  triggerClick3() {
    this.inputRef3.nativeElement.click();
  }
  triggerClick4() {
    this.inputRef4.nativeElement.click();
  }


  // При нажатии на кнопку закрыть если мы смотрим компонент из спика клиентов в модалке при поиск. При создании брони
  close_modal()
  {
    this.onCloseModal.emit('ok')
  }
}
