import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import htmlToPdfmake from 'html-to-pdfmake';
import { DocumentsService } from '../../services/documents.service';
import { DatePipe } from '@angular/common';
import { MaterialService } from 'src/app/shared/services/material.service';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs';
import { ReportSmena } from 'src/app/shared/types/interfaces';

@Component({
  selector: 'app-report-smena',
  templateUrl: './report-smena.component.html',
  styleUrls: ['./report-smena.component.css']
})
export class ReportSmenaComponent implements OnInit {
  @ViewChild('content') content!: ElementRef;
  subParams$: Subscription;
  smemaId: string;
  subReportgetById$: Subscription
  actualReport: ReportSmena

  constructor(
    private router: Router,
    private rote: ActivatedRoute,
    private ducumentsServise: DocumentsService,
  ) { }

  ngOnInit(): void {
    this.getParams()
  }


  getParams() {
    this.subParams$ = this.rote.params.subscribe((params: any) => {
      this.smemaId = params['id'];
      this.getReportById()
    });
  }

  getReportById() {
    this.subReportgetById$ = this.ducumentsServise.getReportSmenaById(this.smemaId).subscribe((res) => {
      this.actualReport = res;

    });
  }

  generatePDF() {
    var html = htmlToPdfmake(this.content.nativeElement.innerHTML);

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
