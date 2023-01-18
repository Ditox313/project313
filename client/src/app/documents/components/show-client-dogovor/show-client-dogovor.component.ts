import {  Component, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DocumentsService } from '../../services/documents.service';

import { Dogovor } from 'src/app/shared/types/interfaces';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import htmlToPdfmake from 'html-to-pdfmake';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-show-client-dogovor',
  templateUrl: './show-client-dogovor.component.html',
  styleUrls: ['./show-client-dogovor.component.css']
})
export class ShowClientDogovorComponent implements OnInit, OnDestroy {
  form: any;
  dogovor_id: string;
  xs_actual_dogovor: Dogovor;
  subParams$: Subscription;
  subGetDogovorById$: Subscription;


  constructor(
    private rote: ActivatedRoute,
    private documentsServices: DocumentsService,
  ) {}

  ngOnInit(): void {
    this.getParams();
  }

  ngOnDestroy(): void {
    if (this.subParams$)
    {
      this.subParams$.unsubscribe();
    }
    if (this.subGetDogovorById$)
    {
      this.subGetDogovorById$.unsubscribe();
    }
  }


  getParams()
  {
    this.subParams$ = this.rote.params.subscribe((params) => {
      this.dogovor_id = params['id'];

      this.subGetDogovorById$ = this.documentsServices.getDogovorById(params['id']).subscribe(res => {
        this.xs_actual_dogovor = res;
      })
    });
  }

  generatePDF() {
    var html = htmlToPdfmake(this.xs_actual_dogovor.content);

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
