import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent implements OnInit {

  errorMsg: string;
  users: User[];
  username: string;
  password: string;

  constructor(public router: Router) { }

  ngOnInit() {
    this.users = [{
      username: 'Rowan',
      password: 'Collier'
    }, {
      username: 'Darryl',
      password: 'Murray'
    }, {
      username: 'Kian',
      password: 'Paliani'
    }, {
      username: 'Michael',
      password: 'Romao'
    }];
  }

  /**
   * no backend support :(
   * run shittyHack.exe
   */
  login() {
    let found = false;
    if (this.username === 'root' && this.password === 'root') {
      sessionStorage.setItem('currentUser', 'Admin');
      this.router.navigateByUrl('/request-list');
    } else {
      for (let i = 0; i < this.users.length; i++) {
        if (this.users[i].username === this.username && this.users[i].password === this.password) {
          sessionStorage.setItem('currentUser', 'Dispatcher');
          found = true;
          break;
        }
      }
      if (found) {
        this.errorMsg = '';
        this.router.navigateByUrl('/request-list');
      } else {
        this.errorMsg = 'Incorrect login information';
      }
    }
  }

}

class User {
  username: string;
  password: string;
}
