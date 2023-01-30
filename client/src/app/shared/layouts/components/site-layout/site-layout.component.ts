import { Router } from '@angular/router';
import { AfterViewInit, ViewChild, Component, ElementRef, OnInit, OnDestroy} from '@angular/core';
import { AuthService } from 'src/app/auth/services/auth.service';
import { User } from 'src/app/shared/types/interfaces';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-site-layout',
  templateUrl: './site-layout.component.html',
  styleUrls: ['./site-layout.component.css'],
})

export class SiteLayoutComponent implements OnInit, OnDestroy {
  currentUser!: any;
  @ViewChild('floating') floatingRef!: ElementRef;
  subGetUser$: Subscription;

  

  // Инжектируем сервис авторизации и роутер
  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.getUser();
  }

  ngOnDestroy(): void {
    if (this.subGetUser$)
    {
      this.subGetUser$.unsubscribe();
    }
  }

  getUser()
  {
    this.subGetUser$ = this.auth.get_user().subscribe(user => {
      this.currentUser = user;

      // this.links.push({
      //   url: `/account/${this.currentUser._id}`,
      //   name: 'Настройки',
      // })
    })
  }



  // Массив с ссылками навигации сайдбара
  links: any = [
    {
      url: '/overview-page',
      name: 'Обзор',
    },
    {
      url: '/cars-page',
      name: 'Автомобили',
    },
    {
      url: '/bookings-page',
      name: 'Брони',
    },
    {
      url: '/clients-page',
      name: 'Клиенты',
    },
    {
      url: '/partners-page',
      name: 'Партнеры',
    },

    {
      url: '/general-settings',
      name: 'Настройки',
    },

  ];

  // Описываем метод выхода из системы
  logout(event: Event): void {
    // Отменяем перезагрузку страницы
    event.preventDefault();

    // Запускаем метод logout в сервисе авторизации
    this.auth.logout();

    // Делаем редирект на страницу логина
    this.router.navigate(['/login']);
  }
}
