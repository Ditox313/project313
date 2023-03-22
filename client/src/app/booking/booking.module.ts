import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { LoaderModule } from '../shared/loader/loader.module';
import { AuthGuard } from '../auth/guards/auth.guard';
import { BookingsComponent } from './components/bookings/bookings.component';
import { AddBookingComponent } from './components/add-booking/add-booking.component';
import { EditBookingComponent } from './components/edit-booking/edit-booking.component';
import { BookingsService } from './services/bookings.service';
import { SiteLayoutComponent } from '../shared/layouts/components/site-layout/site-layout.component';
import { LayoutsModule } from '../shared/layouts/layouts.module';
import { ViewBookingComponent } from './components/view-booking/view-booking.component';
import { PaysModule } from '../pays/pays.module';
import { ExtendBookingComponent } from './components/extend-booking/extend-booking.component';
import { CloseComponent } from './components/close/close.component';
import { DocumentsModule } from '../documents/documents.module';
import { AddDogovorForClientModule } from '../documents/modules/add-dogovor-for-client/add-dogovor-for-client.module';



const routes = [
  {
    path: '',
    component: SiteLayoutComponent,
    canActivate: [AuthGuard], //Защищаем роуты которые относятся к самому приложению
    children: [
      { path: 'bookings-page', component: BookingsComponent },
      { path: 'add-booking', component: AddBookingComponent },
      { path: 'view-booking/:id', component: ViewBookingComponent },
      { path: 'edit-booking/:id', component: EditBookingComponent },
      { path: 'close-booking/:id', component: CloseComponent },
      { path: 'extend-booking/:id', component: ExtendBookingComponent },
      { path: 'edit-booking/:id/:view', component: EditBookingComponent },
    ],
  },
];

@NgModule({
  declarations: [BookingsComponent, AddBookingComponent, EditBookingComponent, 
  ViewBookingComponent, ExtendBookingComponent, CloseComponent],
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    RouterModule.forChild(routes),
    LoaderModule,
    LayoutsModule,
    PaysModule,
    DocumentsModule,
    AddDogovorForClientModule
  ],
  providers: [BookingsService],
})
export class BookingModule {}
