import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MaterialService } from 'src/app/shared/services/material.service';
import { ClientsService } from '../../services/clients.service';



@Component({
  selector: 'app-add-client',
  templateUrl: './add-client.component.html',
  styleUrls: ['./add-client.component.css'],
})
export class AddClientComponent implements OnInit, AfterViewInit, OnDestroy {
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
  passport__1!: File;
  passport__2!: File;
  prava__1!: File;
  prava__2!: File;

  // Превью загруженных документов
  passport_1_preview: any = '';
  passport_2_preview: any = '';
  prava_1_preview: any = '';
  prava_2_preview: any = '';

  subGetParams$: Subscription;
  subClientCreate$: Subscription;


  // Если не резидент
  isNoResident: boolean = false; 

  // Максимальное колличество символов в серии и номере паспорта
  maxLengthSeriaAndNumber: any = 11;


  constructor(private clients: ClientsService, private router: Router, private rote: ActivatedRoute,) {}

  ngOnInit(): void {
    this.initForm();
    this.getParams();
    MaterialService.updateTextInputs();
  }

  ngOnDestroy(): void {
    if (this.subGetParams$)
    {
      this.subGetParams$.unsubscribe();
    }
    if (this.subClientCreate$)
    {
      this.subClientCreate$.unsubscribe();
    }
  }

  ngAfterViewInit(): void {
    MaterialService.initTabs(this.tabs.nativeElement);
    MaterialService.updateTextInputs();
  }

  initForm()
  {
    this.form = new FormGroup({
      fio: new FormControl('', [Validators.required]),
      makedate: new FormControl('', [Validators.required]),
      passport_seria_and_number: new FormControl("", [Validators.required,
        Validators.maxLength(this.maxLengthSeriaAndNumber),
        Validators.minLength(this.maxLengthSeriaAndNumber)
        ]),
      passport_date: new FormControl(''),
      passport_who_take: new FormControl('', [Validators.required]),
      code_podrazdeleniya: new FormControl('', [Validators.required]),
      passport_register: new FormControl('', [Validators.required]),
      passport_address_fact: new FormControl('',),
      prava_seria_and_number: new FormControl('', [Validators.required]),
      prava_date: new FormControl(''),
      phone_main: new FormControl('', [Validators.required]),
      phone_1_dop_name: new FormControl('', []),
      phone_1_dop_number: new FormControl('', []),
      phone_2_dop_name: new FormControl('', []),
      phone_2_dop_number: new FormControl('', []),
      phone_3_dop_name: new FormControl('', []),
      phone_3_dop_number: new FormControl('', []),
      phone_4_dop_name: new FormControl('', []),
      phone_4_dop_number: new FormControl('', []),
      isNoResident: new FormControl('', []),
    });
    
    
  }


  getParams()
  {
    this.subGetParams$ = this.rote.params.subscribe((params: any) => {
      this.breadcrumbsId = params['id']
    });
  }


  // Если нажат-"Не резидент РФ"
  isNoResidentInput() {
    this.isNoResident = !this.isNoResident;
    if (this.isNoResident)
    {
      this.maxLengthSeriaAndNumber = 25;
    }
    else
    {
      this.maxLengthSeriaAndNumber = 11;
    }
    
  }



  onSubmit() {
    let fio = this.form.value.fio.split(' ');
    let seria_and_number = this.form.value.passport_seria_and_number.split(' ');
    let prava_seria_and_number = this.form.value.prava_seria_and_number.split(' ');


    const client = {
      name: fio[1],
      surname: fio[0],
      lastname: fio[2],
      makedate: this.form.value.makedate,
      passport_seria: seria_and_number[0],
      passport_number: seria_and_number[1],
      passport_date: this.form.value.passport_date,
      passport_who_take: this.form.value.passport_who_take,
      code_podrazdeleniya: this.form.value.code_podrazdeleniya,
      passport_register: this.form.value.passport_register,
      passport_address_fact: this.form.value.passport_address_fact,
      prava_seria: prava_seria_and_number[0],
      prava_number: prava_seria_and_number[1],
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
      isNoResident: this.isNoResident
    };


    
    

    this.subClientCreate$ = this.clients
      .create(
        client,
        this.passport__1,
        this.passport__2,
        this.prava__1,
        this.prava__2
      )
      .subscribe((client) => {
        MaterialService.toast('Клиент физ/лицо добавлен');

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
    this.passport__1 = file;
    console.log(this.passport__1);
    

    // Подключаем ридер для считывания картинки
    const reader = new FileReader();

    // Метод вызовется тогда, когда загрузится вся картинка
    reader.onload = () => {
      // Переменная для хранения информации об изображении
      this.passport_1_preview = reader.result;
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
      // Переменная для хранения информации об изображении
      this.passport_2_preview = reader.result;
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
      // Переменная для хранения информации об изображении
      this.prava_1_preview = reader.result;
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
      // Переменная для хранения информации об изображении
      this.prava_2_preview = reader.result;
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