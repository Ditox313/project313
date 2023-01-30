import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/services/auth.service';

@Component({
  selector: 'app-general-settings-page',
  templateUrl: './general-settings-page.component.html',
  styleUrls: ['./general-settings-page.component.css']
})
export class GeneralSettingsPageComponent implements OnInit {

  currentUser!: any;
  currentUser$: Subscription = null;

  constructor(private auth: AuthService) { }

  ngOnInit(): void {
    this.get_users();
  }

  get_users() {
    this.currentUser$ = this.auth.get_user().subscribe(user => {
      this.currentUser = user;
    })
  }

}
