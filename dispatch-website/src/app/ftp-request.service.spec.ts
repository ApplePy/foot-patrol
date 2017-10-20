import { TestBed, inject } from '@angular/core/testing';

import { FtpRequestService } from './ftp-request.service';

describe('FtpRequestService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FtpRequestService]
    });
  });

  it('should be created', inject([FtpRequestService], (service: FtpRequestService) => {
    expect(service).toBeTruthy();
  }));
});
