import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import { Router } from '@angular/router';

@Injectable()
export class AuthService {
  private loggedIn = new BehaviorSubject<boolean>(false);
  get isLoggedIn() {
    return this.loggedIn.asObservable();
  }

  private currentUser = new BehaviorSubject<boolean>(false);
  get isAdmin() {
    return this.currentUser.asObservable();
  }
  constructor(private router: Router) {

  }

  /**
   * this has been significantly reduced in scope for the purposes of the demo
   * @param username
   * @param password
   */
  login(username: string, password: string) {
    if (username === 'root' && password === 'root') {
      sessionStorage.setItem('currentUser', 'Admin');
      this.currentUser.next(true);
      this.loggedIn.next(true);
      this.router.navigateByUrl('/request-list');
    } else if (username !== '' && password !== '') {
      sessionStorage.setItem('currentUser', 'Dispatcher');
      this.currentUser.next(false);
      this.loggedIn.next(true);
      this.router.navigateByUrl('/request-list');
    }
  }

  logout() {
    this.loggedIn.next(false);
    this.router.navigateByUrl('/login');
    sessionStorage.removeItem('currentUser');
  }
}
