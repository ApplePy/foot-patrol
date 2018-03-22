import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {HttpModule} from '@angular/http';
import { AddRequestComponent } from './add-request.component';
import { Router, RouterModule } from '@angular/router';
import {RouterTestingModule} from '@angular/router/testing';
import { NgModule } from '@angular/core';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

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
    spyOn(component.ftpService, 'addRequest').and.returnValue({ subscribe: () => {} });
    spyOn(component.router, 'navigateByUrl');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('SubmitRequest()', () => {
    beforeEach(() => {
      spyOn(component, 'checkValidSubmitReq').and.returnValue(true);
      component.submitReq();
    });
    it('should call ftpService.addRequest', () => {
      expect(component.checkValidSubmitReq).toHaveBeenCalled();
      expect(component.ftpService.addRequest).toHaveBeenCalled();
    });
  });

  describe('checkValid(string)', () => {
    it('should accept inputs with no special characters', () => {
      expect(component.checkValidSubmitReq(
        'John Johnson',
        'TEB',
        'seb',
        'quickly please'
    )).toBe(true);
    expect(component.errorMsg).toBe('');
    });
    it('should accept inputs with empty optional fields', () => {
      expect(component.checkValidSubmitReq('', 'TEB', 'seb', 'quickly please')).toBe(true);
      expect(component.checkValidSubmitReq('John Johnson', 'TEB', 'seb', '')).toBe(true);
      expect(component.checkValidSubmitReq('', 'TEB', 'seb', '')).toBe(true);
      expect(component.errorMsg).toBe('');
    });

    it('should reject inputs with empty required fields', () => {
      expect(component.checkValidSubmitReq('John Johnson', '', 'seb', 'quickly please')).toBe(false);
      expect(component.checkValidSubmitReq('John Johnson', 'TEB', '', 'quickly please')).toBe(false);
      expect(component.checkValidSubmitReq('John Johnson', '', '', 'quickly please')).toBe(false);
      expect(component.errorMsg).toBe('Error: A required field is empty');
    });

    it('should reject inputs with special characters', () => {
      expect(component.checkValidSubmitReq('John J@hnson', 'TEB', 'seb', 'quickly please')).toBe(false);
      expect(component.checkValidSubmitReq('John Johnson', 'T{B', 'seb', 'quickly please')).toBe(false);
      expect(component.checkValidSubmitReq('John Johnson', 'TEB', 's&b', 'quickly please')).toBe(false);
      expect(component.checkValidSubmitReq('John Johnson', 'TEB', 'seb', 'quickl* please')).toBe(false);
      expect(component.errorMsg)
      .toBe('Error: Invalid characters detected. Remove any special characters other than "." and "," from the input fields');
    });

    it('should reject inputs with matching to and from locations', () => {
      expect(component.checkValidSubmitReq('John Johnson', 'TEB', 'teb', 'quickly please')).toBe(false);
      expect(component.errorMsg).toBe('Error: To and From locations must be different');
    });
  });
});
