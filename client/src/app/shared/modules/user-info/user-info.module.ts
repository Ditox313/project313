import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserBtnComponent } from './components/user-btn/user-btn.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [
    UserBtnComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
  ],
  exports: [
    UserBtnComponent
  ]
})
export class UserInfoModule { }
