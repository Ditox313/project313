import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { CarsService } from 'src/app/cars/services/cars.service';
import { ClientsService } from 'src/app/clients/services/clients.service';
import { MaterialService } from 'src/app/shared/services/material.service';
import { Booking, Client } from 'src/app/shared/types/interfaces';
import { BookingsService } from '../../services/bookings.service';




// Шаг пагинации
  const STEP = 20

@Component({
  selector: 'app-bookings',
  templateUrl: './bookings.component.html',
  styleUrls: ['./bookings.component.css'],
  providers: [DatePipe]
})
export class BookingsComponent implements OnInit, OnDestroy {
  
  Sub!: Subscription;
  subDeleteBooking$: Subscription;
  xsbookings: Booking[] = [];
  xsclients: Client[] = [];
  offset: any = 0;
  limit: any = STEP;
  loading = false;
  noMoreCars: Boolean = false;
  todayDate: any = new Date().toDateString();
  todayDateFormat = this.datePipe.transform(this.todayDate, 'yyyy-MM-dd');
  now = this.datePipe.transform(new Date().toDateString(), 'yyyy-MM-dd');

  constructor(
    private bookings: BookingsService,
    private router: Router,
    private rote: ActivatedRoute,
    private cars: CarsService,
    private clients: ClientsService,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.fetch();
  }

  ngOnDestroy(): void {
    if (this.Sub)
    {
      this.Sub.unsubscribe();
    }

    if (this.subDeleteBooking$)
    {
      this.subDeleteBooking$.unsubscribe();
    }
  }

  public fetch() {
    // Отправляем параметры для пагинации
    const params = {
      offset: this.offset,
      limit: this.limit,
    };

    this.loading = true;

    this.Sub = this.bookings.fetch(params).subscribe((bookings) => {
      if (bookings.length < STEP) {
        this.noMoreCars = true;
      }

      this.loading = false;
      this.xsbookings = this.xsbookings.concat(bookings);
    });
  }

  you_need_to_give_out_a_car(data)
  {
    let xs_a = new Date().toISOString() ;
    let xs_b = new Date(data.booking_start).toISOString() ;

    return xs_a > xs_b;
  }

  loadmore() {
    this.loading = true;
    this.offset += STEP;
    this.fetch();
    this.loading = false;
  }

  onDeleteCar(event: Event, xsbooking: Booking): void {
    event.stopPropagation();

    const dicision = window.confirm(`Удалить бронь?`);

    if (dicision) {
      this.subDeleteBooking$ = this.bookings.delete(xsbooking._id).subscribe(
        (res) => {
          const idxPos = this.xsbookings.findIndex(
            (p) => p._id === xsbooking._id
          );
          this.xsbookings.splice(idxPos, 1);
          MaterialService.toast(res.message);
        },
        (error) => {
          MaterialService.toast(error.error.message);
        }
      );
    }
  }
}
