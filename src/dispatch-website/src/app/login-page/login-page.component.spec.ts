import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {FormsModule} from '@angular/forms';
import {AuthService} from '../auth.service';

import { LoginPageComponent } from './login-page.component';

describe('LoginPageComponent', () => {
  let component: LoginPageComponent;
  let fixture: ComponentFixture<LoginPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule,
      FormsModule],
      declarations: [ LoginPageComponent ],
      providers: [AuthService]
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
      spyOn(component.authservice, 'login');
      fixture.detectChanges();
    });

    it('should call the authService', () => {
      component.username = 'foo';
      component.password = 'bar';
      component.login();
      expect(component.authservice.login).toHaveBeenCalledWith('foo', 'bar');
    });
  });
});
