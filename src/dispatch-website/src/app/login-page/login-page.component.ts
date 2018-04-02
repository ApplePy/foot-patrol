import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {AuthService} from '../auth.service';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent implements OnInit {

  constructor(public router: Router, public authservice: AuthService) { }

  username: string;
  password: string;

  ngOnInit() {
    if (sessionStorage.getItem('currentUser') === 'Dispatcher') {
      this.authservice.login('John', 'Smith'); // pretend it's logging in with the dispatch credentials
      // yes this is terrible design but demo
    }
  }

  /**
   * no backend support :(
   * implemented a slimed down version of this tutorial
   * https://loiane.com/2017/08/angular-hide-navbar-login-page/
   */
  login() {
    this.authservice.login(this.username, this.password);
  }

}

