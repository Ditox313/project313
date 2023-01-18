import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MaterialService } from 'src/app/shared/services/material.service';
import { ClientsService } from '../../services/clients.service';

@Component({
  selector: 'app-add-client-lawfase',
  templateUrl: './add-client-lawfase.component.html',
  styleUrls: ['./add-client-lawfase.component.css']
})
export class AddClientLawfaseComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('tabs') tabs!: ElementRef;
  @ViewChild('passport__date') passport__date__info!: ElementRef;
  @ViewChild('prava__date') prava__date__info!: ElementRef;
  @ViewChild('input') inputRef!: ElementRef;
  @ViewChild('input2') inputRef2!: ElementRef;
  @ViewChild('input3') inputRef3!: ElementRef;
  @ViewChild('input4') inputRef4!: ElementRef;

  form: any;
  breadcrumbsId!: any;

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


  subGetParams$: Subscription;
  subCreateClient$: Subscription;


  constructor(private clients: ClientsService, private router: Router, private rote: ActivatedRoute,) { }

  ngOnInit(): void {
    this.initForm();
    this.getParams();
    MaterialService.updateTextInputs();
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
    this.subGetParams$ = this.rote.params.subscribe((params: any) => {
      this.breadcrumbsId = params['id']
    });
  }

  ngOnDestroy(): void {
    if (this.subGetParams$)
    {
      this.subGetParams$.unsubscribe();
    }
    if (this.subCreateClient$)
    {
      this.subCreateClient$.unsubscribe();
    }
  }

  ngAfterViewInit(): void {
    MaterialService.initTabs(this.tabs.nativeElement);
    MaterialService.updateTextInputs();


  }


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

  
    this.subCreateClient$ = this.clients
      .create_lawfase(
        client,
        this.doc_1_img,
        this.doc_2_img,
        this.doc_3_img,
        this.doc_4_img
      )
      .subscribe((client) => {
        MaterialService.toast('Клиент юр/лицо добавлен');

        if (this.breadcrumbsId) {
          this.router.navigate(['/add-booking']);
        }
        else {
          this.router.navigate(['/clients-page']);
        }
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
      // Переменная для хранения информации об изображении
      this.doc_1_img_preview = reader.result;
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
      // Переменная для хранения информации об изображении
      this.doc_2_img_preview = reader.result;
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
      // Переменная для хранения информации об изображении
      this.doc_3_img_preview = reader.result;
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
      // Переменная для хранения информации об изображении
      this.doc_4_img_preview = reader.result;
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
}
