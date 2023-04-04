import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchClientComponent } from './components/search-client/search-client.component';



@NgModule({
  declarations: [
    SearchClientComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    SearchClientComponent
  ]
})
export class SearchClientModule { }
