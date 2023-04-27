import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { AddCarComponent } from './components/add-car/add-car.component';
import { ShowCarComponent } from './components/show-car/show-car.component';
import { CarsPageComponent } from './components/cars-page/cars-page.component';
import { CarsService } from './services/cars.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { LoaderModule } from '../shared/loader/loader.module';
import { SiteLayoutComponent } from '../shared/layouts/components/site-layout/site-layout.component';
import { LayoutsModule } from '../shared/layouts/layouts.module';

import { StoreModule } from '@ngrx/store';
import { reducers } from 'src/app/cars/store/reducers';
import { EffectsModule } from '@ngrx/effects';
import { CarsEffect } from './store/effects/cars.effect';
import { UserInfoModule } from '../shared/modules/user-info/user-info.module';


const routes = [
  {
    path: '',
    component: SiteLayoutComponent,
    canActivate: [AuthGuard], //Защищаем роуты которые относятся к самому приложению
    children: [
      { path: 'cars-page', component: CarsPageComponent },
      { path: 'add-car', component: AddCarComponent },
      { path: 'show-car/edit/:id', component: ShowCarComponent },
    ],
  },
];


@NgModule({
  declarations: [AddCarComponent, ShowCarComponent, CarsPageComponent],
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    RouterModule.forChild(routes),
    LoaderModule,
    LayoutsModule,
    StoreModule.forFeature('cars', reducers),
    EffectsModule.forFeature([CarsEffect]),
    UserInfoModule
  ],
  providers: [CarsService],
})
export class CarsModule {}
