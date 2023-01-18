
import { Component, OnInit } from '@angular/core';
import { AuthService } from './auth/services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  // Инжектируем сервисы
  constructor(private auth: AuthService){}



  ngOnInit(){

    // Если у нас есть токен в localStorage, то мы его заносим в переменную токем в нашем сервисе auth.service
    const potentialToken = localStorage.getItem('auth-token');
    if(potentialToken !== null)
    {
      this.auth.setToken(potentialToken);
    }
  }
}
