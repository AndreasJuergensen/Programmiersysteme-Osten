import { TestBed } from '@angular/core/testing';

import { InitializeArcFeedbackCalculationService } from './initialize-arc-feedback-calculation.service';

describe('InitializeArcFeedbackCalculationService', () => {
  let service: InitializeArcFeedbackCalculationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InitializeArcFeedbackCalculationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
