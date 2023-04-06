import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientsListComponent } from './components/clients-list/clients-list.component';
import { ClientsModule } from '../../clients.module';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LoaderModule } from 'src/app/shared/loader/loader.module';
import { LayoutsModule } from 'src/app/shared/layouts/layouts.module';
import { SearchClientModule } from '../search-client/search-client.module';
import { SiteLayoutComponent } from 'src/app/shared/layouts/components/site-layout/site-layout.component';
import { AuthGuard } from 'src/app/auth/guards/auth.guard';
import { DocumentsModule } from 'src/app/documents/documents.module';


const routes = [
  {
    path: '',
    component: SiteLayoutComponent,
    canActivate: [AuthGuard], //Защищаем роуты которые относятся к самому приложению
    children: [
      { path: 'clients-list-for-search', component: ClientsListComponent },
    ],
  },
];



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
    SearchClientModule,
    ClientsModule,
    RouterModule.forChild(routes),
    DocumentsModule
  ],
  exports: [
    ClientsListComponent
  ]
})
export class ClientsListForSearchModule { }
