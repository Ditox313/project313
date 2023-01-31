import {
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { BookingsService } from 'src/app/booking/services/bookings.service';
import { MaterialService } from 'src/app/shared/services/material.service';
import { Booking, Summa } from 'src/app/shared/types/interfaces';
import { PaysService } from '../../services/pays.service';

@Component({
  selector: 'app-add-pay',
  templateUrl: './add-pay.component.html',
  styleUrls: ['./add-pay.component.css']
})
export class AddPayComponent implements OnInit, OnDestroy {
  bookingId!: string;
  form!: FormGroup;
  actualBooking!: Booking;
  defaultValueArenda: string =  'Наличные'
  defaultValueZalog: string =  'Наличные'
  xspays!: any;

  summa: Summa = {
    car: {},
    tariff: '',
    booking_start: '',
    booking_end: '',
    summa: '',
    booking_days: '',
    summaFull: '',
    dop_hours: '',
    checkedTarif: '',
  };

  PayTypes:Array<any> = [
    {
      type: "terminal",
      value: "Терминал"
    },
    {
      type: "card",
      value: "На карту"
    },
    {
      type: "rs",
      value: "Р/с"
    },
  ]


  subParams$: Subscription;
  subGetByIdBooking$: Subscription;
  subGetPaysByBookingId$: Subscription;
  subCreatePay$: Subscription;
  

  constructor(private router: Router, private rote: ActivatedRoute, private bookings: BookingsService, private pays: PaysService) { }

  ngOnInit(): void {
    this.initForm();
    this.getParams();
    this.getByIdBooking();
    MaterialService.updateTextInputs();
  }

  ngOnDestroy(): void {
    if (this.subParams$)
    {
      this.subParams$.unsubscribe();
    }
    if (this.subGetByIdBooking$)
    {
      this.subGetByIdBooking$.unsubscribe();
    }
    if (this.subGetPaysByBookingId$)
    {
      this.subGetPaysByBookingId$.unsubscribe();
    }
    if (this.subCreatePay$)
    {
      this.subCreatePay$.unsubscribe();
    }
  }

  initForm()
  {
    this.form = new FormGroup({
      arenda: new FormControl('',),
      typePayArenda: new FormControl('',),
      zalog: new FormControl('',),
      typePayZalog: new FormControl('',),
      place_start_price: new FormControl('',),
    });
  }


  getParams()
  {
    this.subParams$ = this.rote.params.subscribe((params: any) => {
      this.bookingId = params['id'];
    });
  }

  getByIdBooking()
  {
    this.subGetByIdBooking$ = this.bookings.getById(this.bookingId).subscribe((res) => {
      this.actualBooking = res;
      this.summa.car = res.car;
      this.summa.tariff = res.tariff;
      this.summa.booking_start = res.booking_start;
      this.summa.booking_end = res.booking_end;
      this.summa.summa = res.summa;
      this.summa.summaFull = res.summaFull;
      this.summa.booking_days = res.booking_days;
      this.summa.dop_hours = res.dop_hours;

      // Высчитываем какой тариф выбран
      this.checkedTarif(this.summa.booking_days)

      this.subGetPaysByBookingId$ = this.pays.getPaysByBookingId(this.bookingId).subscribe((res) => {
        this.xspays = res;
      });

      if (+this.summa.dop_hours > 0) {
        // Подгружаем сумму залога и аренды в поля
        this.form.patchValue({
          arenda: +res.summa + (+this.summa.car.price_dop_hour * (+this.summa.dop_hours)),
          zalog: res.booking_zalog,
          place_start_price: res.dop_info_open.place_start_price
        });
      }
      else {
        // Подружаем сумму залога и аренды в поля
        this.form.patchValue({
          arenda: res.summa,
          zalog: res.booking_zalog,
          place_start_price: res.dop_info_open.place_start_price
        });
      }
    });
  }



  checkedTarif(countDay: any) {
    if (this.summa.booking_days < 3) {
      this.summa.checkedTarif = this.summa.car.days_1_2
    }
    if (this.summa.booking_days >= 3 && this.summa.booking_days < 7) {
      this.summa.checkedTarif = this.summa.car.days_3_7
    }
    if (this.summa.booking_days >= 7 && this.summa.booking_days < 14) {
      this.summa.checkedTarif = this.summa.car.days_8_14
    }
    if (this.summa.booking_days >= 14 && this.summa.booking_days < 31) {
      this.summa.checkedTarif = this.summa.car.days_15_30
    }
    if (this.summa.booking_days >= 31) {
      this.summa.checkedTarif = this.summa.car.days_31_more
    }
  }



  onSubmit() {
    if (this.form.value.arenda && !this.form.value.zalog)
    {
      const pay = {
        vid: 'Аренда',
        pricePay: this.form.value.arenda,
        typePay: this.form.value.typePayArenda,
        bookingId: this.bookingId,
      };

      const pay_2 = {
        vid: 'Подача авто',
        pricePay: this.actualBooking.dop_info_open.place_start_price,
        typePay: this.form.value.typePayArenda,
        bookingId: this.bookingId,
      };

      this.subCreatePay$ = this.pays.create(pay).pipe(
        switchMap(res => this.pays.create(pay_2)),
      ).subscribe((pay) => {
        MaterialService.toast('Платеж создан');
        this.router.navigate(['/view-booking', this.bookingId]);
      });

    }

    if (this.form.value.zalog && !this.form.value.arenda) {
      const pay = {
        vid: 'Залог',
        pricePay: this.form.value.zalog ,
        typePay: this.form.value.typePayZalog,
        bookingId: this.bookingId,
      };

      const pay_2 = {
        vid: 'Подача авто',
        pricePay: this.actualBooking.dop_info_open.place_start_price,
        typePay: this.form.value.typePayArenda,
        bookingId: this.bookingId,
      };


  

      this.subCreatePay$ = this.pays.create(pay).pipe(
        switchMap(res => this.pays.create(pay_2)),
      ).subscribe((pay) => {
        MaterialService.toast('Платеж создан');
        this.router.navigate(['/view-booking', this.bookingId]);
      });
    }


    if (this.form.value.arenda && this.form.value.zalog)
    {
      const pay = {
        vid: 'Аренда',
        pricePay: this.form.value.arenda ,
        typePay: this.form.value.typePayArenda,
        bookingId: this.bookingId,
      };

      const pay_2 = {
        vid: 'Залог',
        pricePay: this.form.value.zalog,
        typePay: this.form.value.typePayZalog,
        bookingId: this.bookingId,
      };

      const pay_3 = {
        vid: 'Подача авто',
        pricePay: this.actualBooking.dop_info_open.place_start_price,
        typePay: this.form.value.typePayArenda,
        bookingId: this.bookingId,
      };


      this.subCreatePay$ = this.pays.create(pay).pipe(
        switchMap(res => this.pays.create(pay_2)),
        switchMap(res => this.pays.create(pay_3)),
      ).subscribe((pay) => {
        MaterialService.toast('Платеж создан');
        this.router.navigate(['/view-booking', this.bookingId]);
      });
    }
  }
}


