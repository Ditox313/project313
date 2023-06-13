import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Booking, Client, User } from 'src/app/shared/types/interfaces';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import htmlToPdfmake from 'html-to-pdfmake';
import { AuthService } from 'src/app/auth/services/auth.service';
import { BookingsService } from 'src/app/booking/services/bookings.service';
import { convert as convertNumberToWordsRu } from 'number-to-words-ru';
import { DatePipe } from '@angular/common';
import { DocumentsService } from '../../services/documents.service';
import { MaterialService } from 'src/app/shared/services/material.service';
import { Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-booking-act',
  templateUrl: './booking-act.component.html',
  styleUrls: ['./booking-act.component.css']
})
export class BookingActComponent implements OnInit, OnDestroy {

  bookingId!: string;
  actualBooking!: Booking;
  actualUser!: User;
  actualClient!: Client;
  yearDate: any;
  xs_actual_date: any;
  @ViewChild('content') content!: ElementRef;
  xsNumberSummAuto: string = '';

  subParams$: Subscription;
  getUser$: Subscription;
  subGetById$: Subscription;
  createAct$: Subscription;

  constructor(
    private bookings: BookingsService,
    private router: Router,
    private rote: ActivatedRoute,
    private auth: AuthService,
    private datePipe: DatePipe,
    private documentService: DocumentsService,
  ) { }

  ngOnInit(): void {
    this.getParams();
    this.getUser();
    this.getById();
    this.xs_actual_date = this.datePipe.transform(Date.now(), 'dd.MM.yyyy HH:mm:ss');
  }

  ngOnDestroy(): void {
    if (this.subParams$) {
      this.subParams$.unsubscribe();
    }
    if (this.getUser$) {
      this.getUser$.unsubscribe();
    }
    if (this.subGetById$) {
      this.subGetById$.unsubscribe();
    }
    if (this.createAct$) {
      this.createAct$.unsubscribe();
    }
  }


  generatePDF() {
    var html = htmlToPdfmake(this.content.nativeElement.innerHTML);

    let docDefinition = {
      content: [html],
      pageSize: 'A4',
      pageMargins: [20, 20, 20, 20],
      styles: {
        fsz: { // we define the class called "red"
          fontSize: 6
        },
        fsz_b: { // we define the class called "red"
          fontSize: 10
        },
      }
    };

    pdfMake.createPdf(docDefinition).open();
  }

  getParams() {
    this.subParams$ = this.rote.params.subscribe((params: any) => {
      this.bookingId = params['id'];
    });
  }

  getUser() {
    this.getUser$ = this.auth.get_user().subscribe(user => {
      this.actualUser = user;
    })
  }

  getById() {
    this.subGetById$ = this.bookings.getById(this.bookingId).subscribe((res) => {
      this.actualBooking = res;
      this.xsNumberSummAuto = convertNumberToWordsRu(this.actualBooking.car.price_ocenka)
      this.actualClient = res.client

      this.yearDate = new Date(this.actualBooking.date);
      this.yearDate.setDate(this.yearDate.getDate() + 365);
    });
  }



  createAct() {
    let administrator = this.actualUser;
    delete administrator.password;

    const act = {
      date: this.xs_actual_date,
      act_number: this.xs_actual_date + '/СТС-' + this.actualClient.order,
      administrator: administrator,
      content: this.content.nativeElement.innerHTML,
      clientId: this.actualBooking.client._id,
      booking: this.actualBooking,
      bookingId: this.actualBooking._id
    }


    this.createAct$ = this.documentService.create_booking_act(act).pipe(
      switchMap(res => this.bookings.update_after_booking_act(this.actualBooking._id, act)),
    ).subscribe((pay) => {
      MaterialService.toast('Акт сохранен');
      this.router.navigate(['/view-booking', this.actualBooking._id]);
    });


    // this.createAct$ = this.documentService.create_booking_act(act).subscribe((act) => {
    //   MaterialService.toast('Акт сохранен');
    //   this.router.navigate(['/view-booking', this.actualBooking._id]);
    // });
  }

}



