import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
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

@Component({
  selector: 'app-report-smena',
  templateUrl: './report-smena.component.html',
  styleUrls: ['./report-smena.component.css']
})
export class ReportSmenaComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
