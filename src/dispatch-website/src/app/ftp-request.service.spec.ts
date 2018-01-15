import { TestBed, inject } from '@angular/core/testing';
import {HttpModule} from '@angular/http';
import { FtpRequestService } from './ftp-request.service';

describe('FtpRequestService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FtpRequestService,
      HttpModule
      ],
      imports: [
        HttpModule
      ]
    });
  });

  it('should be created', inject([FtpRequestService], (service: FtpRequestService) => {
    expect(service).toBeTruthy();
  }));
});
