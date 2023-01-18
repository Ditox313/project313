import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { LoaderModule } from '../shared/loader/loader.module';
import { AuthGuard } from '../auth/guards/auth.guard';
import { SiteLayoutComponent } from '../shared/layouts/components/site-layout/site-layout.component';
import { LayoutsModule } from '../shared/layouts/layouts.module';
import { AddPayComponent } from './components/add-pay/add-pay.component';

const routes = [
  {
    path: '',
    component: SiteLayoutComponent,
    canActivate: [AuthGuard], //Защищаем роуты которые относятся к самому приложению
    children: [
      { path: 'add-pay/:id', component: AddPayComponent },
      // { path: 'add-booking', component: AddBookingComponent },
      // { path: 'view-booking/:id', component: ViewBookingComponent },
      // { path: 'edit-booking/:id', component: EditBookingComponent },
      // { path: 'edit-booking/:id/:view', component: EditBookingComponent },
    ],
  },
];

@NgModule({
  declarations: [
    AddPayComponent
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
  ],
  providers: [],
  exports: [
    AddPayComponent
  ]
})
export class PaysModule { }
