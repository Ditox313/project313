import { MaterialService } from 'src/app/shared/services/material.service';
import {  Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';

import { ActivatedRoute } from '@angular/router';
import { DocumentsService } from '../../services/documents.service';

import { BookingAct, Dogovor } from 'src/app/shared/types/interfaces';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import htmlToPdfmake from 'html-to-pdfmake';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-show-act-booking',
  templateUrl: './show-act-booking.component.html',
  styleUrls: ['./show-act-booking.component.css']
})
export class ShowActBookingComponent implements OnInit, OnDestroy {
  form: any;
  act_id: string;
  xs_actual_act: BookingAct;
  subParams$: Subscription;
  subGetActById$: Subscription;


  constructor(
    private rote: ActivatedRoute,
    private documentsServices: DocumentsService,
    private location: Location
  ) { }



  ngOnInit(): void {
    this.getParams();
  }


  ngOnDestroy(): void {
    this.subParams$.unsubscribe();
    this.subGetActById$.unsubscribe();
  }

  getParams()
  {
    this.subParams$ = this.rote.params.subscribe((params) => {
      this.act_id = params['id'];

      this.subGetActById$ = this.documentsServices.getActById(params['id']).subscribe(res => {
        this.xs_actual_act = res;
      })
    });
  }

  isGoBack() {
    this.location.back();
  }

  generatePDF() {
    var html = htmlToPdfmake(this.xs_actual_act.content);
    let docDefinition = {
      content: [html],
      pageSize: 'A4',
      pageMargins: [20, 20, 20, 20],
      styles: {
        fsz: {
          fontSize: 6
        },
        fsz_b: {
          fontSize: 10
        }
      }
    };
    pdfMake.createPdf(docDefinition).open();
  } 

}
