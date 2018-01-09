import { TestBed, inject, getTestBed, async } from '@angular/core/testing';
import {HttpModule, Http, Response, ResponseOptions, XHRBackend} from '@angular/http';
import { FtpRequestService } from './ftp-request.service';
import {MockBackend, MockConnection} from '@angular/http/testing';
import { request } from 'http';
import { HttpClient } from '@angular/common/http/src/client';
import { Component } from '@angular/core/src/metadata/directives';
import { environment } from '../environments/environment';
import{HttpClientTestingModule} from '@angular/common/http/testing';

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

  describe('getRequests()',()=>{
    it('should return a json with an array of requests', 
    inject([FtpRequestService, XHRBackend], (service, mockBackend) => {
      const mockResponse1 = {
        request:[{
          id: 1,
          name: "name1",
          from_location: "SEB",
          to_location: "TEB",
          additional_info: "quick",
          timestamp: "10/12/2017"
        },
        {
          id: 2,
          name: "name2",
          from_location: "TEB",
          to_location: "SEB",
          additional_info: null,
          timestamp: "11/1/2017"
        }]
      };

      mockBackend.connections.subscribe((connection)=>{
        connection.mockRespond(new Response(new ResponseOptions({
          body: JSON.stringify(mockResponse1)
        })));
      });

      service.getRequests().then((requests)=>{
        expect(requests.length).toBe(2);

        expect(requests[0].id).toEqual(1);
        expect(requests[0].name).toEqual("name1");
        expect(requests[0].from_location).toEqual("SEB");
        expect(requests[0].to_location).toEqual("TEB");
        expect(requests[0].additional_info).toEqual("quick");
        expect(requests[0].timestamp).toEqual("10/12/2017");

        expect(requests[1].id).toEqual(2);
        expect(requests[1].name).toEqual("name2");
        expect(requests[1].from_location).toEqual("SEB");
        expect(requests[1].to_location).toEqual("TEB");
        expect(requests[1].additional_info).toBeNull();
        expect(requests[1].timestamp).toEqual("11/1/2017");
      });
    }));
  });
  
  describe('archiveRequest(request)',()=>{
    it('should be defined', 
    inject([FtpRequestService], (service:FtpRequestService) => {
      expect(service.archiveRequest).toBeDefined();
    }));  
  });
});
