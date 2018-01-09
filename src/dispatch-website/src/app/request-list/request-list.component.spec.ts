import { async, ComponentFixture, TestBed, inject } from '@angular/core/testing';
import { NgModule } from '@angular/core';
import { RequestListComponent } from './request-list.component';
import {FormsModule} from '@angular/forms';
import {HttpModule, Http, Response, ResponseOptions, XHRBackend} from '@angular/http';
import { FtpRequestService } from '../ftp-request.service';
import {MockBackend} from '@angular/http/testing';

describe('RequestListComponent', () => {
  let component: RequestListComponent;
  let fixture: ComponentFixture<RequestListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        HttpModule
      ],
      declarations: [ RequestListComponent ],
      providers: [HttpModule]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RequestListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  
});
