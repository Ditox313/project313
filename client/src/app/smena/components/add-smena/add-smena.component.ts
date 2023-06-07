import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/services/auth.service';
import { MaterialService } from 'src/app/shared/services/material.service';
import { AccountService } from '../../../account/services/account.service';
import { Settings, User } from 'src/app/shared/types/interfaces';
import { DatePipe } from '@angular/common';


@Component({
  selector: 'app-add-smena',
  templateUrl: './add-smena.component.html',
  styleUrls: ['./add-smena.component.css']
})
export class AddSmenaComponent implements OnInit, AfterViewInit, OnDestroy {

  form: any;

  // Получаем текущего юзера
  currentUser$: Subscription = null;
  currentUser!: User

  xs_actual_date!: any


  constructor(
    private router: Router,
    private auth: AuthService,
    private AccountService: AccountService,
    private datePipe: DatePipe
    ) { }

  ngOnInit(): void {
    this.initForm();
    this.get_user();
    this.moreLogicActions();
    
    console.log(this.xs_actual_date)
  }

  ngAfterViewInit(): void {
    
  }

  ngOnDestroy(): void {
    if (this.currentUser$) {
      this.currentUser$.unsubscribe();
    }
  }

  initForm() {
    this.form = new FormGroup({
      responsible: new FormControl('', [Validators.required]),
    });
  }

  get_user() {
    this.currentUser$ = this.auth.get_user().subscribe(res => {
      this.currentUser = res;

      this.form.patchValue({
        responsible: this.currentUser.secondName + '' + this.currentUser.name + ' ' + this.currentUser.thirdName,
      });

      console.log('User', this.currentUser)
      
    })
  }

  moreLogicActions()
  {
    this.xs_actual_date = this.datePipe.transform(new Date(), 'dd.MM.yyyy hh:mm:ss')
  }

  onSubmit()
  {
    
  }

}
