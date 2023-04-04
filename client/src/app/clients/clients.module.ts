import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { LoaderModule } from '../shared/loader/loader.module';
import { AuthGuard } from '../auth/guards/auth.guard';
import { ClientsComponent } from './components/clients/clients.component';
import { AddClientComponent } from './components/add-client/add-client.component';
import { ShowClientComponent } from './components/show-client/show-client.component';
import { ClientsService } from './services/clients.service';
import { SiteLayoutComponent } from '../shared/layouts/components/site-layout/site-layout.component';
import { LayoutsModule } from '../shared/layouts/layouts.module';


import { StoreModule } from '@ngrx/store';
import { reducers } from 'src/app/clients/store/reducers';
import { EffectsModule } from '@ngrx/effects';
import { ClientsEffect } from './store/effects/clients.effect';
import { AddClientLawfaseComponent } from './components/add-client-lawfase/add-client-lawfase.component';
import { ShowClientLawfaseComponent } from './components/show-client-lawfase/show-client-lawfase.component';
import { DocumentsModule } from '../documents/documents.module';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { NgxMaskModule } from 'ngx-mask';


const routes = [
  {
    path: '',
    component: SiteLayoutComponent,
    canActivate: [AuthGuard], //Защищаем роуты которые относятся к самому приложению
    children: [
      { path: 'clients-page', component: ClientsComponent },
      { path: 'add-client', component: AddClientComponent },
      { path: 'add-client-lawfase', component: AddClientLawfaseComponent },
      { path: 'add-client/:id', component: AddClientComponent },
      { path: 'show-client/edit/:id', component: ShowClientComponent },
      { path: 'show-client/edit/:id/:breadcrumbs', component: ShowClientComponent },
      { path: 'show-client-lawfase/edit/:id', component: ShowClientLawfaseComponent },
    ],
  },
];

@NgModule({
  declarations: [ClientsComponent, AddClientComponent, ShowClientComponent, AddClientLawfaseComponent, ShowClientLawfaseComponent],
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    RouterModule.forChild(routes),
    LoaderModule,
    LayoutsModule,
    StoreModule.forFeature('clients', reducers),
    EffectsModule.forFeature([ClientsEffect]),
    DocumentsModule,
    PdfViewerModule,
    NgxMaskModule.forRoot()
  ],
  exports: [
    DocumentsModule,
    ClientsComponent
  ],
  providers: [ClientsService],
})
export class ClientsModule {}
