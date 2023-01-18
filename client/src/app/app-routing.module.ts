import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';


// Массив наших роутов. Роуты делим на layouts
const routes: Routes = [
  
];

@NgModule({
  
  imports: [
    RouterModule.forRoot(routes)  // Импортируем модуль для регистрации наших роутов
  ],
  
  exports: [
    RouterModule    // Возвращаем модуль уже сконфигурированный с зарегистрированными роутами
  ]
})
export class AppRoutingModule { }
