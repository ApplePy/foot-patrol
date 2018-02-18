import { TestBed, inject, getTestBed, async } from '@angular/core/testing';
import { HttpModule, Http, Response, ResponseOptions } from '@angular/http';
import { FtpRequestService } from './ftp-request.service';
import { request } from 'http';
import { HttpClient } from '@angular/common/http/src/client';
import { Component } from '@angular/core/src/metadata/directives';
import { environment } from '../environments/environment';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { errorHandler } from '@angular/platform-browser/src/browser';

describe('FtpRequestService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        FtpRequestService,
        HttpModule,
      ],
      imports: [
        HttpModule,
        HttpClientTestingModule
      ]
    });
  });
  it('should be created', inject([FtpRequestService], (service: FtpRequestService) => {
    expect(service).toBeTruthy();
  }));
  describe('getRequests()', () => {
    it('should return a json with an array of requests',
    async(inject([FtpRequestService, HttpTestingController], (service: FtpRequestService, mockBackend: HttpTestingController) => {
      const mockResponse1 = {
        'request': [{
          id: 1,
          name: 'name1',
          from_location: 'SEB',
          to_location: 'TEB',
          additional_info: 'quick',
          timestamp: '10/12/2017'
        },
        {
          id: 2,
          name: 'name2',
          from_location: 'TEB',
          to_location: 'SEB',
          additional_info: null,
          timestamp: '11/1/2017'
        }]
      };
      service.getRequests().subscribe();
      const req = mockBackend.expectOne(environment.apiUrl + '/requests?offset=0&count=10');
      expect(req.request.method).toEqual('GET');
      req.flush(mockResponse1);
      mockBackend.verify();
    })));
  });
  describe('archiveRequest(request)', () => {
    it('should be defined',
    inject([FtpRequestService], (service: FtpRequestService) => {
      expect(service.archiveRequest).toBeDefined();
    }));
  });

  describe('addRequest(request)', () => {
    it('should return a json of the sent request',
    inject([FtpRequestService, HttpTestingController], (service: FtpRequestService, mockBackend: HttpTestingController) => {
      const mockResponse2 = {
        request: {
          id: 3,
          name: 'name3',
          from_location: 'TEB',
          to_location: 'SEB',
          additional_info: 'quickly',
          timestamp: '10/12/2017ZE100:234'
        }
      };
      const mockRequest1 = {
        'name': 'name3',
        'from_location': 'TEB',
        'to_location': 'SEB',
        'additional_info': 'quickly',
      };
      service.addRequest(mockRequest1).subscribe();
      const req = mockBackend.expectOne(environment.apiUrl + '/requests');
      expect(req.request.method).toEqual('POST');
      req.flush(mockRequest1);
      mockBackend.verify();
    }));
  });
});
