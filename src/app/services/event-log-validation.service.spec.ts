import { TestBed } from '@angular/core/testing';

import { EventLogValidationService } from './event-log-validation.service';

describe('EventLogValidationService', () => {
  let service: EventLogValidationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EventLogValidationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
