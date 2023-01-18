import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

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

  constructor(
    private bookings: BookingsService,
    private router: Router,
    private rote: ActivatedRoute,
    private cars: CarsService,
    private clients: ClientsService
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

      // of(this.xsbookings)
      //   .pipe(
      //     map((bookings) => {
      //       bookings.forEach((xsbooking) => {
      //         this.cars.getById(xsbooking.car).subscribe((data) => {
      //           xsbooking.car_meta = data;
      //         });
      //       });

      //       return bookings;
      //     })
      //   )
      //   .pipe(
      //     map((bookings) => {
      //       bookings.forEach((xsbooking) => {
      //         this.clients.getById(xsbooking.client).subscribe((data) => {
      //           xsbooking.client_meta = data;
      //         });
      //       });

      //       return bookings;
      //     })
      //   )
      //   .subscribe((data) => {
      //     console.log('После подписки', this.xsbookings);
      //   });

    });
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
