import { Router } from '@angular/router';
import { AfterViewInit, ViewChild, Component, ElementRef, OnInit, OnDestroy} from '@angular/core';
import { AuthService } from 'src/app/auth/services/auth.service';
import { User } from 'src/app/shared/types/interfaces';
import { Subscription } from 'rxjs';
import { MaterialService } from 'src/app/shared/services/material.service';


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

  ngAfterViewInit() {
    MaterialService.initializeFloatingButton(this.floatingRef)
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
    })
  }



  // Массив с ссылками навигации сайдбара
  links: any = [
    {
      url: '/smena-list',
      name: 'Смены',
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

  
}
