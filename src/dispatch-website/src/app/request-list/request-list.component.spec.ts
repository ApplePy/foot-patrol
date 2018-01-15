import { async, ComponentFixture, TestBed, inject } from '@angular/core/testing';
import { NgModule } from '@angular/core';
import { RequestListComponent } from './request-list.component';
import {FormsModule} from '@angular/forms';
import {HttpModule, Http, Response, ResponseOptions, XHRBackend} from '@angular/http';
import { FtpRequestService } from '../ftp-request.service';
import {MockBackend} from '@angular/http/testing';
import 'rxjs/add/observable/of';
import { Observable } from 'rxjs/Observable';
import { resolve } from 'path';
import {Request} from '../request';

describe('RequestListComponent', () => {
  let component: RequestListComponent;
  let fixture: ComponentFixture<RequestListComponent>;
  const testRequestList: Request[] =
    [{
      id: 1,
      name: 'name1',
      from_Location: 'SEB',
      to_Location: 'TEB',
      additional_info: 'quick',
      timestamp: '2017-10-26T06:51:05.000Z',
      archived: false
    },
    {
      id: 2,
      name: 'name2',
      from_Location: 'TEB',
      to_Location: 'SEB',
      additional_info: null,
      timestamp: '2017-10-26T06:51:06.000Z',
      archived: true
    }];
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        HttpModule
      ],
      declarations: [
        RequestListComponent
      ],
      providers: [
        HttpModule
      ]
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
  describe('archive(request)', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(RequestListComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      spyOn(component.ftpRequestService, 'archiveRequest');
    });
    it('archive(request) should set request.archieved to true', () => {
      component.archive(testRequestList[0]);
      expect(testRequestList[0].archived).toBe(true);
    });
    it('archive(request) should call FtpRequestService.archiveRequest()', () => {
      component.archive(testRequestList[0]);
      expect(component.ftpRequestService.archiveRequest).toHaveBeenCalled();
    });
  });
  describe('getFPrequests()', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(RequestListComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      spyOn(component.ftpRequestService, 'getRequests').and.callFake(() => {
        return Promise.resolve(testRequestList);
      });
    });
    it('should call ftpRequestService.getRequests', () => {
      component.getFPrequests();
      expect(component.ftpRequestService.getRequests).toHaveBeenCalled();
    });
    it('should call the sort function', async() => {
      spyOn(Array.prototype, 'sort');
      component.getFPrequests();
      fixture.whenStable().then(() => {
        expect(Array.prototype.sort).toHaveBeenCalled();
      });
    });
    it('should sort the result by timestamp and store the result in displayRequests', async() => {
      component.getFPrequests();
      fixture.whenStable().then(() => {
        expect(component.displayRequests[0].timestamp).toBe(testRequestList[1].timestamp);
        expect(component.displayRequests[1].timestamp).toBe(testRequestList[0].timestamp);
      });
    });
    it('should clear the existing list of displayed requests when getting the new list', async() => {
      component.getFPrequests();
      fixture.whenStable().then(() => {
        expect(component.displayRequests.length).toEqual(2);
        component.getFPrequests();
        fixture.whenStable().then(() => {
          expect(component.displayRequests.length).toEqual(2);
        });
       });
    });
  });

  describe('comparerTimestamp', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(RequestListComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should sort in decending order', () => {
      const a = {timestamp: '4'};
      const b = {timestamp: '5'};
      const l = [a, b];
      l.sort(component.comparerTimestamp);
      expect(l[0]).toBe(b);
    });
  });
});
