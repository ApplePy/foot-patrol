import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {HttpModule} from '@angular/http';
import { AddRequestComponent } from './add-request.component';
import { Router, RouterModule } from '@angular/router';
import {RouterTestingModule} from '@angular/router/testing';
import { NgModule } from '@angular/core';
import { HttpClient, HttpHandler } from '@angular/common/http';

describe('AddRequestComponent', () => {
  let component: AddRequestComponent;
  let fixture: ComponentFixture<AddRequestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpModule,
        RouterTestingModule
      ],
      declarations: [
        AddRequestComponent
      ],
      providers: [
        HttpModule,
        HttpClient,
        HttpHandler
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    spyOn(component.ftpService, 'addRequest').and.callFake(() => {
      return Promise.resolve();
    });
    spyOn(component.router, 'navigateByUrl');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('SubmitRequest()', () => {
    beforeEach(() => {
      spyOn(component, 'checkValid').and.returnValue(true);
      spyOn(component, 'checkValidExist').and.returnValue(true);
      component.submitReq();
    });
    it('should call ftpService.addRequest', () => {
      expect(component.checkValid).toHaveBeenCalledTimes(4);
      expect(component.ftpService.addRequest).toHaveBeenCalled();
    });
    it('should navigate to the request list screen after sending the request', async() => {
      expect(component.ftpService.addRequest).toHaveBeenCalled();
      fixture.whenStable().then(() => {
        expect(component.router.navigateByUrl).toHaveBeenCalled();
      });
    });
  });

  describe('checkValid(string)', () => {
    it('should accept strings with no special characters', () => {
      expect(component.checkValid('a valid string')).toBe(true);
    });
    it('should reject invalid strings', () => {
      expect(component.checkValid('*')).toBe(false);
      expect(component.checkValid('|')).toBe(false);
      expect(component.checkValid(',')).toBe(false);
      expect(component.checkValid('\"')).toBe(false);
      expect(component.checkValid(':')).toBe(false);
      expect(component.checkValid('<')).toBe(false);
      expect(component.checkValid('>')).toBe(false);
      expect(component.checkValid('[')).toBe(false);
      expect(component.checkValid(']')).toBe(false);
      expect(component.checkValid('{')).toBe(false);
      expect(component.checkValid('}')).toBe(false);
      expect(component.checkValid('`')).toBe(false);
      expect(component.checkValid('\'')).toBe(false);
      expect(component.checkValid(';')).toBe(false);
      expect(component.checkValid('(')).toBe(false);
      expect(component.checkValid(')')).toBe(false);
      expect(component.checkValid('@')).toBe(false);
      expect(component.checkValid('&')).toBe(false);
      expect(component.checkValid('$')).toBe(false);
      expect(component.checkValid('#')).toBe(false);
      expect(component.checkValid('%')).toBe(false);
    });
    it('should accept empty strings', () => {
      expect(component.checkValid('')).toBe(true);
    });
  });
});
