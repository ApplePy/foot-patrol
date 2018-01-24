import { TestBed, inject, getTestBed, async } from '@angular/core/testing';
import { HttpModule, Http, Response, ResponseOptions, XHRBackend } from '@angular/http';
import { FtpRequestService } from './ftp-request.service';
import { MockBackend, MockConnection } from '@angular/http/testing';
import { request } from 'http';
import { HttpClient } from '@angular/common/http/src/client';
import { Component } from '@angular/core/src/metadata/directives';
import { environment } from '../environments/environment';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('FtpRequestService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {provide: XHRBackend, useClass: MockBackend},
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
    inject([FtpRequestService, XHRBackend], (service, mockBackend) => {
      const mockResponse1 = {
        request: [{
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
      mockBackend.connections.subscribe((connection) => {
        connection.mockRespond(new Response(new ResponseOptions({
          body: JSON.stringify(mockResponse1)
        })));
      });
      service.getRequests().then((requests) => {
        expect(requests.length).toBe(2);
        expect(requests[0]).toBe(mockResponse1.request[0]);
        expect(requests[1]).toBe(mockResponse1.request[1]);
      });
    }));
  });
  describe('archiveRequest(request)', () => {
    it('should be defined',
    inject([FtpRequestService], (service: FtpRequestService) => {
      expect(service.archiveRequest).toBeDefined();
    }));
  });

  describe('addRequest(request)', () => {
    it('should return a json of the sent request',
    inject([FtpRequestService, XHRBackend], (service, mockBackend) => {
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
      mockBackend.connections.subscribe((connection) => {
        connection.mockRespond(new Response(new ResponseOptions({
          body: JSON.stringify(mockResponse2)
        })));
      });
      service.addRequest(mockRequest1).then((req) => {
        expect(req.length).toBe(1);
        expect(req).toBe(mockResponse2.request);
      });
    }));
  });
});
