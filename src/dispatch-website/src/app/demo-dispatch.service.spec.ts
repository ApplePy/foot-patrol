import { TestBed, inject } from '@angular/core/testing';

import { DemoDispatchService } from './demo-dispatch.service';

describe('DemoDispatchService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DemoDispatchService]
    });
  });

  it('should be created', inject([DemoDispatchService], (service: DemoDispatchService) => {
    expect(service).toBeTruthy();
  }));
});
