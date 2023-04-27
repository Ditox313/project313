import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/services/auth.service';
import { User } from 'src/app/shared/types/interfaces';

@Component({
  selector: 'app-user-btn',
  templateUrl: './user-btn.component.html',
  styleUrls: ['./user-btn.component.css']
})
export class UserBtnComponent implements OnInit, OnDestroy {

  currentUser!: User;
  subGetUser$: Subscription;
  userBtnActive: boolean = false;

  constructor(private auth: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.getUser();
  }


  ngOnDestroy(): void {
    if (this.subGetUser$) {
      this.subGetUser$.unsubscribe();
    }
  }

  getUser() {
    this.subGetUser$ = this.auth.get_user().subscribe(user => {
      this.currentUser = user;
    })
  }


  logout(event: Event): void {
    // Отменяем перезагрузку страницы
    event.preventDefault();

    // Запускаем метод logout в сервисе авторизации
    this.auth.logout();

    // Делаем редирект на страницу логина
    this.router.navigate(['/login']);
  }

  btnActive()
  {
    this.userBtnActive = !this.userBtnActive
  }
}
