import { TestBed, inject } from '@angular/core/testing';

import { AuthService } from './auth.service';
import { RouterTestingModule } from '@angular/router/testing';

describe('AuthService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [AuthService]
    });
  });

  it('should be created', inject([AuthService], (service: AuthService) => {
    expect(service).toBeTruthy();
  }));

  // describe('login', () => {
  //   beforeEach(() => {
  //     fixture = TestBed.createComponent(LoginPageComponent);
  //     component = fixture.componentInstance;
  //     spyOn(component.router, 'navigateByUrl');
  //     spyOn(sessionStorage, 'setItem');
  //     fixture.detectChanges();
  //   });

  //   it('should let in administrators', () => {
  //     component.username = 'root';
  //     component.password = 'root';
  //     component.login();
  //     expect(sessionStorage.setItem).toHaveBeenCalledWith('currentUser', 'Admin');
  //     expect(component.router.navigateByUrl).toHaveBeenCalledWith('/request-list');
  //   });
  //   it('should let in dispatch users', () => {
  //     // component.username = component.users[0].username;
  //     // component.password = component.users[0].password;
  //     component.login();
  //     expect(sessionStorage.setItem).toHaveBeenCalledWith('currentUser', 'Dispatcher');
  //     expect(component.router.navigateByUrl).toHaveBeenCalledWith('/request-list');
  //   });
});
