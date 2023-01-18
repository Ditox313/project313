import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CarsService } from '../../services/cars.service';
import { PartnersService } from 'src/app/partners/services/partners.service';
import { Car } from 'src/app/shared/types/interfaces';
import { MaterialService } from 'src/app/shared/services/material.service';


@Component({
  selector: 'app-show-car',
  templateUrl: './show-car.component.html',
  styleUrls: ['./show-car.component.css']
})
export class ShowCarComponent implements OnInit, OnDestroy {


  @ViewChild('tabs') tabs!: ElementRef;
  @ViewChild('start_arenda') start_arenda_avto!: ElementRef;
  @ViewChild('end_arenda') end_arenda_avto!: ElementRef;

  @ViewChild('sts_date_info') sts_date_info_avto!: ElementRef;
  @ViewChild('osago_date_finish_info') osago_date_finish_info_avto!: ElementRef;
  @ViewChild('to_date_info') to_date_info_avto!: ElementRef;


  carId!: string;
  xsActualCar!: Car;
  Sub!: Subscription; 
  isValid: any = true;
  form!: FormGroup; 

  // Задаем переменную для хранения картинки после пото как загрузили с устройтста
  image!: File

  // Превью изображения авто
  imagePreview : any = '';

  // Список владельцев
  xspartners!: any

  subParams$ : Subscription;

  subGetCarById$: Subscription;

  subPartners$: Subscription;

  subUpdateCar$: Subscription;

  // Забираем дом элемент input загрузки файла и ложим его в переменную inputgRef
  @ViewChild('input') inputRef!: ElementRef;




  constructor(private cars: CarsService, private router: Router, private rote: ActivatedRoute, private partners: PartnersService) { }

  ngOnInit(): void {
    this.initForm();
    this.getparams();
    this.getCarById();
    this.getPartners();
  }

  ngOnDestroy(): void {
    if (this.Sub)
    {
      this.Sub.unsubscribe();
    }
    if (this.subParams$)
    {
      this.subParams$.unsubscribe();
    }
    if (this.subGetCarById$)
    {
      this.subGetCarById$.unsubscribe();
    }
    if (this.subPartners$)
    {
      this.subPartners$.unsubscribe();
    }
    if (this.subUpdateCar$)
    {
      this.subUpdateCar$.unsubscribe();
    }
  }

  initForm()
  {
    this.form = new FormGroup({
      marka: new FormControl('', [Validators.required]),
      model: new FormControl('', [Validators.required]),
      number: new FormControl('', [Validators.required]),
      probeg: new FormControl(''),
      transmission: new FormControl(''),
      start_arenda: new FormControl(''),
      end_arenda: new FormControl(''),
      vladelec: new FormControl('', [Validators.required]),
      category: new FormControl('', [Validators.required]),
      status: new FormControl('', [Validators.required]),
      sts_seria: new FormControl(''),
      sts_number: new FormControl(''),
      sts_date: new FormControl(''),
      osago_seria: new FormControl(''),
      osago_number: new FormControl(''),
      osago_date_finish: new FormControl(''),
      vin: new FormControl(''),
      kuzov_number: new FormControl(''),
      color: new FormControl(''),
      year_production: new FormControl(''),
      price_ocenka: new FormControl(''),
      to_date: new FormControl(''),
      to_probeg_prev: new FormControl(''),
      to_probeg_next: new FormControl(''),
      to_interval: new FormControl(''),
      oil_name: new FormControl(''),
      stoa_name: new FormControl(''),
      stoa_phone: new FormControl(''),
      days_1_2: new FormControl(''),
      days_3_7: new FormControl(''),
      days_8_14: new FormControl(''),
      days_15_30: new FormControl(''),
      days_31_more: new FormControl(''),
      mezgorod: new FormControl(''),
      russia: new FormControl(''),
      price_dop_hour: new FormControl(''),
      zalog: new FormControl(''),
      zalog_mej: new FormControl(''),
      zalog_rus: new FormControl(''),
      moyka: new FormControl(''),
    });
  }

  getparams()
  {
    this.subParams$ = this.rote.params.subscribe((params) => {
      this.carId = params['id'];
    });
  }

