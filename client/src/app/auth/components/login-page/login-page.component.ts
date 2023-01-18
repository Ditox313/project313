import { ActivatedRoute, Params, Router } from '@angular/router';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { MaterialService } from 'src/app/shared/services/material.service';
import { Store } from '@ngrx/store';
import { loginAction } from '../../store/actions/login.action';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css'],
})
export class LoginPageComponent implements OnInit, OnDestroy {
  form!: FormGroup; 
  uSub!: Subscription; 

  
  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private store: Store
  ) {}

  ngOnInit(): void {
    
    this.initionalForm();
    this.getParams();
    
  }

  initionalForm()
  {
    this.form = new FormGroup({
      email: new FormControl(null, [Validators.required, Validators.email]),
      password: new FormControl(null, [
        Validators.required,
        Validators.minLength(6),
      ]),
    });
  }


  getParams()
  {
    this.route.queryParams.subscribe(function (params: Params) {
      if (params['registered']) {
        MaterialService.toast(
          'Теперь вы можете зайти в систему используя свои данные'
        );
      } else if (params['accessDenied']) {
        MaterialService.toast('Сначала авторизируйтесь в системе');
      } else if (params['sessionFailed']) {
        MaterialService.toast('Пожалуйста войдите в систему заново');
      }
    });
  }


  ngOnDestroy() {
    if (this.uSub) {
      this.uSub.unsubscribe();
    }
  }


  onSubmit(): void {
    this.form.disable();

   
    const user = {
      email: this.form.value.email,
      password: this.form.value.password,
    };

    this.store.dispatch(loginAction({ user }));
    this.form.enable();

    // Когда auth.login(из сервиса auth.service) успешно отработает(как промис), перенаправляем на нужную страницу и обрататываем ошибку
    // this.uSub = this.auth.login(user).subscribe(
    //   () => this.router.navigate(['/cars-page']), //Нужно создать данный компонет, иначе будет ошибка
    //   (error) => {
    //     // Запускам метод отображения ошибки materialyze
    //     MaterialService.toast(error.error.message);
    //     this.form.enable();
    //   }

    // )
  }
}
