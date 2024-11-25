import { TestBed } from '@angular/core/testing';

import { ExecuteCutService } from './execute-cut.service';

describe('ExecuteCutService', () => {
  let service: ExecuteCutService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExecuteCutService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
