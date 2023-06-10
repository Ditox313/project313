import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { CarsService } from 'src/app/cars/services/cars.service';
import { PaysService } from 'src/app/pays/services/pays.service';
import { MaterialService } from 'src/app/shared/services/material.service';
import { Booking, Settings, Summa } from 'src/app/shared/types/interfaces';
import { BookingsService } from '../../services/bookings.service';
import { DatePipe } from '@angular/common';


@Component({
  selector: 'app-close',
  templateUrl: './close.component.html',
  styleUrls: ['./close.component.css']
})
export class CloseComponent implements OnInit, OnDestroy {

  form!: FormGroup;
  bookingId!: string;
  actualBooking!: Booking;
  subGetByIdBooking$: Subscription;
  subBookingClose$: Subscription;
  update_after_booking_close$: Subscription
  car_add_close_booking$: Subscription

  PayTypes: Array<any> = [
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

  summa: Summa = {
    car: {},
    tariff: '',
    booking_start: '',
    booking_end: '',
    summa: '',
    booking_days: '',
    summaFull: '',
    dop_hours: '',
  };

  defaultValueArenda: string = 'Наличные'
  defaultValueZalog: string = 'Наличные'


  

  constructor(
    private bookings: BookingsService,
    private router: Router,
    private rote: ActivatedRoute,
    private pays: PaysService,
    private cars: CarsService,
    private datePipe: DatePipe
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.getParams();
    this.getByIdBooking();
  }

  ngOnDestroy(): void {
    if (this.subGetByIdBooking$)
    {
      this.subGetByIdBooking$.unsubscribe();
    }

    if (this.subBookingClose$)
    {
      this.subBookingClose$.unsubscribe();
    }

    if (this.update_after_booking_close$) {
      this.update_after_booking_close$.unsubscribe();
    }

    if (this.car_add_close_booking$) {
      this.car_add_close_booking$.unsubscribe();
    }
  }

  initForm()
  {
    this.form = new FormGroup({
      booking_end: new FormControl('', [Validators.required]),
      probeg_new: new FormControl('', [Validators.required]),
      clear_auto: new FormControl(''),
      full_tank: new FormControl(''),
      return_part: new FormControl(''),
      return_part_comment: new FormControl(''),
      return_part_price: new FormControl(''),
      typePayArenda: new FormControl('',),
    });
  }


  getParams()
  {
    this.rote.params.subscribe((params: any) => {
      this.bookingId = params['id'];
    });
  }

  getByIdBooking()
  {
    this.subGetByIdBooking$ = this.bookings.getById(this.bookingId).subscribe((res) => {
      this.actualBooking = res;
      
      this.form.patchValue({
        booking_end: res.booking_end,
      });


      this.summa.car = res.car;
      this.summa.tariff = res.tariff;
      this.summa.booking_start = res.booking_start;
      this.summa.booking_end = res.booking_end;
      this.summa.summa = res.summa;
      this.summa.summaFull = res.summaFull;
      this.summa.booking_days = res.booking_days;
      this.summa.dop_hours = res.dop_hours;

      

      MaterialService.updateTextInputs();
    });
  }

  onSubmit()
  { 

    
    if (this.actualBooking.dop_info_open.additional_services_moyka)
    {
      if (!this.form.value.return_part)
      {
        const car: any = {
          probeg: this.form.value.probeg_new,
        }

        const pay = {
          vid: 'Возврат залога',
          pricePay: this.actualBooking.booking_zalog,
          typePay: this.form.value.typePayArenda,
          bookingId: this.bookingId,
        };



        const close_info_log = {
          date: this.datePipe.transform(new Date(), 'dd.MM.yyyy HH:mm:ss'),
          status: 'Закрыта'
        }

        


        const booking: any = {
          summaFull: (+this.summa.summaFull) - (+this.actualBooking.booking_zalog),
          booking_zalog: (+this.actualBooking.booking_zalog) - (+this.actualBooking.booking_zalog),
          status: 'Закрыта',
          dop_info_close: {
            clear_auto: this.form.value.clear_auto || false,
            full_tank: this.form.value.full_tank || false,
            probeg_new: this.form.value.probeg_new,
          }
        }


        // Отправляем данные в логирование брони
        this.update_after_booking_close$ = this.bookings.update_after_booking_close(this.actualBooking._id, close_info_log).subscribe()

        

        // Отправляем финальную бронь в авто
        // this.car_add_close_booking$ = this.cars.update_after_booking_close(this.actualBooking.car._id, booking).subscribe(res => {
        //   console.log('111', res)
        // });
        


        this.subBookingClose$ = this.bookings.close(this.bookingId, booking).pipe(
          map(res => {
            this.pays.vozvrat_zaloga(pay).subscribe((pay) => {
              MaterialService.toast('Возврат залога');
            });
            return res;
          })
        ).pipe(
          map(res => {
            this.cars.close(this.actualBooking.car._id, car).subscribe((car) => {
            });
            return res;
          })
        ).subscribe((booking) => {
          MaterialService.toast('Бронь закрыта');
          this.router.navigate(['/bookings-page']);
        });

      } 
      else if(this.form.value.return_part)
      {
        

        const car: any = {
          probeg: this.form.value.probeg_new,
        }

        const pay = {
          vid: 'Частичный возврат залога',
          pricePay: this.form.value.return_part_price,
          typePay: this.form.value.typePayArenda,
          bookingId: this.bookingId,
        };


        const booking: any = {
          summaFull: (+this.summa.summaFull) - (+this.form.value.return_part_price),
          booking_zalog: (+this.actualBooking.booking_zalog) - (+this.form.value.return_part_price),
          status: 'Закрыта',
          dop_info_close: {
            clear_auto: this.form.value.clear_auto || false,
            full_tank: this.form.value.full_tank || false,
            probeg_new: this.form.value.probeg_new,
            return_part_comment: this.form.value.return_part_comment,
            return_part_price: this.form.value.return_part_price
          }
        }


        this.subBookingClose$ = this.bookings.close(this.bookingId, booking).pipe(
          map(res => {
            this.pays.vozvrat_zaloga(pay).subscribe((pay) => {
              MaterialService.toast('Частичный возврат залога');
            });
            return res;
          })
        ).pipe(
          map(res => {
            this.cars.close(this.actualBooking.car._id, car).subscribe((car) => {
            });
            return res;
          })
        ).subscribe((booking) => {
          MaterialService.toast('Бронь закрыта');
          this.router.navigate(['/bookings-page']);
        });
      } 
    }
    else
    {
    if(!this.form.value.clear_auto && !this.form.value.return_part)
      {
        const car: any = {
          probeg: this.form.value.probeg_new,
        }

        const pay = {
          vid: 'Возврат залога',
          pricePay: this.actualBooking.booking_zalog,
          typePay: this.form.value.typePayArenda,
          bookingId: this.bookingId,
        };

        const pay2 = {
          vid: 'Мойка',
          pricePay: this.actualBooking.dop_info_open.moyka,
          typePay: this.form.value.typePayArenda,
          bookingId: this.bookingId,
        };


        const booking: any = {
          summaFull: (+this.summa.summaFull) - (+this.actualBooking.booking_zalog) + (+this.actualBooking.dop_info_open.moyka),
          booking_zalog: (+this.actualBooking.booking_zalog) - (+this.actualBooking.booking_zalog),
          status: 'Закрыта',
          dop_info_close: {
            clear_auto: this.form.value.clear_auto || false,
            full_tank: this.form.value.full_tank || false,
            probeg_new: this.form.value.probeg_new,
          }
        }


        this.subBookingClose$ = this.bookings.close(this.bookingId, booking).pipe(
          map(res => {
            this.pays.vozvrat_zaloga(pay).subscribe((pay) => {
              MaterialService.toast('Возврат залога проведен');

              this.pays.create(pay2).subscribe((pay) => {
                MaterialService.toast('Оплата мойки');
              });
            });
            return res;
          })
        ).pipe(
          map(res => {
            this.cars.close(this.actualBooking.car._id, car).subscribe((car) => {
            });
            return res;
          })
        ).subscribe((booking) => {
          MaterialService.toast('Бронь закрыта');
          this.router.navigate(['/bookings-page']);
        });

      } 
    else if(this.form.value.clear_auto && this.form.value.return_part)
      {
        

        const car: any = {
          probeg: this.form.value.probeg_new,
        }

        const pay = {
          vid: 'Частичный возврат залога',
          pricePay: this.form.value.return_part_price,
          typePay: this.form.value.typePayArenda,
          bookingId: this.bookingId,
        };


        const booking: any = {
          summaFull: (+this.summa.summaFull) - (+this.form.value.return_part_price),
          booking_zalog: (+this.actualBooking.booking_zalog) - (+this.form.value.return_part_price),
          status: 'Закрыта',
          dop_info_close: {
            clear_auto: this.form.value.clear_auto || false,
            full_tank: this.form.value.full_tank || false,
            probeg_new: this.form.value.probeg_new,
            return_part_comment: this.form.value.return_part_comment,
            return_part_price: this.form.value.return_part_price
          }
        }


        this.subBookingClose$ = this.bookings.close(this.bookingId, booking).pipe(
          map(res => {
            this.pays.vozvrat_zaloga(pay).subscribe((pay) => {
            });
            return res;
          })
        ).pipe(
          map(res => {
            this.cars.close(this.actualBooking.car._id, car).subscribe((car) => {
            });
            return res;
          })
        ).subscribe((booking) => {
          MaterialService.toast('Бронь закрыта');
          this.router.navigate(['/bookings-page']);
        });
      } 
    else if (!this.form.value.clear_auto && this.form.value.return_part) {
        const car: any = {
          probeg: this.form.value.probeg_new,
        }

        const pay = {
          vid: 'Частичный возврат залога',
          pricePay: this.form.value.return_part_price,
          typePay: this.form.value.typePayArenda,
          bookingId: this.bookingId,
        };

        const pay2 = {
          vid: 'Мойка',
          pricePay: this.actualBooking.dop_info_open.moyka,
          typePay: this.form.value.typePayArenda,
          bookingId: this.bookingId,
        };


        const booking: any = {
          summaFull: (+this.summa.summaFull) - (+this.form.value.return_part_price) + (+this.actualBooking.dop_info_open.moyka),
          booking_zalog: (+this.actualBooking.booking_zalog) - (+this.form.value.return_part_price),
          status: 'Закрыта',
          dop_info_close: {
            clear_auto: this.form.value.clear_auto || false,
            full_tank: this.form.value.full_tank || false,
            probeg_new: this.form.value.probeg_new,
            return_part_comment: this.form.value.return_part_comment,
            return_part_price: this.form.value.return_part_price
          }
        }


        this.subBookingClose$ = this.bookings.close(this.bookingId, booking).pipe(
          map(res => {
            this.pays.vozvrat_zaloga(pay).subscribe((pay) => {
              MaterialService.toast('Частичный возврат залога');

              this.pays.create(pay2).subscribe((pay) => {
                MaterialService.toast('Оплата мойки');
              });
            });
            return res;
          })
        ).pipe(
          map(res => {
            this.cars.close(this.actualBooking.car._id, car).subscribe((car) => {
            });
            return res;
          })
        ).subscribe((booking) => {
          MaterialService.toast('Бронь закрыта');
          this.router.navigate(['/bookings-page']);
        });
      } 
    else if (this.form.value.clear_auto && !this.form.value.return_part) {
        const car: any = {
          probeg: this.form.value.probeg_new,
        }

        const pay = {
          vid: 'Возврат залога',
          pricePay: this.actualBooking.booking_zalog,
          typePay: this.form.value.typePayArenda,
          bookingId: this.bookingId,
        };

        const booking: any = {
          summaFull: (+this.summa.summaFull) - (+this.actualBooking.booking_zalog),
          booking_zalog: (+this.actualBooking.booking_zalog) - (+this.actualBooking.booking_zalog),
          status: 'Закрыта',
          dop_info_close: {
            clear_auto: this.form.value.clear_auto || false,
            full_tank: this.form.value.full_tank || false,
            probeg_new: this.form.value.probeg_new,
          }
        }


        this.subBookingClose$ = this.bookings.close(this.bookingId, booking).pipe(
          map(res => {
            this.pays.vozvrat_zaloga(pay).subscribe((pay) => {
              MaterialService.toast('Возврат залога проведен');
            });
            return res;
          })
        ).pipe(
          map(res => {
            this.cars.close(this.actualBooking.car._id, car).subscribe((car) => {
            });
            return res;
          })
        ).subscribe((booking) => {
          MaterialService.toast('Бронь закрыта');
          this.router.navigate(['/bookings-page']);
        });
      }
    }

  }
}
