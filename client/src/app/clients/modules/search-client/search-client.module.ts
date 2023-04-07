import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchClientComponent } from './components/search-client/search-client.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    SearchClientComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  exports: [
    SearchClientComponent
  ]
})
export class SearchClientModule { }
