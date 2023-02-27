import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/services/auth.service';
import { MaterialService } from 'src/app/shared/services/material.service';
import { AccountService } from '../../services/account.service';


@Component({
  selector: 'app-settings-avtoprokat',
  templateUrl: './settings-avtoprokat.component.html',
  styleUrls: ['./settings-avtoprokat.component.css']
})
export class SettingsAvtoprokatComponent implements OnInit, OnDestroy {

  currentUser!: any;
  form!: FormGroup;
  currentUserSetings$: Subscription = null;
  currentUser$: Subscription = null;
  settings_avtoprokat$: Subscription = null;

  constructor(private AccountService: AccountService, private auth: AuthService) { }

  ngOnInit(): void {
    this.initionalForm();
    this.patchValuesForm();
  }

  ngOnDestroy(): void {
    if (this.settings_avtoprokat$ !== null) {
      this.settings_avtoprokat$.unsubscribe();
    }
    if (this.currentUser$ !== null) {
      this.currentUser$.unsubscribe();
    }
    if (this.currentUserSetings$ !== null) {
      this.currentUserSetings$.unsubscribe();
    }
  }


  initionalForm() {
    this.form = new FormGroup({
      airport_price: new FormControl(null, []),
      railway_price: new FormControl(null, []),
      kristal_tc_price: new FormControl(null, []),
      sitymol_tc_price: new FormControl(null, []),
      moyka_komfort: new FormControl(null, []),
      moyka_business: new FormControl(null, []),
      moyka_premium: new FormControl(null, []),
      additionally_det_kreslo: new FormControl(null, []),
      additionally_buster: new FormControl(null, []),
      additionally_videoregister: new FormControl(null, []),
      additionally_battery_charger: new FormControl(null, []),
      additionally_antiradar: new FormControl(null, []),
    });
  }


  patchValuesForm() {
    this.currentUser$ = this.auth.get_user().subscribe(user => {
      this.currentUser = user;


      this.currentUserSetings$ = this.AccountService.get_settings_user(user._id).subscribe(res => {
       this.form.patchValue({
        airport_price: res.share_avto.airport_price,
        railway_price: res.share_avto.railway_price,
        kristal_tc_price: res.share_avto.kristal_tc_price,
        sitymol_tc_price: res.share_avto.sitymol_tc_price,
        moyka_komfort: res.washing_avto.komfort,
        moyka_business: res.washing_avto.business,
        moyka_premium: res.washing_avto.premium,
        additionally_det_kreslo: res.additionally_avto.det_kreslo,
        additionally_buster: res.additionally_avto.buster,
        additionally_videoregister: res.additionally_avto.videoregister,
        additionally_battery_charger: res.additionally_avto.battery_charger,
        additionally_antiradar: res.additionally_avto.antiradar,
      });
        
      })

      
    })
  }


  submit()
  {
    const settings_avtoprokat = {
      share_avto: {
        airport_price: this.form.value.airport_price,
        railway_price: this.form.value.railway_price,
        kristal_tc_price: this.form.value.kristal_tc_price,
        sitymol_tc_price: this.form.value.sitymol_tc_price,
      },
      washing_avto: {
        komfort: this.form.value.moyka_komfort,
        business: this.form.value.moyka_business,
        premium: this.form.value.moyka_premium,
      },
      additionally_avto: {
        det_kreslo: this.form.value.additionally_det_kreslo,
        buster: this.form.value.additionally_buster,
        videoregister: this.form.value.additionally_videoregister,
        battery_charger: this.form.value.additionally_battery_charger,
        antiradar: this.form.value.additionally_antiradar,
      }
    };

    this.settings_avtoprokat$ = this.AccountService.update_settings(settings_avtoprokat).subscribe((res) => {

      this.form.patchValue({
        airport_price: res.share_avto.airport_price,
        railway_price: res.share_avto.railway_price,
        kristal_tc_price: res.share_avto.kristal_tc_price,
        sitymol_tc_price: res.share_avto.sitymol_tc_price,
        moyka_komfort: res.washing_avto.komfort,
        moyka_business: res.washing_avto.business,
        moyka_premium: res.washing_avto.premium,
        additionally_det_kreslo: res.additionally_avto.det_kreslo,
        additionally_buster: res.additionally_avto.buster,
        additionally_videoregister: res.additionally_avto.videoregister,
        additionally_battery_charger: res.additionally_avto.battery_charger,
        additionally_antiradar: res.additionally_avto.antiradar,
      });

      MaterialService.toast('Данные изменены');
    });
  }

}
