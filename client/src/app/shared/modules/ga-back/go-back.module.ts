import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoBackComponent } from './components/go-back/go-back.component';
import { RouterModule } from '@angular/router';


@NgModule({
  declarations: [GoBackComponent],
  imports: [
    CommonModule
  ],
  exports: [
    GoBackComponent
  ]
})
export class GoBackModule { }
