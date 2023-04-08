import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MaterialService } from 'src/app/shared/services/material.service';
import { Client_Law_Fase } from 'src/app/shared/types/interfaces';
import { ClientsService } from '../../services/clients.service';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-show-client-lawfase',
  templateUrl: './show-client-lawfase.component.html',
  styleUrls: ['./show-client-lawfase.component.css']
})
export class ShowClientLawfaseComponent implements OnInit, AfterViewInit, OnDestroy {

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

  form: any;
  breadcrumbsId!: any;
  clientId!: string;
  xsActualClient!: Client_Law_Fase;
  subGetByIdLawfase$: Subscription;
  subParams$: Subscription;
  subUpdateClientLawfase$: Subscription;

  // Храним фалы загруженных документов
  doc_1_img!: File;
  doc_2_img!: File;
  doc_3_img!: File;
  doc_4_img!: File;

  // Превью загруженных документов
  doc_1_img_preview: any = '';
  doc_2_img_preview: any = '';
  doc_3_img_preview: any = '';
  doc_4_img_preview: any = '';


  // Имяна файлов
  doc_1_name: string = 'Загрузите изображение';
  doc_2_name: string = 'Загрузите изображение';
  doc_3_name: string = 'Загрузите изображение';
  doc_4_name: string = 'Загрузите изображение';

  constructor(private clients: ClientsService, private router: Router, private rote: ActivatedRoute, private location: Location) { }

  ngOnInit(): void {
    this.initForm();
    this.getParams();
    this.getByIdLawfase();
    MaterialService.updateTextInputs();
  }

  ngAfterViewInit(): void {
    MaterialService.initTabs(this.tabs.nativeElement);
    MaterialService.updateTextInputs();
  }

  ngOnDestroy(): void {
    if (this.subGetByIdLawfase$)
    {
      this.subGetByIdLawfase$.unsubscribe();
    }
    if (this.subParams$)
    {
      this.subParams$.unsubscribe();
    }
    if (this.subUpdateClientLawfase$)
    {
      this.subUpdateClientLawfase$.unsubscribe();
    }
  }

