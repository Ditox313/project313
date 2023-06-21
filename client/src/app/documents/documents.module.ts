import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { AuthGuard } from '../auth/guards/auth.guard';
import { LoaderModule } from '../shared/loader/loader.module';
import { SiteLayoutComponent } from '../shared/layouts/components/site-layout/site-layout.component';
import { LayoutsModule } from '../shared/layouts/layouts.module';
import { BookingActComponent } from './components/booking-act/booking-act.component';
import { AddClientDogovorComponent } from './components/add-client-dogovor/add-client-dogovor.component';
import { DocumentsService } from './services/documents.service';
import { DogovorListComponent } from './components/dogovor-list/dogovor-list.component';
import { ShowClientDogovorComponent } from './components/show-client-dogovor/show-client-dogovor.component';
import { AddClientLawfaseDogovorComponent } from './components/add-client-lawfase-dogovor/add-client-lawfase-dogovor.component';
import { ShowActBookingComponent } from './components/show-act-booking/show-act-booking.component';
import { BookingActListComponent } from './components/booking-act-list/booking-act-list.component';
import { ReportSmenaComponent } from './components/report-smena/report-smena.component';
import { GoBackModule } from '../shared/modules/ga-back/go-back.module';


const routes = [
  {
    path: '',
    component: SiteLayoutComponent,
    canActivate: [AuthGuard], //Защищаем роуты которые относятся к самому приложению
    children: [
      { path: 'add-client-dogovor/:id', component: AddClientDogovorComponent },
      { path: 'add-client-lawfase-dogovor/:id', component: AddClientLawfaseDogovorComponent },
      { path: 'booking-act/:id', component: BookingActComponent },
      { path: 'show-client-dogovor/:id', component: ShowClientDogovorComponent },
      { path: 'show-act-booking/:id', component: ShowActBookingComponent },
      { path: 'dogovors-client/:id', component: DogovorListComponent },
      { path: 'report-smena/:id', component: ReportSmenaComponent },
    ],
  },
];



@NgModule({
  declarations: [
    BookingActComponent,
    AddClientDogovorComponent,
    DogovorListComponent,
    ShowClientDogovorComponent,
    AddClientLawfaseDogovorComponent,
    ShowActBookingComponent,
    BookingActListComponent,
    ReportSmenaComponent,
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    RouterModule.forChild(routes),
    LoaderModule,
    LayoutsModule,
    GoBackModule,
  ],
  exports: [
    DogovorListComponent,
    BookingActListComponent,
    AddClientDogovorComponent
  ],
  providers: [DocumentsService],
})
export class DocumentsModule { }
