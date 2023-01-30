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
import { SettingsAvtoprokatComponent } from './components/settings-avtoprokat/settings-avtoprokat.component';
import { GeneralSettingsPageComponent } from './components/general-settings-page/general-settings-page.component';
import { GoBackModule } from '../shared/modules/ga-back/go-back.module';


const routes = [
  {
    path: '',
    component: SiteLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'account/:id', component: AccountComponent },
      { path: 'general-settings', component: GeneralSettingsPageComponent },
      { path: 'settings-avtopark/:id', component: SettingsAvtoprokatComponent },
    ],
  },
];



@NgModule({
  declarations: [
    AccountComponent,
    SettingsAvtoprokatComponent,
    GeneralSettingsPageComponent
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
    GoBackModule
  ],
  providers: [AccountService],
})
export class AccountModule { }
