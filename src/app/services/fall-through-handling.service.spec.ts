import { TestBed } from '@angular/core/testing';

import { FallThroughHandlingService } from './fall-through-handling.service';

describe('FallThroughHandlingService', () => {
  let service: FallThroughHandlingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FallThroughHandlingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
