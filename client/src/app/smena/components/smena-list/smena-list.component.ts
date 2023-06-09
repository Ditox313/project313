import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Smena } from 'src/app/shared/types/interfaces';
import { SmenaService } from '../../services/smena.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MaterialService } from 'src/app/shared/services/material.service';

// Шаг пагинации
const STEP = 2;


@Component({
  selector: 'app-smena-list',
  templateUrl: './smena-list.component.html',
  styleUrls: ['./smena-list.component.css']
})
export class SmenaListComponent implements OnInit, OnDestroy {

  Sub!: Subscription;
  subDeleteSmena$: Subscription;
  smenas: Smena[] = [];
  offset: any = 0;
  limit: any = STEP;
  loading = false;
  noMoreSmenas: Boolean = false;

  constructor(
    private smenaService: SmenaService,
    private rote: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.fetch();
  }


  ngOnDestroy(): void {
    if (this.Sub) {
      this.Sub.unsubscribe();
    }
    if (this.subDeleteSmena$) {
      this.subDeleteSmena$.unsubscribe();
    }
  }


  public fetch() {
    const params = {
      offset: this.offset,
      limit: this.limit,
    };

    this.loading = true;

    this.Sub = this.smenaService.fetch(params).subscribe((smenas) => {

      console.log(smenas)

      if (smenas.length < STEP) {
        this.noMoreSmenas = true;
      }

      this.loading = false;
      this.smenas = this.smenas.concat(smenas);
    });
  }

  loadmore() {
    this.loading = true;
    this.offset += STEP;
    this.fetch();
    this.loading = false;
  }


  onDeleteSmena(event: Event, smena: Smena): void {
    event.stopPropagation();

    console.log(smena)

    const dicision = window.confirm(`Удалить автомобиль?`);

    if (dicision) {
      this.subDeleteSmena$ = this.smenaService.delete(smena._id).subscribe(
        (res) => {
          const idxPos = this.smenas.findIndex((p) => p._id === smena._id);
          this.smenas.splice(idxPos, 1);


          MaterialService.toast('Смена удалена');
        },
        (error) => {
          MaterialService.toast(error.error.message);
        }
      );
    }
  }

}
