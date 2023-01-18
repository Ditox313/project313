import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { LoaderModule } from '../shared/loader/loader.module';
import { AuthGuard } from '../auth/guards/auth.guard';
import { OverviewPageComponent } from './components/overview-page/overview-page.component';
import { LayoutsModule } from '../shared/layouts/layouts.module';
import { SiteLayoutComponent } from '../shared/layouts/components/site-layout/site-layout.component';


const routes = [
  {
    path: '',
    component: SiteLayoutComponent,
    canActivate: [AuthGuard], //Защищаем роуты которые относятся к самому приложению
    children: [
      {
        path: 'overview-page',
        component: OverviewPageComponent,
      },
    ],
  },
];

@NgModule({
  declarations: [OverviewPageComponent],
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
})
export class DashboardModule {}