  initForm()
  {
    this.form = new FormGroup({
      name: new FormControl('', [Validators.required]),
      short_name: new FormControl('', [Validators.required]),
      inn: new FormControl('', [Validators.required]),
      kpp: new FormControl('', [Validators.required]),
      ogrn: new FormControl('',),
      ogrn_ip: new FormControl('',),
      svidetelstvo_ip: new FormControl('',),
      law_address: new FormControl('', [Validators.required]),
      fact_address: new FormControl('', [Validators.required]),
      mail_address: new FormControl('', [Validators.required]),
      boss_role: new FormControl('', [Validators.required]),
      boss_name: new FormControl('', [Validators.required]),
      boss_surname: new FormControl('', [Validators.required]),
      boss_lastname: new FormControl('', [Validators.required]),
      osnovanie_boss_role: new FormControl('', [Validators.required]),
      number_1: new FormControl('', [Validators.required]),
      number_2: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required]),
      rc_number: new FormControl('', [Validators.required]),
      kor_rc_number: new FormControl('', [Validators.required]),
      bik_number: new FormControl('', [Validators.required]),
      name_bank: new FormControl('', [Validators.required]),
    });
  }

  getParams()
  {
    // Если смотрим этот компонент из списка клиентов в модельном для брони
    if (this.xs_client_id) {
      this.subParams$ = this.rote.params.subscribe((params) => {
        this.clientId = this.xs_client_id;
      });
    }
    else {
      this.subParams$ = this.rote.params.subscribe((params) => {
        this.clientId = params['id'];
      });
    }

  }

  getByIdLawfase()
  {
    this.subGetByIdLawfase$ = this.clients.getByIdLawfase(this.clientId).subscribe((res) => {
      this.xsActualClient = res;

      if (res.doc_1_img) {
        this.doc_1_img_preview = '/' + res.doc_1_img.replace(/\\/g, "/");
        this.doc_1_name = res.doc_1_img.split(/(\\|\/)/g).pop();
      }

      if (res.doc_2_img) {
        this.doc_2_img_preview = '/' + res.doc_2_img.replace(/\\/g, "/");
        this.doc_2_name = res.doc_1_img.split(/(\\|\/)/g).pop();
      }

      if (res.doc_3_img) {
        this.doc_3_img_preview = '/' + res.doc_3_img.replace(/\\/g, "/");
        this.doc_3_name = res.doc_3_img.split(/(\\|\/)/g).pop();
      }

      if (res.doc_4_img) {
        this.doc_4_img_preview = '/' + res.doc_4_img.replace(/\\/g, "/");
        this.doc_4_name = res.doc_4_img.split(/(\\|\/)/g).pop();
      }

      this.form.patchValue({
        name: res.name,
        short_name: res.short_name,
        inn: res.inn,
        kpp: res.kpp,
        ogrn: res.ogrn,
        ogrn_ip: res.ogrn_ip,
        svidetelstvo_ip: res.svidetelstvo_ip,
        law_address: res.law_address,
        fact_address: res.fact_address,
        mail_address: res.mail_address,
        boss_role: res.boss_role,
        boss_name: res.boss_name,
        boss_surname: res.boss_surname,
        boss_lastname: res.boss_lastname,
        osnovanie_boss_role: res.osnovanie_boss_role,
        number_1: res.number_1,
        number_2: res.number_2,
        email: res.email,
        rc_number: res.rc_number,
        kor_rc_number: res.kor_rc_number,
        bik_number: res.bik_number,
        name_bank: res.name_bank,
      });
    });
  }



  isGoBack() {
    this.location.back();
  }


  // Проверяем оканчивается ли строка на определенные символы
  endsWith(str, suffix) {
    return new RegExp(suffix + '$').test(str);
  };


  onSubmit() {
    const client = {
      name: this.form.value.name,
      short_name: this.form.value.short_name,
      inn: this.form.value.inn,
      kpp: this.form.value.kpp,
      ogrn: this.form.value.ogrn,
      ogrn_ip: this.form.value.ogrn_ip,
      svidetelstvo_ip: this.form.value.svidetelstvo_ip,
      law_address: this.form.value.law_address,
      fact_address: this.form.value.fact_address,
      mail_address: this.form.value.mail_address,
      boss_role: this.form.value.boss_role,
      boss_name: this.form.value.boss_name,
      boss_surname: this.form.value.boss_surname,
      boss_lastname: this.form.value.boss_lastname,
      osnovanie_boss_role: this.form.value.osnovanie_boss_role,
      number_1: this.form.value.number_1,
      number_2: this.form.value.number_2,
      email: this.form.value.email,
      rc_number: this.form.value.rc_number,
      kor_rc_number: this.form.value.kor_rc_number,
      bik_number: this.form.value.bik_number,
      name_bank: this.form.value.name_bank,
    };


    this.subUpdateClientLawfase$ = this.clients
      .update_lawfase(
        this.clientId,
        client,
        this.doc_1_img,
        this.doc_2_img,
        this.doc_3_img,
        this.doc_4_img
      )
      .subscribe((client) => {
        MaterialService.toast('Клиент Изменен');
        this.onCloseModal.emit('ok')
      });
  }

  // Обрабатываем загрузку картинок
  onFileUpload(event: any) {
    const file = event.target.files['0'];
    this.doc_1_img = file;

    // Подключаем ридер для считывания картинки
    const reader = new FileReader();

    // Метод вызовется тогда, когда загрузится вся картинка
    reader.onload = () => {
      if (event.target.files['0'].type !== 'application/pdf') {
        // Переменная для хранения информации об изображении
        this.doc_1_img_preview = reader.result;
      }
      else {
        // Переменная для хранения информации об изображении
        this.doc_1_img_preview = 'https://i.etsystatic.com/7267864/r/il/5235cc/1979275153/il_1588xN.1979275153_71s3.jpg';
      }

      this.doc_1_name = event.target.files['0'].name;
    };

    // Читаем нужный нам файл
    reader.readAsDataURL(file);
  }
  onFileUpload2(event: any) {
    const file = event.target.files['0'];
    this.doc_2_img = file;

    // Подключаем ридер для считывания картинки
    const reader = new FileReader();

    // Метод вызовется тогда, когда загрузится вся картинка
    reader.onload = () => {
      if (event.target.files['0'].type !== 'application/pdf') {
        // Переменная для хранения информации об изображении
        this.doc_2_img_preview = reader.result;
      }
      else {
        // Переменная для хранения информации об изображении
        this.doc_2_img_preview = 'https://i.etsystatic.com/7267864/r/il/5235cc/1979275153/il_1588xN.1979275153_71s3.jpg';
      }

      this.doc_2_name = event.target.files['0'].name;
    };

    // Читаем нужный нам файл
    reader.readAsDataURL(file);
  }
  onFileUpload3(event: any) {
    const file = event.target.files['0'];
    this.doc_3_img = file;

    // Подключаем ридер для считывания картинки
    const reader = new FileReader();

    // Метод вызовется тогда, когда загрузится вся картинка
    reader.onload = () => {
      if (event.target.files['0'].type !== 'application/pdf') {
        // Переменная для хранения информации об изображении
        this.doc_3_img_preview = reader.result;
      }
      else {
        // Переменная для хранения информации об изображении
        this.doc_3_img_preview = 'https://i.etsystatic.com/7267864/r/il/5235cc/1979275153/il_1588xN.1979275153_71s3.jpg';
      }

      this.doc_3_name = event.target.files['0'].name;
    };

    // Читаем нужный нам файл
    reader.readAsDataURL(file);
  }
  onFileUpload4(event: any) {
    const file = event.target.files['0'];
    this.doc_4_img = file;

    // Подключаем ридер для считывания картинки
    const reader = new FileReader();

    // Метод вызовется тогда, когда загрузится вся картинка
    reader.onload = () => {
      if (event.target.files['0'].type !== 'application/pdf') {
        // Переменная для хранения информации об изображении
        this.doc_4_img_preview = reader.result;
      }
      else {
        // Переменная для хранения информации об изображении
        this.doc_4_img_preview = 'https://i.etsystatic.com/7267864/r/il/5235cc/1979275153/il_1588xN.1979275153_71s3.jpg';
      }

      this.doc_4_name = event.target.files['0'].name;
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
  close_modal() {
    this.onCloseModal.emit('ok')
  }

}
