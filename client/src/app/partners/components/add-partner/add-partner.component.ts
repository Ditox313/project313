import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MaterialService } from 'src/app/shared/services/material.service';
import { MaterialDatepicker } from 'src/app/shared/types/interfaces';
import { PartnersService } from '../../services/partners.service';

@Component({
  selector: 'app-add-partner',
  templateUrl: './add-partner.component.html',
  styleUrls: ['./add-partner.component.css'],
})
export class AddPartnerComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('tabs') tabs!: ElementRef;
  @ViewChild('passport__date') passport__date__info!: ElementRef;
  @ViewChild('input') inputRef!: ElementRef;
  @ViewChild('input2') inputRef2!: ElementRef;

  form: any;


  // Храним фалы загруженных документов
  passport__1!: File;
  passport__2!: File;


  // Превью загруженных документов
  passport_1_preview: any = '';
  passport_2_preview: any = '';

  subCreatePartner$: Subscription;




  constructor(private partners: PartnersService, private router: Router) { }
  ngOnInit(): void {
    this.initForm();
    MaterialService.updateTextInputs();
  }

  ngOnDestroy(): void {
    if (this.subCreatePartner$)
    {
      this.subCreatePartner$.unsubscribe();
    }
  }

  ngAfterViewInit(): void {
    MaterialService.initTabs(this.tabs.nativeElement);
    MaterialService.updateTextInputs();
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

    this.subCreatePartner$ = this.partners
      .create(partner, this.passport__1, this.passport__2)
      .subscribe((partners) => {
        MaterialService.toast('Партнер добавлен');
        this.router.navigate(['/partners-page']);
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


  // Обрабатываем кнопку загрузки тригиря клик по скрытому инпуту
  triggerClick() {
    this.inputRef.nativeElement.click();
  }
  triggerClick2() {
    this.inputRef2.nativeElement.click();
  }
}
