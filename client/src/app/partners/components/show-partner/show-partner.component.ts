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
import { DatePipe } from '@angular/common';
import { PartnersService } from '../../services/partners.service';
import {  Partner } from 'src/app/shared/types/interfaces';
import { MaterialService } from 'src/app/shared/services/material.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-show-partner',
  templateUrl: './show-partner.component.html',
  styleUrls: ['./show-partner.component.css'],
})
export class ShowPartnerComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('tabs') tabs!: ElementRef;
  @ViewChild('input') inputRef!: ElementRef;
  @ViewChild('input2') inputRef2!: ElementRef;

  partnerId!: string;
  xsActualPartner!: Partner;
  form: any;

  // Храним фалы загруженных документов
  passport__1!: File;
  passport__2!: File;

  // Превью загруженных документов
  passport_1_preview: any = '';
  passport_2_preview: any = '';


  // Имяна файлов
  passport__1_name: string = '';
  passport__2_name: string = '';


  subParams$: Subscription;
  subGetById$: Subscription;
  subUpdatePartner$: Subscription;


  constructor(
    private partners: PartnersService,
    private router: Router,
    private rote: ActivatedRoute,
    public datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.getParams();
    this.getPartnerById();
    MaterialService.updateTextInputs();
  }

  ngAfterViewInit(): void {
    MaterialService.initTabs(this.tabs.nativeElement);
    MaterialService.updateTextInputs();

  }

  ngOnDestroy(): void {
    if (this.subParams$)
    {
      this.subParams$.unsubscribe();
    }
    if (this.subGetById$)
    {
      this.subGetById$.unsubscribe();
    }
    if (this.subUpdatePartner$)
    {
      this.subUpdatePartner$.unsubscribe();
    }
  }

  initForm()
  {
    this.form = new FormGroup({
      name: new FormControl('', [Validators.required]),
      surname: new FormControl('', [Validators.required]),
      lastname: new FormControl('', [Validators.required]),
      passport_seria: new FormControl('', [Validators.required]),
      passport_number: new FormControl('', [Validators.required]),
      passport_date: new FormControl(''),
      passport_who_take: new FormControl('', [Validators.required]),
      code_podrazdeleniya: new FormControl('', [Validators.required]),
      passport_register: new FormControl('', [Validators.required]),
      phone_main: new FormControl('', [Validators.required]),
    });
  }

  getParams()
  {
    this.subParams$ = this.rote.params.subscribe((params) => {
      this.partnerId = params['id'];
    });
  }

  getPartnerById()
  {
    this.subGetById$ = this.partners.getById(this.partnerId).subscribe((res) => {
      this.xsActualPartner = res;


      if (res.passport_1_img) {
        this.passport_1_preview = '/' + res.passport_1_img.replace(/\\/g, "/");
        this.passport__1_name = res.passport_1_img.split(/(\\|\/)/g).pop();
      }

      if (res.passport_2_img) {
        this.passport_2_preview = '/' + res.passport_2_img.replace(/\\/g, "/");
        this.passport__2_name = res.passport_2_img.split(/(\\|\/)/g).pop();
      }


      this.form.patchValue({
        name: res.name,
        surname: res.surname,
        lastname: res.lastname,
        passport_seria: res.passport_seria,
        passport_number: res.passport_number,
        passport_date: res.passport_date,
        passport_who_take: res.passport_who_take,
        code_podrazdeleniya: res.code_podrazdeleniya,
        passport_register: res.passport_register,
        phone_main: res.phone_main,
      });
    });
  }


  // Проверяем оканчивается ли строка на определенные символы
  endsWith(str, suffix) {
    return new RegExp(suffix + '$').test(str);
  };


  


  onSubmit() {
    const partner = {
      name: this.form.value.name,
      surname: this.form.value.surname,
      lastname: this.form.value.lastname,
      passport_seria: this.form.value.passport_seria,
      passport_number: this.form.value.passport_number,
      passport_date: this.form.value.passport_date,
      passport_who_take: this.form.value.passport_who_take,
      code_podrazdeleniya: this.form.value.code_podrazdeleniya,
      passport_register: this.form.value.passport_register,
      phone_main: this.form.value.phone_main,
    };

    this.subUpdatePartner$ = this.partners
      .update(this.partnerId, partner, this.passport__1, this.passport__2)
      .subscribe((car) => {
        MaterialService.toast('Клиент Изменен');
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
      if (event.target.files['0'].type !== 'application/pdf') {
        // Переменная для хранения информации об изображении
        this.passport_1_preview = reader.result;
      }
      else {
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


  // Обрабатываем кнопку загрузки тригиря клик по скрытому инпуту
  triggerClick() {
    this.inputRef.nativeElement.click();
  }
  triggerClick2() {
    this.inputRef2.nativeElement.click();
  }
}
