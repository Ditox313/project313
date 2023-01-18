import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/services/auth.service';
import { MaterialService } from 'src/app/shared/services/material.service';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent implements OnInit, OnDestroy {
  currentUser!: any;
  form!: FormGroup; 
  subUpdate$: Subscription = null;
  currentUser$: Subscription = null;



  constructor(private auth: AuthService) { }
  ngOnInit(): void {
    this.initionalForm();
    this.patchValuesForm();
    MaterialService.updateTextInputs();
  }

  ngOnDestroy(): void {
    if (this.subUpdate$ !== null)
    {
      this.subUpdate$.unsubscribe();
    }
    if (this.currentUser$ !== null) {
      this.currentUser$.unsubscribe();
    }
  }


  patchValuesForm()
  {
    this.currentUser$ = this.auth.get_user().subscribe(user => {
      this.currentUser = user;

      this.form.patchValue({
        email: user.email,
        name: user.name,
        secondName: user.secondName,
        thirdName: user.thirdName,
        doverenost: user.doverenost,
        doverenostDate: user.doverenostDate,
      });
    })
  }


  initionalForm()
  {
    this.form = new FormGroup({
      email: new FormControl(null, [Validators.required, Validators.email]),
      password: new FormControl(null, [
        Validators.minLength(6),
      ]),
      name: new FormControl(null, [Validators.required]),
      secondName: new FormControl(null, [Validators.required]),
      thirdName: new FormControl(null, [Validators.required]),
      doverenost: new FormControl(null, [Validators.required]),
      doverenostDate: new FormControl(null, [Validators.required]),
    });
  }

  onSubmitProfile() {
    
    const user = {
      name: this.form.value.name,
      secondName: this.form.value.secondName,
      thirdName: this.form.value.thirdName,
      email: this.form.value.email,
      password: this.form.value.password,
      doverenost: this.form.value.doverenost,
      doverenostDate: this.form.value.doverenostDate,
    };

    this.subUpdate$ = this.auth.update(user).subscribe((res) => {
        this.form.patchValue({
          email: res.email,
          secondName: res.secondName,
          thirdName: res.thirdName,
          doverenost: res.doverenost,
          name: res.name,
          doverenostDate: res.doverenostDate,
        });

        MaterialService.toast('Данные изменены');
    });
  }

}
