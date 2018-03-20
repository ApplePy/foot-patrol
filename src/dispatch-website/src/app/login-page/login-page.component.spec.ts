import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {FormsModule} from '@angular/forms';

import { LoginPageComponent } from './login-page.component';

describe('LoginPageComponent', () => {
  let component: LoginPageComponent;
  let fixture: ComponentFixture<LoginPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule,
      FormsModule],
      declarations: [ LoginPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('login', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(LoginPageComponent);
      component = fixture.componentInstance;
      spyOn(component.router, 'navigateByUrl');
      spyOn(sessionStorage, 'setItem');
      fixture.detectChanges();
    });

    it('should let in administrators', () => {
      component.username = 'root';
      component.password = 'root';
      component.login();
      expect(sessionStorage.setItem).toHaveBeenCalledWith('currentUser', 'Admin');
      expect(component.router.navigateByUrl).toHaveBeenCalledWith('/request-list');
    });
    it('should let in dispatch users', () => {
      component.username = component.users[0].username;
      component.password = component.users[0].password;
      component.login();
      expect(sessionStorage.setItem).toHaveBeenCalledWith('currentUser', 'Dispatcher');
      expect(component.router.navigateByUrl).toHaveBeenCalledWith('/request-list');
    });
    it('should block when given incorrect user information', () => {
      component.username = 'foo';
      component.password = 'bar';
      component.login();
      expect(component.errorMsg).toBe('Incorrect login information');
    });
  });
});
