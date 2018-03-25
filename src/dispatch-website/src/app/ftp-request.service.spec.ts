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

const testURL = environment.apiUrl;

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
          pairing: null,
          timestamp: '10/12/2017'
        },
        {
          id: 2,
          name: 'name2',
          from_location: 'TEB',
          to_location: 'SEB',
          additional_info: null,
          pairing: null,
          timestamp: '11/1/2017'
        }]
      };
      service.getRequests().subscribe();
      const req = mockBackend.expectOne(testURL + '/requests?offset=0&count=10');
      expect(req.request.method).toEqual('GET');
      req.flush(mockResponse1);
      mockBackend.verify();
    })));
  });
  describe('archiveRequest(request)', () => {
    it('should send a patch request to the server',
    inject([FtpRequestService, HttpTestingController], (service: FtpRequestService, mockBackend: HttpTestingController) => {
      expect(service.archiveRequest).toBeDefined();
      const mockRequest3 = {
        id: 1,
        name: 'name1',
        from_location: 'SEB',
        to_location: 'TEB',
        additional_info: 'quick',
        timestamp: '2017-10-26T06:51:05.000Z',
        archived: false,
        pairing: null,
        status: 'assigned'
      };
      service.archiveRequest(mockRequest3).subscribe();
      const req = mockBackend.expectOne(testURL + '/requests' + '/' + mockRequest3.id);
      expect(req.request.method).toEqual('PATCH');
      req.flush(mockRequest3);
      mockBackend.verify();
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
          pairing: null,
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
      const req = mockBackend.expectOne(testURL + '/requests');
      expect(req.request.method).toEqual('POST');
      req.flush(mockRequest1);
      mockBackend.verify();
    }));
  });
});
