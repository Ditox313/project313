import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MaterialService } from 'src/app/shared/services/material.service';
import { BookingAct, Dogovor } from 'src/app/shared/types/interfaces';
import { DocumentsService } from '../../services/documents.service';


// Шаг пагинации
const STEP = 3

@Component({
  selector: 'app-booking-act-list',
  templateUrl: './booking-act-list.component.html',
  styleUrls: ['./booking-act-list.component.css']
})
export class BookingActListComponent implements OnInit, OnDestroy {

  @Input() clientId: string | undefined;
  xs_acts: BookingAct[] = [];
  offset: any = 0;
  limit: any = STEP;
  noMoreActs: Boolean = false;
  loading = false;
  Sub!: Subscription;
  subDalete$: Subscription;



  constructor(
    private documentsServices: DocumentsService,
  ) { }

  ngOnInit(): void {
    this.fetch()
  }

  ngOnDestroy(): void {
    if (this.Sub)
    {
      this.Sub.unsubscribe();
    }
    if (this.subDalete$)
    {
      this.subDalete$.unsubscribe();
    }
  }



  public fetch() {
    const params = {
      offset: this.offset,
      limit: this.limit,
      clientId: this.clientId
    }

    this.loading = true

    this.Sub = this.documentsServices.fetch_acts(params).subscribe((acts) => {

      if (acts.length < STEP) {
        this.noMoreActs = true
      }

      this.loading = false
      this.xs_acts = this.xs_acts.concat(acts)
    });
  }


  DeleteAct(event: Event, xsact: BookingAct): void {
    event.stopPropagation();

    const dicision = window.confirm(`Удалить акт?`);

    if (dicision) {
      this.subDalete$ = this.documentsServices.delete_act(xsact._id).subscribe(
        (res) => {
          const idxPos = this.xs_acts.findIndex(
            (p) => p._id === xsact._id
          );
          this.xs_acts.splice(idxPos, 1);
          MaterialService.toast(res.message);
        },
        (error) => {
          MaterialService.toast(error.error.message);
        }
      );
    }
  }


  loadmore() {
    this.loading = true
    this.offset += STEP
    this.fetch()
    this.loading = false
  }

}