  getCarById()
  {
    this.subGetCarById$ = this.cars.getById(this.carId).subscribe((res) => {
      this.xsActualCar = res
      if (res.previewSrc) {
        this.imagePreview = res.previewSrc
      }

      this.form.patchValue({
        marka: res.marka,
        model: res.model,
        number: res.number,
        probeg: res.probeg,
        transmission: res.transmission,
        start_arenda: res.start_arenda,
        end_arenda: res.end_arenda,
        vladelec: res.vladelec,
        category: res.category,
        status: res.status,
        sts_seria: res.sts_seria,
        sts_number: res.sts_number,
        sts_date: res.sts_date,
        osago_seria: res.osago_seria,
        osago_number: res.osago_number,
        osago_date_finish: res.osago_date_finish,
        vin: res.vin,
        kuzov_number: res.kuzov_number,
        color: res.color,
        year_production: res.year_production,
        price_ocenka: res.price_ocenka,
        to_date: res.to_date,
        to_probeg_prev: res.to_probeg_prev,
        to_probeg_next: res.to_probeg_next,
        to_interval: res.to_interval,
        oil_name: res.oil_name,
        stoa_name: res.stoa_name,
        stoa_phone: res.stoa_phone,
        days_1_2: res.days_1_2,
        days_3_7: res.days_3_7,
        days_8_14: res.days_8_14,
        days_15_30: res.days_15_30,
        days_31_more: res.days_31_more,
        mezgorod: res.mezgorod,
        russia: res.russia,
        price_dop_hour: res.price_dop_hour,
        zalog: res.zalog,
        zalog_mej: res.zalog_mej,
        zalog_rus: res.zalog_rus,
        moyka: res.moyka,
      });
    });
  }

  getPartners()
  {
    this.subPartners$ = this.partners.get_all().subscribe(res => { this.xspartners = res; })
  }

  ngAfterViewInit(): void {
    MaterialService.initTabs(this.tabs.nativeElement)
    MaterialService.updateTextInputs();
  }



  // Обрабатываем загрузку картинок
  onFileUpload(event: any)
  {
    const file = event.target.files['0'];
    this.image = file;

    

    // Подключаем ридер для считывания картинки
    const reader = new FileReader();


    // Метод вызовется тогда, когда загрузится вся картинка
    reader.onload = () => {

      // Переменная для хранения информации об изображении
      this.imagePreview = reader.result;
    };


    // Читаем нужный нам файл
      reader.readAsDataURL(file);
  }



  // Обрабатываем кнопку загрузки тригиря клик по скрытому инпуту
  triggerClick()
  {
    this.inputRef.nativeElement.click();
  }



  onSubmit(){
    const car = {
      marka: this.form.value.marka,
      model: this.form.value.model,
      number: this.form.value.number,
      probeg: this.form.value.probeg,
      transmission: this.form.value.transmission,
      start_arenda: this.form.value.start_arenda,
      end_arenda: this.form.value.end_arenda,
      vladelec: this.form.value.vladelec,
      category: this.form.value.category,
      status: this.form.value.status,
      sts_seria: this.form.value.sts_seria,
      sts_number: this.form.value.sts_number,
      sts_date: this.form.value.sts_date,
      osago_seria: this.form.value.osago_seria,
      osago_number: this.form.value.osago_number,
      osago_date_finish: this.form.value.osago_date_finish,
      vin: this.form.value.vin,
      kuzov_number: this.form.value.kuzov_number,
      color: this.form.value.color,
      year_production: this.form.value.year_production,
      price_ocenka: this.form.value.price_ocenka,
      to_date: this.form.value.to_date,
      to_probeg_prev: this.form.value.to_probeg_prev,
      to_probeg_next: this.form.value.to_probeg_next,
      to_interval: this.form.value.to_interval,
      oil_name: this.form.value.oil_name,
      stoa_name: this.form.value.stoa_name,
      stoa_phone: this.form.value.stoa_phone,
      days_1_2: this.form.value.days_1_2,
      days_3_7: this.form.value.days_3_7,
      days_8_14: this.form.value.days_8_14,
      days_15_30: this.form.value.days_15_30,
      days_31_more: this.form.value.days_31_more,
      mezgorod: this.form.value.mezgorod,
      russia: this.form.value.russia,
      price_dop_hour: this.form.value.price_dop_hour,
      zalog: this.form.value.zalog,
      zalog_mej: this.form.value.zalog_mej,
      zalog_rus: this.form.value.zalog_rus,
      moyka: this.form.value.moyka,
    };
    
    this.subUpdateCar$ = this.cars.update(this.carId, car, this.image).subscribe((car) =>{
        MaterialService.toast('Автомобиль Изменен')
    });    

    
  }

}
