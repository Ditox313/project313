import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MaterialService } from 'src/app/shared/services/material.service';
import { Partner } from 'src/app/shared/types/interfaces';
import { PartnersService } from '../../services/partners.service';

import { Store, select } from '@ngrx/store';
import {
  partnersAddAction,
} from '../../store/actions/partners.action';


// Шаг пагинации
  const STEP = 15

@Component({
  selector: 'app-partners',
  templateUrl: './partners.component.html',
  styleUrls: ['./partners.component.css'],
})


export class PartnersComponent implements OnInit, OnDestroy {
  Sub!: Subscription;
  subDaletePartner$: Subscription;
  xspartners: Partner[] = [];
  offset: any = 0;
  limit: any = STEP;
  loading = false;
  noMoreCars: Boolean = false;
  constructor(
    private partners: PartnersService,
    private router: Router,
    private rote: ActivatedRoute,
    private store: Store
  ) {}

  ngOnInit(): void {
    this.fetch();
  }

  ngOnDestroy(): void {
    if (this.Sub)
    {
      this.Sub
    }
    if (this.subDaletePartner$)
    {
      this.subDaletePartner$.unsubscribe();
    }
  }


  public fetch() {
    const params = {
      offset: this.offset,
      limit: this.limit,
    };

    this.loading = true;
    this.Sub = this.partners.fetch(params).subscribe((partners) => {
      this.store.dispatch(partnersAddAction({ partners: partners }));

      if (partners.length < STEP) {
        this.noMoreCars = true;
      }

      this.loading = false;
      this.xspartners = this.xspartners.concat(partners);
    });
  }

  loadmore() {
    this.loading = true;
    this.offset += STEP;
    this.fetch();
    this.loading = false;
  }

  onDeleteCar(event: Event, xspartner: Partner): void {
    console.log(xspartner);

    event.stopPropagation();

    const dicision = window.confirm(`Удалить партнера?`);

    if (dicision) {
      this.subDaletePartner$ = this.partners.delete(xspartner._id).subscribe(
        (res) => {
          const idxPos = this.xspartners.findIndex(
            (p) => p._id === xspartner._id
          );
          this.xspartners.splice(idxPos, 1);
          // this.store.dispatch(partnersAddAction({ partners: this.xspartners }));
          MaterialService.toast(res.message);
        },
        (error) => {
          MaterialService.toast(error.error.message);
        }
      );
    }
  }
}
