import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { MaterialService } from 'src/app/shared/services/material.service';
import { AuthService } from '../../services/auth.service';
import { Store, select } from '@ngrx/store';
import { registerAction } from '../../store/actions/register.action';
// import {isSubmittingSelector,} from 'src/app/auth/store/selectors';


@Component({
  selector: 'app-register-page',
  templateUrl: './register-page.component.html',
  styleUrls: ['./register-page.component.css'],
})
export class RegisterPageComponent implements OnInit {
  form!: FormGroup; 

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private store: Store
  ) {}

 
  ngOnInit(): void {
    this.initForm();
    // Получаем данные из store
    // this.isSubmitting$ = this.store.pipe(select(isSubmittingSelector))
  }

  initForm()
  {
    this.form = new FormGroup({
      email: new FormControl(null, [Validators.required, Validators.email]),
      password: new FormControl(null, [
        Validators.required,
        Validators.minLength(6),
      ]),
    });
  }

  
 
  onSubmit(): void {
    this.form.disable();

    const user = {
      email: this.form.value.email,
      password: this.form.value.password,
    };

    this.store.dispatch(registerAction({ user }));
    this.form.enable();

    // Выполняме метод auth.register из сервиса auth.service и в случае успеха делаем редирект на логин и обрабатываем ошибку
    // this.uSub = this.auth.register(user).subscribe(
    //   () =>
    //     this.router.navigate(['/login'], {
    //       queryParams: {
    //         registered: true,
    //       },
    //     }),
    //   (error) => {
    //     MaterialService.toast(error.error.message);
    //     console.warn(error);
    //     this.form.enable();
    //   }
    // );
  }
}


