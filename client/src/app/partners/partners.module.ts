import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { LoaderModule } from '../shared/loader/loader.module';
import { SiteLayoutComponent } from '../shared/layouts/components/site-layout/site-layout.component';
import { LayoutsModule } from '../shared/layouts/layouts.module';
import { AuthGuard } from '../auth/guards/auth.guard';
import { PartnersComponent } from './components/partners/partners.component';
import { AddPartnerComponent } from './components/add-partner/add-partner.component';
import { ShowPartnerComponent } from './components/show-partner/show-partner.component';
import { PartnersService } from './services/partners.service';


import { StoreModule } from '@ngrx/store';
import { reducers } from 'src/app/partners/store/reducers';
import { EffectsModule } from '@ngrx/effects';
import { PartnersEffect } from './store/effects/partners.effect';


const routes = [
  {
    path: '',
    component: SiteLayoutComponent,
    canActivate: [AuthGuard], //Защищаем роуты которые относятся к самому приложению
    children: [
      { path: 'partners-page', component: PartnersComponent },
      { path: 'add-partner', component: AddPartnerComponent },
      { path: 'show-partner/edit/:id', component: ShowPartnerComponent },
    ],
  },
];

@NgModule({
  declarations: [AddPartnerComponent, ShowPartnerComponent, PartnersComponent],
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    RouterModule.forChild(routes),
    LoaderModule,
    LayoutsModule,
    StoreModule.forFeature('partners', reducers),
    EffectsModule.forFeature([PartnersEffect]),
  ],
  providers: [PartnersService],
})
export class PartnersModule {}
