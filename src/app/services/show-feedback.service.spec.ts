import { TestBed } from '@angular/core/testing';

import { ShowFeedbackService } from './show-feedback.service';

describe('ShowFeedbackService', () => {
  let service: ShowFeedbackService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ShowFeedbackService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
