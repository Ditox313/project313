import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientsListComponent } from './components/clients-list/clients-list.component';
import { ClientsModule } from '../../clients.module';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LoaderModule } from 'src/app/shared/loader/loader.module';
import { LayoutsModule } from 'src/app/shared/layouts/layouts.module';



@NgModule({
  declarations: [
    ClientsListComponent
  ],
  imports: [
    CommonModule,
    ClientsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    LoaderModule,
    LayoutsModule,
  ],
  exports: [
    ClientsListComponent
  ]
})
export class ClientsListForSearchModule { }
