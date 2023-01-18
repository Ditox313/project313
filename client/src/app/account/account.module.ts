import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { LoaderModule } from '../shared/loader/loader.module';
import { LayoutsModule } from '../shared/layouts/layouts.module';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AccountComponent } from './components/account/account.component';
import { SiteLayoutComponent } from '../shared/layouts/components/site-layout/site-layout.component';
import { AccountService } from './services/account.service';


const routes = [
  {
    path: '',
    component: SiteLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'account/:id', component: AccountComponent },
    ],
  },
];



@NgModule({
  declarations: [
    AccountComponent
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
  providers: [AccountService],
})
export class AccountModule { }
