import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { LoaderModule } from '../shared/loader/loader.module';
import { AuthGuard } from '../auth/guards/auth.guard';
import { SiteLayoutComponent } from '../shared/layouts/components/site-layout/site-layout.component';
import { LayoutsModule } from '../shared/layouts/layouts.module';
import { GoBackModule } from '../shared/modules/ga-back/go-back.module';
import { SmenaListComponent } from './components/smena-list/smena-list.component';
import { AddSmenaComponent } from './components/add-smena/add-smena.component';
import { SmenaService } from './services/smena.service';



const routes = [
  {
    path: '',
    component: SiteLayoutComponent,
    canActivate: [AuthGuard], //Защищаем роуты которые относятся к самому приложению
    children: [
      { path: 'smena-list', component: SmenaListComponent },
      { path: 'add-smena', component: AddSmenaComponent },
    ],
  },
];


@NgModule({
  declarations: [
    SmenaListComponent,
    AddSmenaComponent
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
  providers: [SmenaService],
})
export class SmenaModule { }
