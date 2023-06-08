import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/services/auth.service';
import { MaterialService } from 'src/app/shared/services/material.service';
import { User } from 'src/app/shared/types/interfaces';
import { DatePipe } from '@angular/common';
import { SmenaService } from '../../services/smena.service';


@Component({
  selector: 'app-add-smena',
  templateUrl: './add-smena.component.html',
  styleUrls: ['./add-smena.component.css']
})
export class AddSmenaComponent implements OnInit, OnDestroy {

  form: any;

  // Получаем текущего юзера
  currentUser$: Subscription = null;
  currentUser!: User

  open_date: string = null
  open_date_time: string = null
  close_date: string = null
  close_date_time: string = null


  // Создание смены подписка
  subCreateSmena$: Subscription = null;


  constructor(
    private router: Router,
    private smenaService: SmenaService,
    private auth: AuthService,
    private datePipe: DatePipe
    ) { }

  ngOnInit(): void {
    this.initForm();
    this.get_user();
    this.moreLogicActions();
  }



  ngOnDestroy(): void {
    if (this.currentUser$) {
      this.currentUser$.unsubscribe();
    }
    if (this.subCreateSmena$) {
      this.subCreateSmena$.unsubscribe();
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
        responsible: this.currentUser.secondName + ' ' + this.currentUser.name + ' ' + this.currentUser.thirdName,
      });

      
    })
  }

  moreLogicActions()
  {
    this.open_date = this.datePipe.transform(new Date(), 'dd.MM.yyyy')
    this.open_date_time = this.datePipe.transform(new Date(), 'HH:mm:ss')
  }

  onSubmit()
  {
    const smena = {
      open_date: this.open_date,
      open_date_time: this.open_date_time,
      responsible: this.form.value.responsible,
      status: 'open',
      close_date: this.close_date,
      close_date_time: this.close_date_time,
      userId: this.currentUser._id
    }



    // Отправляем запрос
    this.subCreateSmena$ = this.smenaService.create(smena).subscribe((smena) => {
      MaterialService.toast('Смена создана');
      this.router.navigate(['/smena-list']);
    });
  }

}
