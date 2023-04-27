import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SiteLayoutComponent } from './components/site-layout/site-layout.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { UserInfoModule } from '../modules/user-info/user-info.module';



@NgModule({
  declarations: [SiteLayoutComponent],
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    UserInfoModule
  ],
  exports: [SiteLayoutComponent],
})
export class LayoutsModule {}
