import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddDogovorComponent } from './components/add-dogovor/add-dogovor.component';



@NgModule({
  declarations: [
    AddDogovorComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    AddDogovorComponent
  ]
})
export class AddDogovorForClientModule { }
