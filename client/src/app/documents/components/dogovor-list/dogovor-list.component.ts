import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MaterialService } from 'src/app/shared/services/material.service';
import { Dogovor } from 'src/app/shared/types/interfaces';
import { DocumentsService } from '../../services/documents.service';


// Шаг пагинации
const STEP = 3

@Component({
  selector: 'app-dogovor-list',
  templateUrl: './dogovor-list.component.html',
  styleUrls: ['./dogovor-list.component.css']
})


export class DogovorListComponent implements OnInit, OnDestroy {
  @Input() clientId: string | undefined;
  xs_dogovors: Dogovor[] = [];
  offset: any = 0;
  limit: any = STEP;
  noMoreDogovors: Boolean = false;
  loading = false;
  Sub!: Subscription;
  subDelete$: Subscription;


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
    if (this.subDelete$)
    {
      this.subDelete$.unsubscribe();
    }
  }



  public fetch() {
    const params = {
      offset: this.offset,
      limit: this.limit,
      clientId: this.clientId
    }

    this.loading = true
    this.Sub = this.documentsServices.fetch(params).subscribe((dogovors) => {

      if (dogovors.length < STEP) {
        this.noMoreDogovors = true
      }

      this.loading = false
      this.xs_dogovors = this.xs_dogovors.concat(dogovors)
    });
  }


  DeleteDogovor(event: Event, xsdogovor: Dogovor): void {
    event.stopPropagation();

    const dicision = window.confirm(`Удалить договор?`);

    if (dicision) {
      this.subDelete$ = this.documentsServices.delete_dogovor(xsdogovor._id).subscribe(
        (res) => {
          const idxPos = this.xs_dogovors.findIndex(
            (p) => p._id === xsdogovor._id
          );
          this.xs_dogovors.splice(idxPos, 1);
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
